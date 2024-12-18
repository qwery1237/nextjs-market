'use client';
import { ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';

interface BtnProps {
  text: string;
}
export default function Button({
  text,
  ...rest
}: BtnProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className='primary-btn h-10 disabled:bg-neutral-400 disabled:text-neutral-300 disabled:cursor-not-allowed'
      {...rest}
    >
      {pending ? 'Loading...' : text}
    </button>
  );
}
