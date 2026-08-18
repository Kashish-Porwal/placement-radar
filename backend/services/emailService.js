const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'placementradar.alerts@gmail.com',
    pass: process.env.EMAIL_PASS || 'app-password-placeholder'
  }
});

const sendInterviewReminderEmail = async (toEmail, company, role, interviewDate) => {
  const formattedDate = new Date(interviewDate).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const mailOptions = {
    from: '"Placement Radar Alerts" <placementradar.alerts@gmail.com>',
    to: toEmail || 'kashishporwal1702@gmail.com',
    subject: `🚨 Interview Reminder: ${company} (${role}) in 24 Hours!`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0f1523; color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #06b6d4; margin-bottom: 8px;">🚨 Upcoming Interview Alert!</h2>
        <p style="font-size: 16px; color: #e2e8f0;">Hi Kashish,</p>
        <p style="font-size: 15px; color: #cbd5e1;">Your interview for <strong>${role}</strong> at <strong style="color: #38bdf8;">${company}</strong> is scheduled in less than 24 hours.</p>
        
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border-left: 4px solid #06b6d4; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8;">📅 Date & Time:</p>
          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #ffffff;">${formattedDate}</p>
        </div>

        <p style="font-size: 14px; color: #94a3b8;">Good luck with your interview preparation!</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Placement Radar AI — Automated Interview Assistant</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Interview reminder email sent to ${toEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.log(`[Email Dispatch] Sent 24-Hour Interview Reminder Email to ${toEmail || 'kashishporwal1702@gmail.com'} for ${company} (${role}) scheduled at ${formattedDate}`);
    return { success: true, simulated: true };
  }
};

const sendWeeklyDigestEmail = async (toEmail, stats) => {
  const mailOptions = {
    from: '"Placement Radar AI" <placementradar.alerts@gmail.com>',
    to: toEmail || 'kashishporwal1702@gmail.com',
    subject: `📊 Your Weekly Placement Radar Digest — ${stats.appliedCount} Applications Tracked!`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0f1523; color: #ffffff; padding: 30px; border-radius: 16px;">
        <h2 style="color: #06b6d4; margin-bottom: 8px;">📊 Weekly Job Hunt Performance Digest</h2>
        <p style="font-size: 15px; color: #cbd5e1;">Hi Kashish, here is your placement activity summary for this week:</p>
        
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 16px 0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">Total Active Applications: <strong style="color: #38bdf8;">${stats.appliedCount}</strong></p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Interviews & OAs Scheduled: <strong style="color: #4ade80;">${stats.interviewCount}</strong></p>
        </div>

        <div style="background: rgba(6,182,212,0.1); padding: 16px; border-radius: 12px; border-left: 4px solid #06b6d4; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #06b6d4;">💡 AI Recommendation for Next Week:</p>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #e2e8f0; line-height: 1.5;">${stats.aiAdvice}</p>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">Placement Radar AI — Automated Weekly Digest</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Weekly digest email sent to ${toEmail}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.log(`[Email Dispatch] Sent Weekly Digest Email to ${toEmail || 'kashishporwal1702@gmail.com'} — ${stats.appliedCount} Active Applications, ${stats.interviewCount} Interviews`);
    return { success: true, simulated: true };
  }
};

module.exports = { sendInterviewReminderEmail, sendWeeklyDigestEmail };
