import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    serialize('token', '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
    })
  );
  res.status(200).json({ message: 'Logged out' });
}