const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
    // Don't throw - email failure shouldn't break the API
  }
};

// ── Email Templates ────────────────────────────────────────────────────────
const emailTemplates = {
  welcome: (name) => ({
    subject: '🎉 Welcome to JobPortal!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to JobPortal!</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #a78bfa;">Hi ${name}! 👋</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            Your account has been created successfully. You can now browse thousands of jobs, apply with your resume, and track your applications — all in one place.
          </p>
          <a href="${process.env.CLIENT_URL}/jobs" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Browse Jobs →
          </a>
          <p style="color: #64748b; margin-top: 30px; font-size: 14px;">JobPortal Team</p>
        </div>
      </div>
    `,
  }),

  applicationConfirmation: (name, jobTitle, company) => ({
    subject: `✅ Application Submitted — ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Submitted!</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #34d399;">Great news, ${name}!</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            Your application for <strong style="color: #e2e8f0;">${jobTitle}</strong> at <strong style="color: #e2e8f0;">${company}</strong> has been successfully submitted.
          </p>
          <div style="background: #1e1e2e; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #94a3b8;">The recruiter will review your application and reach out if you're a good fit. Good luck! 🍀</p>
          </div>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Track Application →
          </a>
        </div>
      </div>
    `,
  }),

  newApplicant: (recruiterName, applicantName, jobTitle, applicationId) => ({
    subject: `👤 New Applicant for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Application Received!</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #fbbf24;">Hi ${recruiterName},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            <strong style="color: #e2e8f0;">${applicantName}</strong> has applied for <strong style="color: #e2e8f0;">${jobTitle}</strong>.
          </p>
          <a href="${process.env.CLIENT_URL}/recruiter/applications" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Application →
          </a>
        </div>
      </div>
    `,
  }),

  statusUpdate: (name, jobTitle, status) => ({
    subject: `📋 Application Update — ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Status Update</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #a78bfa;">Hi ${name},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            Your application for <strong style="color: #e2e8f0;">${jobTitle}</strong> has been updated.
          </p>
          <div style="background: #1e1e2e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #94a3b8; margin: 0 0 8px;">New Status:</p>
            <span style="display: inline-block; padding: 8px 24px; background: #6366f1; color: white; border-radius: 20px; font-weight: bold; font-size: 16px; text-transform: capitalize;">${status}</span>
          </div>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Dashboard →
          </a>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
