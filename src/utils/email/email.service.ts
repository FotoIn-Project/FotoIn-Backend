import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fajrulichsan0208@gmail.com',  //TODO pindah ke .env
      pass: 'xoty evqi sghp uxtj' 
    }
  });

  public async sendVerificationEmail(email: string, token: string): Promise<void> {
    const subject = 'Account Verification';
    const verificationLink = `${process.env.BASE_URL}/verify?token=${token}`;
    const html = `<p>Click the following link to verify your account:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`;

    await this.sendEmail(email, subject, html);
  }

  public async sendEmailForgotPassword(email: string, token: string): Promise<void> {
    const subject = 'Forgot Password';
    const verificationLink = `${process.env.BASE_URL}/forgot-password?token=${token}`;
    const html = `<p>Click the following link to change your password:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`;

    await this.sendEmail(email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: 'eurekademy@gmail.com',
      to,
      subject,
      html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to} successfully.`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
