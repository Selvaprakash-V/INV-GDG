// Pure render functions for account emails: { subject, text, html }.
// Kept apart from the services so copy changes never touch business logic.

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout({ greeting, lines, cta, footer }) {
  const text = [greeting, '', ...lines, '', `${cta.label}: ${cta.url}`, '', footer].join('\n');
  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2937;line-height:1.5">
<p>${escapeHtml(greeting)}</p>
${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join('\n')}
<p><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none">${escapeHtml(cta.label)}</a></p>
<p style="font-size:13px;color:#6b7280">If the button does not work, copy this link into your browser:<br>${escapeHtml(cta.url)}</p>
<p style="font-size:13px;color:#6b7280">${escapeHtml(footer)}</p>
</body></html>`;
  return { text, html };
}

export function passwordResetEmail({ name, url, ttlMinutes }) {
  return {
    subject: 'Reset your TrackIt password',
    ...layout({
      greeting: `Hi ${name},`,
      lines: [`We received a request to reset your TrackIt password. This link works once and expires in ${ttlMinutes} minutes.`],
      cta: { label: 'Choose a new password', url },
      footer: "If you didn't ask for this, you can ignore this email. Your password stays the same.",
    }),
  };
}

export function verifyEmailEmail({ name, url, ttlHours }) {
  return {
    subject: 'Confirm your email for TrackIt',
    ...layout({
      greeting: `Hi ${name},`,
      lines: [`Please confirm this is your email address so we can send you expiry and stock alerts. The link expires in ${ttlHours} hours.`],
      cta: { label: 'Confirm email', url },
      footer: "If you didn't create a TrackIt account, you can ignore this email.",
    }),
  };
}
