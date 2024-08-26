import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'officialfotoin@gmail.com',  //TODO pindah ke .env
      pass: 'jjwi jnnu nbzn jopy' 
    }
  });

  public async sendVerificationEmail(email: string, verifiedCode: number): Promise<void> {
    const subject = 'Account Verification';
    const html = `<p>verification code ${verifiedCode}</p>`;
    await this.sendEmail(email, subject, html);
  }

  public async sendEmailForgotPassword(email: string, token: number): Promise<void> {
    const subject = 'Forgot Password';
    const html = `<p>Forgot Password Token : ${token}</p>`;

    await this.sendEmail(email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: 'officialfotoin@gmail.com',
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
