/**
 * POST /api/notify-registration
 * Sends new parent registration details to admin@gill.ac.ug
 * 
 * Payload: { parent_name, email, phone, school, ref, at }
 * 
 * Priority:
 * 1. Resend (if RESEND_API_KEY env set) — easiest for Vercel
 * 2. Nodemailer via SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 *    Defaults to mail.gill.ac.ug:465 / info@gill.ac.ug if only SMTP_PASS provided
 * 3. FormSubmit.co fallback (no env vars needed) — ensures delivery even without config
 *
 * Always returns 200 so frontend never blocks user creation.
 */

const ALLOW_ORIGINS = ['https://www.gill.ac.ug', 'https://gill.ac.ug', 'https://gill-international-school.vercel.app'];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (!origin || ALLOW_ORIGINS.some(o => origin.includes(o)) || origin.includes('vercel.app') || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function buildEmail({ parent_name, email, phone, school, ref, at }) {
  const timestamp = at ? new Date(at).toLocaleString('en-UG', { timeZone: 'Africa/Kampala' }) : new Date().toLocaleString('en-UG', { timeZone: 'Africa/Kampala' });
  const schoolLabel = school === 'kisugu' ? 'Gill International School — Kisugu' : school === 'kansanga' ? 'Gill Junior School — Kansanga' : school || 'Not specified';

  const subject = `New Parent Registration: ${parent_name || email} [${ref || 'no-ref'}]`;

  const text = `New parent account created on gill.ac.ug

Parent Name: ${parent_name || '-'}
Email: ${email || '-'}
Phone: ${phone || '-'}
School Choice: ${schoolLabel} (${school || '-'})
Ref: ${ref || '-'}
Registered At: ${timestamp} (Africa/Kampala) / ${at || new Date().toISOString()}

Portal: https://www.gill.ac.ug/login
Admin: Check Supabase Auth > Users and parent_profiles table.

-- 
This is an automated notification from gill.ac.ug
`;

  const html = `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
    <div style="background:#0f172a;padding:20px 24px;color:#fff">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7">Gill International School</div>
      <div style="font-size:20px;font-weight:800;margin-top:4px">New Parent Registration</div>
      <div style="margin-top:6px;font-size:13px;opacity:.8">Ref: ${escapeHtml(ref)} • ${escapeHtml(timestamp)}</div>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#64748b;width:140px">Parent Name</td><td style="padding:8px 0;font-weight:600">${escapeHtml(parent_name)}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0"><a href="tel:${escapeHtml(phone)}" style="color:#0f172a;text-decoration:none">${escapeHtml(phone)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#64748b">School</td><td style="padding:8px 0">${escapeHtml(schoolLabel)} <span style="color:#64748b">(${escapeHtml(school)})</span></td></tr>
        <tr><td style="padding:8px 0;color:#64748b">Registered</td><td style="padding:8px 0">${escapeHtml(timestamp)} <span style="color:#94a3b8">/ ${escapeHtml(at)}</span></td></tr>
      </table>
      <div style="margin-top:20px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font-size:12px;color:#475569">
        <strong>Next steps:</strong> Verify in Supabase Dashboard → Auth → Users and Table Editor → <code>parent_profiles</code>. User will be redirected to <a href="https://www.gill.ac.ug/login" style="color:#2563eb">/login</a>.
      </div>
      <div style="margin-top:18px">
        <a href="https://www.gill.ac.ug/login" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px">Open Parent Portal</a>
        <a href="mailto:${escapeHtml(email)}" style="display:inline-block;margin-left:8px;padding:10px 16px;background:#0f172a;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px">Reply to Parent</a>
      </div>
    </div>
    <div style="padding:14px 24px;background:#f8fafc;color:#94a3b8;font-size:11px;text-align:center">Automated notification from gill.ac.ug • ${new Date().getFullYear()} Gill International School</div>
  </div>`;

  return { subject, text, html };
}

async function sendViaResend(payload, apiKey) {
  const { subject, text, html } = buildEmail(payload);
  const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'Gill International School <info@gill.ac.ug>';
  const to = process.env.NOTIFY_TO || 'admin@gill.ac.ug';
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
      reply_to: payload.email || undefined
    })
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Resend failed ${res.status}: ${body}`);
  return body;
}

async function sendViaNodemailer(payload) {
  const nodemailer = require('nodemailer');

  const host = process.env.SMTP_HOST || 'mail.gill.ac.ug';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'info@gill.ac.ug';
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'Gill International School <info@gill.ac.ug>';
  const to = process.env.NOTIFY_TO || 'admin@gill.ac.ug';

  if (!pass) throw new Error('SMTP_PASS not set');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
    tls: { rejectUnauthorized: false } // allow self-signed if host uses it; remove if strict
  });

  const { subject, text, html } = buildEmail(payload);

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    replyTo: payload.email || undefined
  });

  return info.messageId;
}

async function sendViaFormSubmit(payload) {
  // Free fallback — no keys required. Uses formsubmit.co ajax endpoint.
  // Note: first time admin@gill.ac.ug will receive activation email from FormSubmit — must click once.
  const { subject, text } = buildEmail(payload);
  
  const formData = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    name: payload.parent_name,
    email: payload.email,
    phone: payload.phone,
    school: payload.school,
    ref: payload.ref,
    registered_at: payload.at,
    message: text
  };

  const res = await fetch('https://formsubmit.co/ajax/admin@gill.ac.ug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.text();
  if (!res.ok) throw new Error(`FormSubmit failed ${res.status}: ${data}`);
  return data;
}

module.exports = async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed, use POST' });
  }

  let body = req.body;
  // Vercel may not parse JSON automatically in some runtimes — handle string
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const { parent_name, email, phone, school, ref, at } = body;

  if (!email || !String(email).includes('@')) {
    return res.status(400).json({ ok: false, error: 'Valid email required' });
  }

  const payload = {
    parent_name: String(parent_name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    phone: String(phone || '').trim(),
    school: String(school || '').trim(),
    ref: String(ref || '').trim(),
    at: String(at || new Date().toISOString())
  };

  // Always log for Vercel function logs
  console.log('[notify-registration] New signup:', payload);

  let sentVia = 'none';
  let result = null;
  let error = null;

  try {
    if (process.env.RESEND_API_KEY) {
      result = await sendViaResend(payload, process.env.RESEND_API_KEY);
      sentVia = 'resend';
    } else if (process.env.SMTP_PASS) {
      result = await sendViaNodemailer(payload);
      sentVia = 'smtp';
    } else {
      // No keys configured — use FormSubmit fallback so admin still gets email immediately
      result = await sendViaFormSubmit(payload);
      sentVia = 'formsubmit';
    }
  } catch (e) {
    error = e && e.message ? e.message : String(e);
    console.error('[notify-registration] Primary send failed:', error);

    // If primary failed and we didn't already try FormSubmit, try it as last resort
    if (sentVia !== 'formsubmit') {
      try {
        result = await sendViaFormSubmit(payload);
        sentVia = 'formsubmit-fallback';
        error = null; // recovered
      } catch (fallbackErr) {
        console.error('[notify-registration] Fallback also failed:', fallbackErr.message);
        // keep original error
      }
    }
  }

  // Never block user registration — always return 200
  // But include status so frontend can log
  return res.status(200).json({
    ok: !error,
    sentVia,
    to: process.env.NOTIFY_TO || 'admin@gill.ac.ug',
    ...(error ? { warning: error, note: 'Registration succeeded, admin email may have failed — check Vercel logs and env vars' } : { result: typeof result === 'string' ? result.slice(0, 500) : 'sent' })
  });
};
