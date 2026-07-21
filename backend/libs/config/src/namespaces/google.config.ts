import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  scopes: process.env.GOOGLE_OAUTH_SCOPES ?? 'openid profile email',
  frontendCallbackUrl:
    process.env.GOOGLE_FRONTEND_CALLBACK_URL ??
    'http://localhost:5173/auth/google-callback',
}));
