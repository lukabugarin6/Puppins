// puppins-backend/src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Kreiraj transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true za 465, false za druge portove
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, firstName: string) {
    const verificationUrl = `puppins://auth/verify-email?token=${token}`;

    // Prověri da li je development mode
    // const isDevelopment = process.env.NODE_ENV !== 'production';

    // if (isDevelopment) {
    //   // Mock za development
    //   console.log('\n📧 ========== MOCK EMAIL SENT ==========');
    //   console.log(`📮 To: ${email}`);
    //   console.log(`👤 Name: ${firstName}`);
    //   console.log(`🔑 Verification Token: ${token}`);
    //   console.log(`🔗 Verification URL: ${verificationUrl}`);
    //   console.log(`\n🧪 COPY THIS URL FOR TESTING:`);
    //   console.log(`   ${verificationUrl}`);
    //   console.log('=====================================\n');

    //   await new Promise(resolve => setTimeout(resolve, 100));

    //   return {
    //     success: true,
    //     message: `Mock email sent to ${email}`,
    //     token: token,
    //   };
    // }

    // Stvarno slanje email-a preko Nodemailer-a
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Verify your Puppins account 🐕',
      text: `
        Hi ${firstName}!
        
        Welcome to Puppins! Please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        Thanks,
        The Puppins Team
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your Puppins account</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #ef8a32 0%, #ef8a32 100%); 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 30px 20px; }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #ef8a32 0%, #ef8a32 100%); 
              color: white; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 20px 0;
              font-weight: 600;
              transition: transform 0.2s;
            }
            .button:hover { transform: translateY(-1px); }
            .footer { 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              margin-top: 30px; 
              padding: 20px;
              background: #f8f9fa;
            }
            .note {
              background: #f0f7ff;
              border-left: 4px solid #ef8a32;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Puppins! 🐕🐈</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 10px;">Hi ${firstName}!</p>
              <p>Thanks for joining Puppins! We're excited to have you on board.</p>
              <p>To get started, please verify your email address by clicking the button below:</p>
              
              <p style="text-align: center;">
                ${verificationUrl}
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              
              <div class="note">
                <strong>📱 Mobile users:</strong> This link will automatically open the Puppins app on your device.
              </div>
              
              <p style="color: #666; font-size: 14px;">
                This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>The Puppins Team</strong></p>
              <p style="font-size: 12px; color: #999;">
                If you're having trouble with the button above, copy and paste this URL into your mobile browser:<br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}:`, info.messageId);

      return {
        success: true,
        message: `Verification email sent to ${email}`,
      };
    } catch (error) {
      console.error('❌ Nodemailer error:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string,
  ) {
    const resetUrl = `puppins://auth/reset-password?token=${token}`;

    // const isDevelopment = process.env.NODE_ENV !== 'production';

    // if (isDevelopment) {
    //   console.log('\n🔐 ========== PASSWORD RESET EMAIL ==========');
    //   console.log(`📮 To: ${email}`);
    //   console.log(`👤 Name: ${firstName}`);
    //   console.log(`🔑 Reset Token: ${token}`);
    //   console.log(`🔗 Reset URL: ${resetUrl}`);
    //   console.log(`\n🧪 COPY THIS URL FOR TESTING:`);
    //   console.log(`   ${resetUrl}`);
    //   console.log('==========================================\n');

    //   await new Promise(resolve => setTimeout(resolve, 100));

    //   return {
    //     success: true,
    //     message: `Mock reset email sent to ${email}`,
    //     token: token,
    //   };
    // }

    // Stvarni email za produkciju
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset your Puppins password 🔐',
      text: `
      Hi ${firstName}!
      
      We received a request to reset your password for your Puppins account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request this, you can safely ignore this email.
      
      Thanks,
      The Puppins Team
    `,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset your password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ef8a32 0%, #ef8a32 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #ef8a32 0%, #ef8a32 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
          .note { background: #fff3cd; border-left: 4px solid #ef8a32; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding: 20px; background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset 🔐</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px;">Hi ${firstName}!</p>
            <p>We received a request to reset your password for your Puppins account.</p>
            <p>Click the button below to reset your password:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <div class="note">
              <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
          <div class="footer">
            <p>Best regards,<br><strong>The Puppins Team</strong></p>
            <p style="font-size: 12px; color: #999;">
              If you're having trouble with the button above, copy and paste this URL into your mobile browser:<br>
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}:`, info.messageId);

      return {
        success: true,
        message: `Password reset email sent to ${email}`,
      };
    } catch (error) {
      console.error('❌ Password reset email error:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
