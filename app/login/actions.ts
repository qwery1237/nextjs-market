'use server';

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from '@/lib/constants';
import db from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { saveSassionIdAndRedirect } from '@/lib/session';

const checkEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return !!user;
};

const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(checkEmail, 'An account with this email does not exist.'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export const login = async (prevState: any, formData: FormData) => {
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const {
    success,
    error,
    data: result,
  } = await formSchema.safeParseAsync(data);

  if (!success) {
    return error.flatten();
  } else {
    console.log(1);

    const user = await db.user.findUnique({
      where: { email: result.email },
      select: {
        id: true,
        password: true,
      },
    });

    const passwordOk = await bcrypt.compare(
      result.password,
      user!.password ?? 'xxxx'
    );
    if (passwordOk) {
      await saveSassionIdAndRedirect(user!.id, '/profile');
      return;
    } else {
      return {
        fieldErrors: {
          email: [],
          password: ['Wrong Password!'],
        },
      };
    }
  }
};
