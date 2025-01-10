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

const checkUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  return !user;
};
const checkEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  return !user;
};
const checkPasswords = ({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) => password === confirmPassword;
const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: 'Username must be a string!',
        required_error: 'Where is my username???',
      })
      .toLowerCase()
      .trim()
      .refine(checkUsername, 'This username is already taken!'),
    email: z
      .string()
      .email()
      .toLowerCase()
      .refine(checkEmail, 'This email is already taken!'),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH)
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirmPassword: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .refine(checkPasswords, {
    message: 'Both passwords should be the same!',
    path: ['confirmPassword'],
  });
export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };
  const {
    success,
    error,
    data: result,
  } = await formSchema.safeParseAsync(data);
  if (!success) {
    return error.flatten();
  } else {
    const hashedPassword = await bcrypt.hash(result.password, 12);
    const user = await db.user.create({
      data: {
        username: result.username,
        email: result.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
    await saveSassionIdAndRedirect(user.id, '/profile');
    return;
  }
}
