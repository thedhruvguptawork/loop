const nodemailer = require("nodemailer");

/**
 * Send OTP verification email with fallback for interviews & demo environments.
 * If credentials are missing or SMTP fails, it gracefully logs the OTP to console
 * so the demo never gets blocked.
 */
const sendEmail = async ({ email, otp, subject, title, message }) => {
    const hasCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    const emailSubject = subject || "Your Loop Verification Code";
    const emailTitle = title || "Security Verification Code";
    const emailMessage = message || "Please use the following 6-digit one-time password (OTP) to continue:";

    // Always log to console in demo/development or if credentials aren't set
    const shouldLogConsole = !hasCredentials || process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_OTP === "true";

    if (shouldLogConsole) {
        console.log("\n============================================================");
        console.log("             [LOOP AUTHENTICATION - OTP NOTIFICATION]        ");
        console.log(` Target Email : ${email}`);
        console.log(` OTP Code     : >>>  ${otp}  <<<`);
        console.log(` Expiration   : 10 minutes`);
        console.log(" Note: Master bypass code '123456' is also accepted in demo mode.");
        console.log("============================================================\n");
    }

    if (!hasCredentials) {
        return {
            success: true,
            delivered: false,
            demo: true,
            otp
        };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailSubject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0e; color: #f3f3f6; margin: 0; padding: 24px; }
            .container { max-width: 480px; margin: 0 auto; background: #141419; border: 1px solid #23232c; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
            .logo { font-size: 22px; font-weight: 700; color: #a855f7; display: flex; align-items: center; gap: 8px; margin-bottom: 24px; text-decoration: none; }
            .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
            .desc { font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #1f1f28; border: 1px dashed #a855f7; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
            .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #c084fc; font-family: monospace; }
            .footer { font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #23232c; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">✦ Loop</div>
            <div class="title">${emailTitle}</div>
            <div class="desc">${emailMessage}</div>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="desc" style="font-size: 13px;">
              This code will expire in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.
            </div>
            <div class="footer">
              Loop App &bull; Keep the good conversations going
            </div>
          </div>
        </body>
        </html>
        `;

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"Loop App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: emailSubject,
            text: `${emailTitle}\n\n${emailMessage}\n\nOTP Code: ${otp}\n\nExpires in 10 minutes.`,
            html: htmlContent
        });

        return {
            success: true,
            delivered: true,
            messageId: info.messageId,
            otp
        };
    } catch (error) {
        // Safe fallback - do not crash request if email sending fails
        console.warn("[NODEMAILER WARNING]: Failed to send email via SMTP:", error.message);
        console.log(`\n>>> DEMO / FALLBACK OTP for ${email}: [ ${otp} ] <<<\n`);
        return {
            success: true,
            delivered: false,
            demo: true,
            error: error.message,
            otp
        };
    }
};

module.exports = sendEmail;
