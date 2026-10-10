import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

interface CardData {
  attendeeId: string;
  ticketCode: string;
  name: string;
  category: string;
  teamIdentifier: string | null;
  signedToken: string;
  eventName: string;
  venueName: string;
  dateText: string;
}

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class CardGenerator {
  /**
   * Generates QR Code Data URL from signed token
   */
  static async generateQR(signedToken: string): Promise<string> {
    return QRCode.toDataURL(signedToken, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: {
        dark: '#0A0A0A',
        light: '#FFFFFF',
      },
    });
  }

  /**
   * Generates an elegant brand pass SVG in light theme
   */
  static async generatePassCard(data: CardData): Promise<{ svgString: string; passUrl: string; qrDataUrl: string }> {
    const qrDataUrl = await this.generateQR(data.signedToken);
    const rawCategoryDisplay = data.teamIdentifier ? `${data.category} · ${data.teamIdentifier}` : data.category;

    const safeTicketCode = escapeXml(data.ticketCode);
    const safeName = escapeXml(data.name);
    const safeCategory = escapeXml(rawCategoryDisplay);
    const safeDateText = escapeXml(data.dateText);
    const safeVenueName = escapeXml(data.venueName);

    const svgString = `
<svg width="600" height="900" viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg" style="background:#FAFAF7; font-family:'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Background Canvas -->
  <rect width="600" height="900" fill="#FAFAF7" />

  <!-- Outer Card with 16px radius and hairline border -->
  <rect x="24" y="24" width="552" height="852" rx="16" fill="#FFFFFF" stroke="#E6E6DF" stroke-width="1.5" />

  <!-- Brand Header -->
  <g transform="translate(56, 68)">
    <text x="0" y="24" fill="#0A0A0A" font-size="28" font-weight="700" letter-spacing="-0.5">Friends of Tech<tspan fill="#C2E600">.</tspan></text>
    <text x="0" y="44" fill="#8C8C85" font-size="12" font-weight="500">Presented by GenLab Pvt Ltd</text>
  </g>

  <!-- Ticket Code Monospace Box -->
  <rect x="380" y="68" width="164" height="40" rx="8" fill="#F2F2EC" stroke="#E6E6DF" stroke-width="1" />
  <text x="462" y="93" fill="#0A0A0A" font-size="14" font-weight="700" font-family="'JetBrains Mono', monospace" letter-spacing="1" text-anchor="middle">${safeTicketCode}</text>

  <!-- Divider Line -->
  <line x1="56" y1="136" x2="544" y2="136" stroke="#E6E6DF" stroke-width="1" />

  <!-- Attendee Details -->
  <g transform="translate(56, 175)">
    <text x="0" y="0" fill="#8C8C85" font-size="11" font-weight="700" font-family="'JetBrains Mono', monospace" letter-spacing="1">ATTENDEE PASS</text>
    <text x="0" y="36" fill="#0A0A0A" font-size="28" font-weight="700" letter-spacing="-0.3">${safeName}</text>
  </g>

  <!-- Category Badge -->
  <rect x="56" y="235" width="190" height="34" rx="17" fill="#C2E600" />
  <text x="151" y="257" fill="#0A0A0A" font-size="12" font-weight="700" letter-spacing="0.5" text-anchor="middle">${safeCategory}</text>

  <!-- QR Code Tile -->
  <rect x="140" y="300" width="320" height="320" rx="16" fill="#FFFFFF" stroke="#E6E6DF" stroke-width="1.5" />
  <image href="${qrDataUrl}" x="155" y="315" width="290" height="290" />

  <!-- Notice -->
  <text x="300" y="650" fill="#8C8C85" font-size="11" font-family="'JetBrains Mono', monospace" text-anchor="middle">OFFICIAL COMMUNITY PASS · 2026</text>

  <!-- Divider -->
  <line x1="56" y1="680" x2="544" y2="680" stroke="#E6E6DF" stroke-width="1" />

  <!-- Event Details -->
  <g transform="translate(56, 715)">
    <text x="0" y="0" fill="#8C8C85" font-size="11" font-family="'JetBrains Mono', monospace">DATE &amp; TIME</text>
    <text x="0" y="22" fill="#0A0A0A" font-size="14" font-weight="600">${safeDateText}</text>
  </g>

  <g transform="translate(56, 775)">
    <text x="0" y="0" fill="#8C8C85" font-size="11" font-family="'JetBrains Mono', monospace">VENUE</text>
    <text x="0" y="22" fill="#0A0A0A" font-size="14" font-weight="600">${safeVenueName}</text>
  </g>

  <!-- Footer -->
  <rect x="56" y="828" width="488" height="26" rx="8" fill="#F2F2EC" />
  <text x="300" y="845" fill="#55554F" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle" font-weight="600">SHOW THIS PASS AT CHECK-IN</text>
</svg>
    `.trim();

    const passesDir = path.resolve(process.cwd(), 'uploads', 'passes');
    if (!fs.existsSync(passesDir)) {
      fs.mkdirSync(passesDir, { recursive: true });
    }

    const passFilename = `pass-${data.ticketCode.toLowerCase()}.svg`;
    const passFilePath = path.join(passesDir, passFilename);
    fs.writeFileSync(passFilePath, svgString, 'utf-8');

    return {
      svgString,
      passUrl: `/uploads/passes/${passFilename}`,
      qrDataUrl,
    };
  }
}
