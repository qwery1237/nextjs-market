import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface ISession {
  id?: number;
}

export async function getSession() {
  return getIronSession<ISession>(await cookies(), {
    cookieName: 'delicious-karrot',
    password: process.env.COOKIE_PASSWORD!,
  });
}
export async function saveSassionIdAndRedirect(
  userId: number,
  redirectUrl: string
) {
  const session = await getSession();
  session.id = userId;
  await session.save();
  return redirect(redirectUrl);
}
