const transporter = require('../config/mailer');

const FROM_ADDRESS = `"Avelia" <${process.env.EMAIL_USER}>`;

// ─────────────────────────────────────────────────────────────────────────────
// OTP Email
// ─────────────────────────────────────────────────────────────────────────────
const sendOtpEmail = async (toEmail, otp, expiresMinutes = 5) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: 'Avelia – Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a6b1a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🌱 Avelia</h1>
          <p style="color: #a8d5a8; margin: 4px 0 0 0; font-size: 14px;">Farm to Market Management Platform</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a6b1a; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #555; font-size: 15px;">Use the OTP below to verify your email address:</p>
          <div style="background: #ffffff; border: 2px solid #1a6b1a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1a6b1a;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 13px;">
            This OTP is valid for <strong>${expiresMinutes} minutes</strong>.<br/>
            Do not share this code with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            If you did not request this, please ignore this email.<br/>
            &copy; ${new Date().getFullYear()} Avelia. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (toEmail, name, otp, expiresMinutes = 5) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: 'Avelia – Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a6b1a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🌱 Avelia</h1>
          <p style="color: #a8d5a8; margin: 4px 0 0 0; font-size: 14px;">Farm to Market Management Platform</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a6b1a; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #555; font-size: 15px;">Hello ${name},</p>
          <p style="color: #555; font-size: 15px;">
            We received a request to reset your Avelia password. Use the code below to continue:
          </p>
          <div style="background: #ffffff; border: 2px solid #1a6b1a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1a6b1a;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 13px;">
            This code is valid for <strong>${expiresMinutes} minutes</strong>.<br/>
            Do not share this code with anyone — Avelia will never ask for it.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #aaa; font-size: 12px; text-align: center;">
            If you did not request a password reset, you can safely ignore this email — your password will not change.<br/>
            &copy; ${new Date().getFullYear()} Avelia. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────────────────────────────────────
// Welcome Email (Farmer / Buyer)
// ─────────────────────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (toEmail, name, loginId) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: 'Welcome to Avelia!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a6b1a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🌱 Avelia</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a6b1a; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #555; font-size: 15px;">Your Avelia account has been created successfully.</p>
          ${loginId ? `<p style="color: #555;">Your Login ID: <strong style="color: #1a6b1a;">${loginId}</strong></p>` : ''}
          <p style="color: #555;">You can now log in to access your dashboard.</p>
          <p style="color: #aaa; font-size: 12px; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Avelia. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────────────────────────────────────
// Expert Application Received (sent on registration)
// ─────────────────────────────────────────────────────────────────────────────
const sendExpertPendingEmail = async (toEmail, name) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: 'Avelia – Expert Application Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a6b1a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🌱 Avelia</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a6b1a; margin-top: 0;">Application Under Review</h2>
          <p style="color: #555; font-size: 15px;">Dear ${name},</p>
          <p style="color: #555;">Thank you for applying as an Agricultural Expert on Avelia.</p>
          <p style="color: #555;">Your documents have been received and are currently under review by our admin team. You will be notified by email once the review is complete.</p>
          <p style="color: #888; font-size: 13px;">This process typically takes 1–3 business days.</p>
          <p style="color: #aaa; font-size: 12px; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} Avelia. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────────────────────────────────────
// Expert Application APPROVED (sent by admin)
// ─────────────────────────────────────────────────────────────────────────────
const sendExpertApprovedEmail = async (toEmail, name, loginId) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: '🎉 Avelia – Your Expert Application Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0d1b35 0%, #1565c0 100%); padding: 28px 24px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: -0.5px;">🌱 Avelia</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Farm to Market Management Platform</p>
        </div>

        <!-- Body -->
        <div style="background: #f9f9f9; padding: 32px 28px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">

          <!-- Success badge -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background: #edf7ed; border-radius: 50%; width: 64px; height: 64px; line-height: 64px; font-size: 30px; text-align: center;">✅</div>
          </div>

          <h2 style="color: #1a6b1a; font-size: 22px; margin: 0 0 12px; text-align: center;">
            Congratulations, ${name}!
          </h2>
          <p style="color: #555; font-size: 15px; line-height: 1.7; text-align: center; margin: 0 0 28px;">
            Your application to join Avelia as an <strong>Agricultural Expert</strong> has been
            <strong style="color: #1a6b1a;">approved</strong> by our admin team.
            You can now log in and start helping farmers across India.
          </p>

          <!-- Credentials card -->
          <div style="background: #ffffff; border: 2px solid #1565c0; border-radius: 10px; padding: 24px; margin-bottom: 28px; text-align: center;">
            <p style="font-size: 12px; color: #999; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
              Your Login ID
            </p>
            <p style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #1565c0; margin: 0 0 12px; font-family: monospace;">
              ${loginId}
            </p>
            <p style="font-size: 13px; color: #777; margin: 0; line-height: 1.6;">
              Use your <strong>Login ID</strong> or registered <strong>email address</strong><br/>
              along with your password to sign in.
            </p>
          </div>

          <!-- Account details -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 12px; background: #f0f4ff; border: 1px solid #dce4ff; border-radius: 6px 0 0 0; font-weight: 700; color: #555; width: 40%;">Name</td>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #dce4ff; color: #222;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f0f4ff; border: 1px solid #dce4ff; font-weight: 700; color: #555;">Email</td>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #dce4ff; color: #222;">${toEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f0f4ff; border: 1px solid #dce4ff; font-weight: 700; color: #555;">Login ID</td>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #dce4ff; color: #1565c0; font-weight: 700; font-family: monospace;">${loginId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f0f4ff; border: 1px solid #dce4ff; border-radius: 0 0 0 6px; font-weight: 700; color: #555;">Role</td>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #dce4ff; color: #222;">Agricultural Expert 🔬</td>
            </tr>
          </table>

          <!-- What you can do -->
          <div style="background: #e8f0fe; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
            <p style="font-weight: 700; color: #1565c0; font-size: 14px; margin: 0 0 10px;">🔬 As a Verified Expert, you can now:</p>
            <ul style="color: #555; font-size: 14px; line-height: 1.9; margin: 0; padding-left: 20px;">
              <li>Receive and accept consultation requests from farmers</li>
              <li>Review and diagnose plant disease cases</li>
              <li>Provide crop advice and agricultural guidance</li>
              <li>Connect with farmers through the platform</li>
              <li>Access agricultural news and government schemes</li>
            </ul>
          </div>

          <!-- Login CTA button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="http://localhost:5173/login"
               style="display: inline-block; background: linear-gradient(135deg, #1565c0, #0d47a1);
                      color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700;
                      padding: 14px 40px; border-radius: 8px; letter-spacing: 0.3px;">
              Login to Avelia →
            </a>
          </div>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0; line-height: 1.7;">
            Keep your Login ID safe. Do not share your credentials with anyone.<br/>
            If you did not apply for this account, please contact us immediately.<br/>
            &copy; ${new Date().getFullYear()} Avelia. All rights reserved.
          </p>
        </div>

      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────────────────────────────────────
// Expert Application REJECTED (sent by admin)
// ─────────────────────────────────────────────────────────────────────────────
const sendExpertRejectedEmail = async (toEmail, name, reason) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: toEmail,
    subject: 'Avelia – Expert Application Status Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a6b1a 0%, #2d8c2d 100%); padding: 28px 24px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: -0.5px;">🌱 Avelia</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px;">Farm to Market Management Platform</p>
        </div>

        <!-- Body -->
        <div style="background: #f9f9f9; padding: 32px 28px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">

          <h2 style="color: #1a2e1a; font-size: 20px; margin: 0 0 14px;">Dear ${name},</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
            Thank you for your interest in joining Avelia as an Agricultural Expert.
            After careful review of your application and submitted documents, our admin team has
            <strong style="color: #c0392b;">not been able to approve</strong> your application at this time.
          </p>

          <!-- Reason card -->
          <div style="background: #fff3f3; border-left: 4px solid #c0392b; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
            <p style="font-weight: 700; color: #c0392b; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">
              Reason provided by admin
            </p>
            <p style="color: #444; font-size: 14px; line-height: 1.7; margin: 0;">${reason}</p>
          </div>

          <!-- What you can do next -->
          <div style="background: #fff8e8; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
            <p style="font-weight: 700; color: #c4840e; font-size: 14px; margin: 0 0 10px;">💡 What you can do next:</p>
            <ul style="color: #555; font-size: 14px; line-height: 1.9; margin: 0; padding-left: 20px;">
              <li>Review the reason provided above carefully</li>
              <li>Ensure your qualification documents are clear and legible</li>
              <li>Make sure document details match your application information</li>
              <li>Re-register with updated information and documents</li>
              <li>Contact our support team if you believe this was an error</li>
            </ul>
          </div>

          <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            We appreciate your willingness to contribute to the Avelia community.
            You are welcome to apply again with updated and complete information.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0; line-height: 1.7;">
            This is an automated notification from Avelia.<br/>
            &copy; ${new Date().getFullYear()} Avelia. All rights reserved.
          </p>
        </div>

      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendExpertPendingEmail,
  sendExpertApprovedEmail,
  sendExpertRejectedEmail,
};
