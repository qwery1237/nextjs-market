'use server';
import { z } from 'zod';
import validator from 'validator';
import { redirect } from 'next/navigation';

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, 'ko-KR'),
    'Wrong phone format'
  );

const tokenSchema = z.coerce.number().min(100000).max(999999);

export interface ActionState {
  token: boolean;
}

export async function smsLogin(prevState: ActionState, formData: FormData) {
  const phone = formData.get('phoneNumber');
  const token = formData.get('token');
  console.log(prevState);

  if (!prevState.token) {
    const { success, error } = phoneSchema.safeParse(phone);
    if (!success) {
      return { token: false, error: error.flatten() };
    } else {
      return {
        token: true,
      };
    }
  } else {
    const { success, error } = tokenSchema.safeParse(token);
    if (!success) {
      return {
        token: true,
        error: error.flatten(),
      };
    } else {
      redirect('/');
    }
  }
}
