'use client';
import SocialLogin from '@/components/social-login';
import { login } from './actions';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { PASSWORD_MIN_LENGTH } from '@/lib/constants';
import { useActionState } from 'react';

export default function Login() {
  const [state, action] = useActionState(login, null);
  return (
    <div className='flex flex-col gap-10 py-8 px-6'>
      <div className='flex flex-col gap-2 *:font-medium'>
        <h1 className='text-2xl'>Hello!</h1>
        <h2 className='text-xl'>Log in with email and password.</h2>
      </div>
      <form action={action} className='flex flex-col gap-3'>
        <Input
          name='email'
          type='email'
          placeholder='Email'
          required
          errors={state?.fieldErrors.email}
        />
        <Input
          name='password'
          type='password'
          placeholder='Password'
          required
          errors={state?.fieldErrors.password}
          minLength={PASSWORD_MIN_LENGTH}
        />

        <Button text='Login' />
      </form>
      <SocialLogin />
    </div>
  );
}
