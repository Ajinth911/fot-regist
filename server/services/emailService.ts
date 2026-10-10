import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

interface EmailTicketPayload {
  toEmail: string;
  name: string;
  ticketCode: string;
  category: string;
  teamIdentifier?: string | null;
  eventName: string;
  dateText: string;
  venueName: string;
  passUrl: string;
  svgString: string;
}

function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      if (host.includes('gmail.com')) {
        return nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user,
            pass,
          },
          connectionTimeout: 7000,
          greetingTimeout: 7000,
          socketTimeout: 10000,
        });
      }

      return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 7000,
        greetingTimeout: 7000,
        socketTimeout: 10000,
      });
    }

    // Simulated logger when no SMTP credentials provided
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  static async sendTicketEmail(payload: EmailTicketPayload): Promise<{ success: boolean; previewUrl?: string; messageId?: string; error?: string }> {
    const transporter = this.getTransporter();
    const isConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

    const rawCategory = payload.teamIdentifier
      ? `${payload.category} · ${payload.teamIdentifier}`
      : payload.category;

    const safeName = escapeHtml(payload.name);
    const safeTicketCode = escapeHtml(payload.ticketCode);
    const safeCategoryText = escapeHtml(rawCategory);
    const safeDateText = escapeHtml(payload.dateText);
    const safeVenueName = escapeHtml(payload.venueName);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Friends of Tech 2026 Ticket Pass</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAF7; color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAF7; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E6E6DF; border-radius: 16px; padding: 36px; text-align: left; box-shadow: 0 4px 20px rgba(10,10,10,0.04);">
          <!-- Header -->
          <tr>
            <td style="border-bottom: 1px solid #E6E6DF; padding-bottom: 24px;">
              <h1 style="margin: 0; color: #0A0A0A; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Friends of Tech<span style="color: #C2E600;">.</span>
              </h1>
              <p style="margin: 4px 0 0 0; color: #8C8C85; font-size: 13px; font-weight: 500;">
                Presented by GenLab Pvt Ltd
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 0 16px 0;">
              <p style="margin: 0; font-size: 18px; color: #0A0A0A; font-weight: 700;">
                Hi ${safeName},
              </p>
              <p style="margin: 8px 0 0 0; font-size: 15px; color: #55554F; line-height: 1.6;">
                Your payment has been verified and your spot is confirmed for <strong>Friends of Tech 2026</strong>. Your official digital QR pass is attached below.
              </p>
            </td>
          </tr>

          <!-- Ticket Box -->
          <tr>
            <td style="background-color: #FAFAF7; border: 1px solid #E6E6DF; border-radius: 12px; padding: 24px; margin: 16px 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: monospace; font-size: 11px; color: #8C8C85; text-transform: uppercase; font-weight: bold;">Ticket Pass Code</span>
                    <div style="font-family: monospace; font-size: 22px; font-weight: bold; color: #0A0A0A; margin-top: 4px;">${safeTicketCode}</div>
                  </td>
                  <td align="right">
                    <div style="display: inline-block; background-color: #C2E600; color: #0A0A0A; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 999px;">
                      ${safeCategoryText}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 16px; border-top: 1px solid #E6E6DF; margin-top: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #55554F; line-height: 1.6;">
                      <strong style="color: #0A0A0A;">Date:</strong> ${safeDateText}<br/>
                      <strong style="color: #0A0A0A;">Venue:</strong> ${safeVenueName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pass Attachment Note -->
          <tr>
            <td style="padding: 24px 0 8px 0;">
              <p style="margin: 0; font-size: 13px; color: #8C8C85; line-height: 1.5;">
                Please save your attached SVG/QR pass on your mobile device. Present the QR pass at the entrance gate for instant check-in.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #E6E6DF; padding-top: 24px; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #8C8C85; line-height: 1.5;">
                &copy; 2026 GenLab Pvt Ltd &bull; Friends of Tech &bull; Bengaluru, India
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Friends of Tech" <${process.env.SMTP_USER || 'tickets@fot.org'}>`,
        to: payload.toEmail,
        subject: `Your ticket pass for Friends of Tech 2026 - ${payload.ticketCode}`,
        html: htmlContent,
        attachments: [
          {
            filename: `FOT-Pass-${payload.ticketCode}.svg`,
            content: payload.svgString,
            contentType: 'image/svg+xml',
          },
        ],
      });

      if (isConfigured) {
        console.log(`[EMAIL DISPATCH] Sent live email to ${payload.toEmail} (MessageId: ${info.messageId})`);
      } else {
        console.log(`[EMAIL SIMULATED] Simulated email to ${payload.toEmail} (Ticket: ${payload.ticketCode}). Configure SMTP_USER/SMTP_PASS in .env to deliver real emails.`);
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      console.error('[EMAIL ERROR] Failed to dispatch email:', err);
      return { success: false, error: (err as Error).message };
    }
  }

  static async testSmtpConnection(targetEmail: string): Promise<{ success: boolean; message: string }> {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !user || !pass) {
      return {
        success: false,
        message: 'SMTP credentials missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.',
      };
    }

    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Friends of Tech" <${user}>`,
        to: targetEmail,
        subject: 'Friends of Tech - SMTP Test Verification',
        text: 'Your SMTP mail server configuration is active and working perfectly.',
        html: '<p><strong>Friends of Tech</strong>: Your SMTP mail server configuration is active and working perfectly.</p>',
      });

      return {
        success: true,
        message: `Test email successfully sent to ${targetEmail}.`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: `SMTP Connection failed: ${(err as Error).message}`,
      };
    }
  }
}
