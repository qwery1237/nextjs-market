import db from '@/lib/db';
import { saveSassionIdAndRedirect } from '@/lib/session';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

interface ITokenData {
  error?: string;
  access_token: string;
}
interface IEmailData {
  email: string;
}
interface IProfileData {
  id: number;
  avatar_url: string;
  login: string;
}

const getAccessToken = async (code: string) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${params}`;

  const accessTokenResponse = await fetch(accessTokenURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  });

  return await accessTokenResponse.json();
};
const getGithubEmail = async (access_token: string) => {
  const userEmailResponse = await fetch('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-cache',
  });
  const userEmailData = await userEmailResponse.json();
  return userEmailData[0];
};
const getGithubProfile = async (access_token: string) => {
  const userProfileResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-cache',
  });
  return await userProfileResponse.json();
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return new Response(null, {
      status: 400,
    });
  }

  const { error, access_token }: ITokenData = await getAccessToken(code);
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }

  const githubEmail: IEmailData = await getGithubEmail(access_token);

  const userEmail = await db.user.findUnique({
    where: {
      email: githubEmail.email,
    },
    select: {
      email: true,
    },
  });

  if (userEmail) {
    return redirect('/github/email-exist');
  }

  const { id, avatar_url, login }: IProfileData = await getGithubProfile(
    access_token
  );

  const user = await db.user.findUnique({
    where: {
      github_id: id + '',
    },
    select: {
      id: true,
    },
  });
  if (user) {
    return await saveSassionIdAndRedirect(user.id, '/profile');
  }
  const username = await db.user.findUnique({
    where: {
      username: login,
    },
    select: {
      username: true,
    },
  });
  const newUser = await db.user.create({
    data: {
      username: username ? login + '-gh' : login,
      github_id: id + '',
      avatar: avatar_url,
      email: githubEmail.email,
    },
    select: {
      id: true,
    },
  });
  return await saveSassionIdAndRedirect(newUser.id, '/profile');
}
