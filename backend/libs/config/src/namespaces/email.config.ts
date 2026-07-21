import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST ?? 'localhost',
  port: parseInt(process.env.MAIL_PORT ?? '1025', 10),
  user: process.env.MAIL_USER || undefined,
  password: process.env.MAIL_PASSWORD || undefined,
  from: process.env.MAIL_FROM ?? 'LoadService <hovatenlavnb@gmail.com>',
  secure: process.env.MAIL_SECURE === 'true',
  resetPasswordUrl:
    process.env.MAIL_RESET_PASSWORD_URL ??
    'http://localhost:5173/forgot-password',
  verifyEmailUrl:
    process.env.MAIL_VERIFY_EMAIL_URL ?? 'http://localhost:5173/verify-email',
  verifyEmailCallbackUrl:
    process.env.MAIL_VERIFY_EMAIL_CALLBACK_URL ??
    'http://localhost:5173/verify-email',
}));
