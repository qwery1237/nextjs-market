'use client';
import SocialLogin from '@/components/social-login';
import { createAccount } from './actions';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants';
import { useActionState } from 'react';

export default function CreateAccount() {
  const [state, dispatch] = useActionState(createAccount, null);
  return (
    <div className='flex flex-col gap-10 py-8 px-6'>
      <div className='flex flex-col gap-2 *:font-medium'>
        <h1 className='text-2xl'>Hello!</h1>
        <h2 className='text-xl'>Fill in the form below to join!</h2>
      </div>
      <form action={dispatch} className='flex flex-col gap-3'>
        <Input
          name='username'
          type='text'
          placeholder='Username'
          errors={state?.fieldErrors.username}
          required
          minLength={3}
          maxLength={10}
        />
        <Input
          name='email'
          type='email'
          placeholder='Email'
          errors={state?.fieldErrors.email}
          required
        />
        <Input
          name='password'
          type='password'
          placeholder='Password'
          errors={state?.fieldErrors.password}
          required
          minLength={PASSWORD_MIN_LENGTH}
        />
        <Input
          name='confirmPassword'
          type='password'
          placeholder='Confirm Password'
          errors={state?.fieldErrors.confirmPassword}
          required
          minLength={PASSWORD_MIN_LENGTH}
        />
        <Button text='Create account' />
      </form>
      <SocialLogin />
    </div>
  );
}
