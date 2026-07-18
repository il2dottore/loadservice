import { Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import emailConfig from '@app/config/namespaces/email.config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  constructor(@Inject(emailConfig.KEY) private readonly config: ConfigType<typeof emailConfig>) {}

  private transporter() {
    return nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: { user: this.config.user, pass: this.config.password },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const transporter = this.transporter();
    const base = this.config.resetPasswordUrl;
    const url = `${base}?token=${encodeURIComponent(token)}`;
    await transporter.sendMail({
      from: this.config.from || this.config.user,
      to: email,
      subject: 'Reset your DarkService password',
      text: `Reset your password using this link: ${url}`,
      html: `<p>Reset your DarkService password:</p><p><a href="${url}">Reset password</a></p>`,
    });
  }

  async sendWelcome(email: string) {
    const transporter = this.transporter();
    await transporter.sendMail({
      from: this.config.from || this.config.user,
      to: email,
      subject: 'Welcome to DarkService',
      text: 'Your DarkService account has been created successfully.',
      html: '<p>Your DarkService account has been created successfully.</p>',
    });
  }

  async sendEmailVerification(email: string, token: string) {
    const transporter = this.transporter();
    const base = this.config.verifyEmailUrl;
    const url = `${base}?token=${encodeURIComponent(token)}`;
    await transporter.sendMail({
      from: this.config.from || this.config.user,
      to: email,
      subject: 'Verify your DarkService email',
      text: `Verify your email: ${url}`,
      html: `<p>Verify your DarkService email:</p><p><a href="${url}">Verify email</a></p>`,
    });
  }
}
