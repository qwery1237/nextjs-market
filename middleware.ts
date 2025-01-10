import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './lib/session';

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  '/': true,
  '/login': true,
  '/sms': true,
  '/create-account': true,
  '/github/start': true,
  '/github/complete': true,
  '/github/email-exist': true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const isPublicURL = publicOnlyUrls[request.nextUrl.pathname];

  if (!session.id && !isPublicURL) {
    return NextResponse.redirect(new URL('/', request.url));
  } else if (session.id && isPublicURL) {
    return NextResponse.redirect(new URL('/products', request.url));
  }
}
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
