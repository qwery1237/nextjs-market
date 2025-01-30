'use server';
import crypto from 'crypto';
import { z } from 'zod';
import validator from 'validator';
import db from '@/lib/db';
import { saveSassionIdAndRedirect } from '@/lib/session';
import twilio from 'twilio';

const phoneSchema = z
  .string()
  .trim()
  .refine((phone) => validator.isMobilePhone(phone), 'Wrong phone format');

const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, 'This token does not exist');

export interface ActionState {
  token: boolean;
  phone?: string;
}
async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return getToken();
  }
  return token;
}
async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });
  return !!exists;
}

export async function smsLogin(prevState: ActionState, formData: FormData) {
  const phone = formData.get('phoneNumber');
  const token = formData.get('token');

  if (!prevState.token) {
    const { success, error, data } = phoneSchema.safeParse(phone);
    if (!success) {
      return { token: false, error: error.flatten() };
    } else {
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: data,
          },
        },
      });
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,
          phone: data,
          user: {
            connectOrCreate: {
              where: {
                phone: data,
              },
              create: {
                username: crypto.randomBytes(10).toString('hex'),
                phone: data,
              },
            },
          },
        },
      });
      // const client = twilio(
      //   process.env.TWILIO_SID,
      //   process.env.TWILIO_AUTH_TOKEN
      // );
      // await client.messages.create({
      //   body: `Your Karrot verification code is: ${token}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: process.env.TWILIO_VERIFIED_PHONE_NUMBER!,
      // });
      return {
        token: true,
        phone,
      };
    }
  } else {
    const { success, error, data } = await tokenSchema.spa(token);
    if (!success) {
      return {
        token: true,
        phone: prevState.phone,
        error: error.flatten(),
      };
    } else {
      const token = await db.sMSToken.findUnique({
        where: {
          token: data.toString(),
        },
        select: {
          id: true,
          userId: true,
          phone: true,
        },
      });
      if (token!.phone !== prevState.phone) {
        return {
          token: true,
          phone: prevState.phone,
          error: {
            formErrors: ['This token is invalid.'],
          },
        };
      }
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        },
      });
      await saveSassionIdAndRedirect(token!.userId, '/profile');
      return {
        token: false,
        phone: '',
      };
    }
  }
}
