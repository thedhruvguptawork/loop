const nodemailer = require("nodemailer");

/**
 * Send OTP verification email with multi-provider support:
 * 1. Resend HTTP REST API (HTTPS port 443 - works seamlessly on Render Free Tier)
 * 2. Brevo HTTP REST API (HTTPS port 443)
 * 3. Nodemailer SMTP (Gmail / Custom SMTP with aggressive timeouts so it never hangs in cloud environments)
 * 4. Graceful Fallback (Logs to console & returns OTP for UI auto-fill if cloud delivery fails)
 */
const sendEmail = async ({ email, otp, subject, title, message }) => {
    // Ensure environment variables are loaded
    if (!process.env.EMAIL_USER && !process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
        try {
            require("dotenv").config();
        } catch (e) {}
    }

    const emailSubject = subject || "Your Loop Verification Code";
    const emailTitle = title || "Security Verification Code";
    const emailMessage = message || "Please use the following 6-digit one-time password (OTP) to continue:";

    // Prepare HTML template
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

    const textContent = `${emailTitle}\n\n${emailMessage}\n\nOTP Code: ${otp}\n\nExpires in 10 minutes.`;

    const logOtpToConsole = (reason) => {
        console.log("\n============================================================");
        console.log(`         [LOOP AUTHENTICATION - OTP NOTIFICATION] (${reason})`);
        console.log(` Target Email : ${email}`);
        console.log(` OTP Code     : >>>  ${otp}  <<<`);
        console.log(` Expiration   : 10 minutes`);
        console.log(" Note: Master bypass code '123456' is also accepted in demo mode.");
        console.log("============================================================\n");
    };

    // Always log in development or if requested
    if (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_OTP === "true") {
        logOtpToConsole("ACTIVE");
    }

    // ----------------------------------------------------
    // Provider 1: Resend HTTP REST API (Recommended for Render free tier - HTTPS port 443)
    // ----------------------------------------------------
    if (process.env.RESEND_API_KEY) {
        try {
            const resendFrom = process.env.RESEND_FROM || process.env.EMAIL_FROM || "Loop App <onboarding@resend.dev>";
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.RESEND_API_KEY.trim()}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: resendFrom,
                    to: [email],
                    subject: emailSubject,
                    text: textContent,
                    html: htmlContent
                })
            });

            const data = await res.json();
            if (res.ok && data.id) {
                console.log(`[RESEND SUCCESS]: OTP email sent to ${email} (ID: ${data.id})`);
                return {
                    success: true,
                    delivered: true,
                    provider: "resend",
                    messageId: data.id,
                    otp
                };
            } else {
                console.warn("[RESEND WARNING]: Failed to send email via Resend API:", data);
            }
        } catch (resendError) {
            console.warn("[RESEND ERROR]:", resendError.message);
        }
    }

    // ----------------------------------------------------
    // Provider 2: Brevo HTTP REST API (HTTPS port 443)
    // ----------------------------------------------------
    if (process.env.BREVO_API_KEY) {
        try {
            const senderEmail = process.env.EMAIL_USER || "no-reply@loop-app.com";
            const res = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "api-key": process.env.BREVO_API_KEY.trim(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sender: { name: "Loop App", email: senderEmail },
                    to: [{ email }],
                    subject: emailSubject,
                    textContent: textContent,
                    htmlContent: htmlContent
                })
            });

            const data = await res.json();
            if (res.ok && (data.messageId || data.messageIds)) {
                console.log(`[BREVO SUCCESS]: OTP email sent to ${email}`);
                return {
                    success: true,
                    delivered: true,
                    provider: "brevo",
                    messageId: data.messageId || data.messageIds[0],
                    otp
                };
            } else {
                console.warn("[BREVO WARNING]: Failed to send email via Brevo API:", data);
            }
        } catch (brevoError) {
            console.warn("[BREVO ERROR]:", brevoError.message);
        }
    }

    // ----------------------------------------------------
    // Provider 3: Nodemailer SMTP (Gmail / Custom SMTP)
    // ----------------------------------------------------
    const hasSmtpCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    if (hasSmtpCredentials) {
        try {
            const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, "");
            const isGmail = !process.env.EMAIL_HOST || process.env.EMAIL_HOST === "smtp.gmail.com" || process.env.EMAIL_SERVICE === "gmail";

            let transportConfig;
            if (isGmail) {
                transportConfig = {
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: cleanPass
                    },
                    connectionTimeout: 8000,
                    greetingTimeout: 8000,
                    socketTimeout: 8000
                };
            } else {
                const port = Number(process.env.EMAIL_PORT) || 587;
                transportConfig = {
                    host: process.env.EMAIL_HOST,
                    port: port,
                    secure: port === 465,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: cleanPass
                    },
                    connectionTimeout: 8000,
                    greetingTimeout: 8000,
                    socketTimeout: 8000,
                    tls: {
                        rejectUnauthorized: false
                    }
                };
            }

            const transporter = nodemailer.createTransport(transportConfig);

            // Clean sender to prevent SMTP domain rejection
            let fromAddress = process.env.EMAIL_FROM;
            if (!fromAddress || fromAddress.includes("@loop.local")) {
                fromAddress = `"Loop App" <${process.env.EMAIL_USER}>`;
            }

            const info = await transporter.sendMail({
                from: fromAddress,
                to: email,
                subject: emailSubject,
                text: textContent,
                html: htmlContent
            });

            console.log(`[SMTP SUCCESS]: OTP email sent to ${email} (ID: ${info.messageId})`);
            return {
                success: true,
                delivered: true,
                provider: "smtp",
                messageId: info.messageId,
                otp
            };
        } catch (error) {
            console.warn("[NODEMAILER WARNING]: Failed to send email via SMTP:", error.message);
            console.warn("[NODEMAILER HINT]: Cloud platforms like Render Free tier block outbound SMTP ports (25, 465, 587). Use RESEND_API_KEY over HTTPS (port 443) or use the fallback OTP displayed on screen.");
            logOtpToConsole("SMTP_FALLBACK");
            return {
                success: true,
                delivered: false,
                demo: true,
                error: error.message,
                otp
            };
        }
    }

    // ----------------------------------------------------
    // Provider 4: Graceful Demo / Interview Fallback
    // ----------------------------------------------------
    logOtpToConsole("NO_CREDENTIALS_FALLBACK");
    return {
        success: true,
        delivered: false,
        demo: true,
        otp
    };
};

module.exports = sendEmail;
