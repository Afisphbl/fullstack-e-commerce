"use strict";

const nodemailer = require("nodemailer");
const config = require("../config/env");
const logger = require("../logs/logger");

// ─── Gmail SMTP transporter for all emails ───────────────────────────────────
const createTransporter = () => {
  if (!config.email.username || !config.email.password) {
    throw new Error(
      "Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in config.env",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.username,
      pass: config.email.password,
    },
  });
};

// ─── Base send function (Gmail) ───────────────────────────────────────────────
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html,
  });
  logger.info(`Email sent via Gmail: ${info.messageId} → ${to}`);
  return info;
};

// ─── Template helpers ─────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ email, name, resetURL }) => {
  const subject = "🔐 Password Reset Request - E-Commerce Store";
  const text = `Hi ${name},\n\nYou requested a password reset.\n\nReset link:\n${resetURL}\n\nThis link expires in 10 minutes.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nThe E-Commerce Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px 28px;text-align:center;">
        <div style="background:rgba(255,255,255,0.2);width:80px;height:80px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:40px;">🔐</span>
        </div>
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;letter-spacing:.3px;">Password Reset Request</h1>
      </div>
      <div style="padding:32px 28px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 24px 0;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetURL}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(239,68,68,0.3);">
            Reset My Password
          </a>
        </div>
        <div style="margin:24px 0;padding:16px;background:#fef2f2;border-radius:8px;border-left:4px solid #ef4444;">
          <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.5;">
            ⏱️ <strong>Important:</strong> This link will expire in <strong>10 minutes</strong> for security reasons.
          </p>
        </div>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:24px 0 0 0;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <div style="margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <p style="font-size:12px;color:#9ca3af;margin:0 0 8px 0;">
            <strong>Having trouble?</strong> Copy and paste this link into your browser:
          </p>
          <p style="font-size:11px;color:#6b7280;word-break:break-all;margin:0;">
            ${resetURL}
          </p>
        </div>
      </div>
      <div style="padding:20px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          E-Commerce Store · Secure Password Reset
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

const sendWelcomeEmail = async ({ email, name }) => {
  const subject = "🎉 Welcome to E-Commerce Store!";
  const text = `Hi ${name},\n\nWelcome to E-Commerce Store! 🎉\n\nYour account has been created successfully. We're excited to have you on board!\n\nStart exploring our amazing products and enjoy a seamless shopping experience.\n\nHappy shopping!\nThe E-Commerce Team`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px 28px;text-align:center;">
        <div style="background:rgba(255,255,255,0.2);width:80px;height:80px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:40px;">🎉</span>
        </div>
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;letter-spacing:.3px;">Welcome to E-Commerce!</h1>
      </div>
      <div style="padding:32px 28px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px 0;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 24px 0;">
          Welcome aboard! 🚀 Your account has been created successfully, and we're thrilled to have you join our community.
        </p>
        <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);padding:24px;border-radius:8px;margin:24px 0;border-left:4px solid #10b981;">
          <h2 style="color:#065f46;margin:0 0 12px 0;font-size:18px;">What's Next?</h2>
          <ul style="margin:0;padding-left:20px;color:#047857;">
            <li style="margin-bottom:8px;font-size:14px;">Browse our extensive product catalog</li>
            <li style="margin-bottom:8px;font-size:14px;">Add items to your wishlist</li>
            <li style="margin-bottom:8px;font-size:14px;">Enjoy secure and fast checkout</li>
            <li style="font-size:14px;">Track your orders in real-time</li>
          </ul>
        </div>
        <div style="text-align:center;margin:32px 0;">
          <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(16,185,129,0.3);">
            Start Shopping
          </a>
        </div>
        <div style="margin:24px 0;padding:16px;background:#f0f9ff;border-radius:8px;border-left:4px solid #3b82f6;">
          <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.5;">
            💡 <strong>Pro Tip:</strong> Complete your profile to get personalized product recommendations!
          </p>
        </div>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:24px 0 0 0;">
          If you didn't create this account, please contact our support team immediately.
        </p>
      </div>
      <div style="padding:20px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:12px;color:#9ca3af;">
          E-Commerce Store · Happy Shopping!
        </p>
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          Need help? Contact us at <a href="mailto:${process.env.OWNER_EMAIL}" style="color:#3b82f6;text-decoration:none;">${process.env.OWNER_EMAIL}</a>
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send contact-form notification to the owner and staff via Gmail.
 * Reply-To is set to the customer's email for one-click replies.
 */
const sendContactNotificationEmail = async ({
  name,
  email,
  phone,
  subject,
  message,
  to,
}) => {
  const ownerEmail = to || process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    logger.warn("Recipient email not set for contact notification — skipping.");
    return;
  }

  // Optional: Add additional staff emails (comma-separated)
  const staffEmails = process.env.STAFF_EMAILS || "";
  const recipients = staffEmails ? `${ownerEmail},${staffEmails}` : ownerEmail;

  const transporter = createTransporter();
  const emailSubject = `📬 New Contact Message: ${subject}`;

  const text =
    `New contact form submission\n\n` +
    `From:    ${name} <${email}>\n` +
    `Phone:   ${phone || "N/A"}\n` +
    `Subject: ${subject}\n\n` +
    `Message:\n${message}\n\n` +
    `---\nHit Reply to respond directly to the sender.`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:22px 28px;">
        <h2 style="color:#fff;margin:0;font-size:18px;letter-spacing:.3px;">📬 New Contact Form Message</h2>
      </div>
      <div style="padding:28px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:10px 0;color:#6b7280;width:90px;vertical-align:top;font-weight:600;">From</td>
            <td style="padding:10px 0;color:#111827;font-weight:500;">${name} &lt;${email}&gt;</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;vertical-align:top;font-weight:600;">Phone</td>
            <td style="padding:10px 0;color:#111827;">${phone || "N/A"}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;vertical-align:top;font-weight:600;">Subject</td>
            <td style="padding:10px 0;color:#111827;font-weight:600;">${subject}</td>
          </tr>
          <tr style="border-top:1px solid #f3f4f6;">
            <td style="padding:10px 0;color:#6b7280;vertical-align:top;font-weight:600;">Message</td>
            <td style="padding:10px 0;color:#111827;line-height:1.6;white-space:pre-line;">${message}</td>
          </tr>
        </table>
        <div style="margin-top:24px;padding:16px;background:#f0f0ff;border-radius:8px;border-left:4px solid #4f46e5;">
          <p style="margin:0;font-size:13px;color:#4f46e5;">
            💡 Hit <strong>Reply</strong> in your email client to respond directly to <strong>${name}</strong>.
          </p>
        </div>
      </div>
      <div style="padding:16px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">Sent via E-Commerce Contact Form · <a href="mailto:${email}" style="color:#4f46e5;">${email}</a></p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: config.email.from,
    to: recipients,
    replyTo: `"${name}" <${email}>`,
    subject: emailSubject,
    text,
    html,
  });

  logger.info(
    `Contact notification sent via Gmail: ${info.messageId} → ${recipients}`,
  );
  return info;
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendContactNotificationEmail,
};
