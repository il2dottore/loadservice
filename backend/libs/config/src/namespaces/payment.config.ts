import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  sepayHmacSha256Key: process.env.SEPAY_HMAC_SHA256_KEY,
  qrCodeBank: process.env.QR_CODE_BANK,
  qrCodeAccount: process.env.QR_CODE_ACCOUNT,
  qrCodeHolder: process.env.QR_CODE_HOLDER,
  qrCodeGenApi: process.env.QR_CODE_GEN_API,
}));
