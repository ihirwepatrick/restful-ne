import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendNotificationEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER || process.env.NODE_ENV === 'development') {
    console.log(`[DEV NOTIFY] To: ${to}, Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
}
