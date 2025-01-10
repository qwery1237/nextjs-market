import Link from 'next/link';

export default function EmailExist() {
  return (
    <div className='h-screen flex flex-col justify-center p-6 gap-12 items-center'>
      <h2 className='text-2xl font-semibold w-full text-center'>
        This email is already linked to an existing account
      </h2>
      <div className='text-center px-12'>
        <p>
          The email address associated with your GitHub account is already
          registered with another account.
        </p>
        <p>
          Please use a different email address or log in with your existing
          account.
        </p>
      </div>
      <Link href='/' className='primary-btn py-2.5 text-lg w-48'>
        Go to Home
      </Link>
    </div>
  );
}
