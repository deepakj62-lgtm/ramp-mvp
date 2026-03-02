// lib/email.ts
// Email notification service via Resend (no npm install – pure fetch)
// Falls back gracefully if RESEND_API_KEY is not set.

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface ActionCompletedEmailData {
  ticketId: string;
  title: string;
  complexity: string;
  changes: string[];
  summary: string;
  pageContext?: string;
}

export interface ActionQueuedEmailData {
  ticketId: string;
  title: string;
  plan: string[];
  reviewUrl: string;
}

// ─── Core send function ──────────────────────────────────────────────────────

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Graceful no-op – log to console so the developer can see it in dev
    console.log('[email] RESEND_API_KEY not set – would have sent:');
    console.log(`  To: ${payload.to}`);
    console.log(`  Subject: ${payload.subject}`);
    return { ok: true }; // treat as success so callers don't error
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'RAMP <noreply@linea.app>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[email] Resend error:', err);
      return { ok: false, error: err };
    }
    return { ok: true };
  } catch (err: any) {
    console.error('[email] Send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

// ─── Template helpers ────────────────────────────────────────────────────────

function baseHtml(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f6f8f4; margin: 0; padding: 20px; }
  .card { background: white; border-radius: 12px; padding: 32px; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8e0; }
  .header { border-bottom: 3px solid #2d6a4f; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { font-size: 18px; font-weight: 700; color: #2d6a4f; letter-spacing: -0.5px; }
  .logo span { color: #52b788; }
  h2 { color: #1b4332; margin: 0 0 8px; font-size: 20px; }
  p { color: #40554a; line-height: 1.6; margin: 8px 0; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-green { background: #d8f3dc; color: #2d6a4f; }
  .badge-amber { background: #fff3cd; color: #856404; }
  .badge-red { background: #fde2e4; color: #c0392b; }
  ul { color: #40554a; padding-left: 20px; line-height: 1.8; }
  .btn { display: inline-block; background: #2d6a4f; color: white !important; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
  .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8e0; font-size: 12px; color: #9cad9e; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="logo">RAMP <span>AI</span></div>
  </div>
  ${body}
  <div class="footer">RAMP – Linea Resource & Allocation Management Platform · Automated notification</div>
</div>
</body>
</html>`;
}

// ─── Specific email templates ─────────────────────────────────────────────────

export async function sendActionCompletedEmail(
  to: string,
  data: ActionCompletedEmailData
): Promise<{ ok: boolean; error?: string }> {
  const changesHtml = data.changes.length > 0
    ? `<ul>${data.changes.map(c => `<li>${c}</li>`).join('')}</ul>`
    : '<p>No data changes were required.</p>';

  const body = `
<h2>✅ Action Completed Automatically</h2>
<p><strong>${data.title}</strong></p>
<span class="badge badge-green">auto-applied · ${data.complexity}</span>
${data.pageContext ? `<p style="font-size:13px;color:#9cad9e;">Context: ${data.pageContext}</p>` : ''}
<h3 style="color:#1b4332;margin-top:20px;">What changed</h3>
${changesHtml}
<p><strong>Summary:</strong> ${data.summary}</p>
<a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/feedback" class="btn">View Feedback Board →</a>
`;

  return sendEmail({
    to,
    subject: `✅ RAMP: "${data.title}" auto-applied`,
    html: baseHtml(body),
  });
}

export async function sendActionQueuedEmail(
  to: string,
  data: ActionQueuedEmailData
): Promise<{ ok: boolean; error?: string }> {
  const planHtml = data.plan.length > 0
    ? `<ol style="color:#40554a;padding-left:20px;line-height:1.8;">${data.plan.map(s => `<li>${s}</li>`).join('')}</ol>`
    : '<p>See feedback board for details.</p>';

  const body = `
<h2>⏳ Large Action Queued for Your Review</h2>
<p>A request has been classified as a <strong>large change</strong> and requires your approval before it is executed.</p>
<p><strong>${data.title}</strong></p>
<span class="badge badge-amber">requires approval</span>
<h3 style="color:#1b4332;margin-top:20px;">Proposed implementation plan</h3>
${planHtml}
<p>Review the ticket, then click <strong>Approve &amp; Execute</strong> on the Feedback Board when you're ready.</p>
<a href="${data.reviewUrl}" class="btn">Review &amp; Approve →</a>
`;

  return sendEmail({
    to,
    subject: `⏳ RAMP: "${data.title}" needs your approval`,
    html: baseHtml(body),
  });
}

export async function sendActionFailedEmail(
  to: string,
  title: string,
  error: string
): Promise<{ ok: boolean; error?: string }> {
  const body = `
<h2>❌ Action Failed</h2>
<p>An action encountered an error during execution:</p>
<p><strong>${title}</strong></p>
<span class="badge badge-red">failed</span>
<pre style="background:#fde2e4;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap;color:#c0392b;">${error}</pre>
<a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/feedback" class="btn">View Feedback Board →</a>
`;

  return sendEmail({
    to,
    subject: `❌ RAMP: "${title}" failed`,
    html: baseHtml(body),
  });
}
