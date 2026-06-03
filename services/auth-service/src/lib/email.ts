import '../load-env';
import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: 'password-reset' | 'registration' = 'password-reset',
): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured. Set SMTP_USER and SMTP_PASS in .env');
  }

  const isRegistration = purpose === 'registration';
  const title = isRegistration ? 'Email Verification' : 'Password Reset';
  const subject = isRegistration
    ? 'TZW Fire Safety - Email Verification Code'
    : 'TZW Fire Safety - Password Reset Code';
  const html = `
    <h2>TZW Fire Safety - ${title}</h2>
    <p>Your verification code is: <strong>${otp}</strong></p>
    <p>This code expires in 10 minutes.</p>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

export async function sendAdminNewRegistrationEmail(
  adminEmail: string,
  user: { firstName: string; lastName: string; email: string; role: string },
): Promise<void> {
  const portalUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const roleLabel = user.role === 'INSPECTOR' ? 'Inspector' : 'User';
  const html = `
    <h2>TZW Fire Safety - New registration</h2>
    <p>A new <strong>${roleLabel}</strong> account was verified and created:</p>
    <ul>
      <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
      <li><strong>Email:</strong> ${user.email}</li>
      <li><strong>Role:</strong> ${user.role}</li>
    </ul>
    <p><a href="${portalUrl}/admin/users">Review users in the admin portal</a></p>
  `;
  await sendEmail(adminEmail, `TZW Fire Safety - New ${roleLabel} registration`, html);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured. Set SMTP_USER and SMTP_PASS in .env');
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
