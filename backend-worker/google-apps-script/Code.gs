const WORKER_VERIFY_PREFIX =
  'https://chongsheng-backend.chongsheng20000.workers.dev/api/contact/verify?token=';

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isAllowedRequest(payload) {
  const expectedSecret = PropertiesService
    .getScriptProperties()
    .getProperty('MAILER_SHARED_SECRET');

  return Boolean(
    expectedSecret &&
    payload &&
    payload.secret === expectedSecret &&
    typeof payload.to === 'string' &&
    /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/.test(payload.to) &&
    typeof payload.name === 'string' &&
    payload.name.length >= 1 &&
    payload.name.length <= 50 &&
    typeof payload.verificationUrl === 'string' &&
    payload.verificationUrl.indexOf(WORKER_VERIFY_PREFIX) === 0 &&
    Number(payload.expiresMinutes) === 30
  );
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || '{}');
    if (!isAllowedRequest(payload)) return jsonResponse({ ok: false });

    const safeName = escapeHtml(payload.name);
    const safeUrl = escapeHtml(payload.verificationUrl);
    const subject = '确认你的联系消息 | 重生日记';
    const body = [
      `${payload.name}，你好：`,
      '',
      '有人使用这个邮箱向重生日记提交了联系消息。',
      '请在 30 分钟内打开下面的链接确认邮箱：',
      payload.verificationUrl,
      '',
      '如果不是你提交的，不需要做任何操作。未验证消息不会进入收件箱。',
      '',
      'CHONGSHENG DAILY OS'
    ].join('\n');
    const htmlBody = `
      <div style="background:#0a0b0d;color:#ede8dc;padding:28px;font-family:Arial,'Microsoft YaHei',sans-serif;line-height:1.7">
        <div style="max-width:620px;margin:0 auto;border:1px solid #675b3f;background:#111317;padding:28px">
          <p style="margin:0 0 18px;color:#c8b27a;font-size:12px">CHONGSHENG DAILY OS</p>
          <h1 style="margin:0 0 18px;font-size:22px;font-weight:600">确认你的联系邮箱</h1>
          <p>${safeName}，你好。</p>
          <p>有人使用这个邮箱向重生日记提交了联系消息。点击下面的按钮后，消息才会进入收件箱。</p>
          <p style="margin:26px 0">
            <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;border:1px solid #c8b27a;color:#f2f0e8;text-decoration:none;background:#191a1d">确认邮箱</a>
          </p>
          <p style="color:#99978f;font-size:13px">链接 30 分钟内有效且只能使用一次。如果不是你提交的，忽略这封邮件即可。</p>
          <hr style="border:0;border-top:1px solid #302f2b;margin:24px 0">
          <p style="margin:0;color:#77766f;font-size:12px">把日子写下来，把工具磨顺手。</p>
        </div>
      </div>`;

    MailApp.sendEmail({
      to: payload.to,
      subject: subject,
      body: body,
      htmlBody: htmlBody,
      name: '重生日记'
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false });
  }
}
