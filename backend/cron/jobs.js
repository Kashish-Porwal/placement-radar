const cron = require('node-cron');
const Application = require('../models/Application');
const { generateFollowUp } = require('../services/aiService');
const { sendInterviewReminderEmail, sendWeeklyDigestEmail } = require('../services/emailService');

const initCronJobs = () => {
  // 1. Daily/Frequent Worker for Follow-ups and 24-Hour Interview Reminders
  cron.schedule('*/10 * * * * *', async () => {
    try {
      // Check for applications needing follow-up
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const applications = await Application.find({
        status: 'Applied',
        appliedDate: { $lt: fiveDaysAgo },
        followUpSent: false
      });

      if (applications.length > 0) {
        console.log(`[Cron] Found ${applications.length} applications needing follow-up...`);
        
        for (const app of applications) {
          const draft = await generateFollowUp(app);
          app.followUpSent = true;
          app.timeline.push({
            stage: 'Applied',
            date: new Date(),
            notes: `Auto-generated follow-up drafted:\n\n${draft}`
          });
          await app.save();
          console.log(`[Cron] Follow-up generated for ${app.company}`);
        }
      }

      // Check for upcoming interviews in the next 24 hours (24h Interview Reminder)
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcomingInterviews = await Application.find({
        interviewDate: { $gte: now, $lte: in24Hours },
        interviewReminderSent: false
      }).populate('userId');

      if (upcomingInterviews.length > 0) {
        console.log(`[Cron] Found ${upcomingInterviews.length} upcoming interview reminders...`);
        for (const app of upcomingInterviews) {
          app.interviewReminderSent = true;
          app.timeline.push({
            stage: app.status,
            date: new Date(),
            notes: `🔔 24-Hour Interview Reminder Triggered & Email Sent! Interview scheduled for ${app.company} (${app.role}) at ${app.interviewDate.toLocaleString()}`
          });
          await app.save();

          // Dispatch Email Alert to User's Email
          const userEmail = app.userId?.email || 'kashishporwal1702@gmail.com';
          await sendInterviewReminderEmail(userEmail, app.company, app.role, app.interviewDate);
        }
      }
    } catch (error) {
      console.error('[Cron] Error running follow-up job:', error);
    }
  });

  // 2. Weekly Digest Cron Job (Runs every Sunday at 9:00 AM)
  cron.schedule('0 9 * * 0', async () => {
    try {
      console.log('[Cron] Generating Weekly Performance Digest Email...');
      const allApps = await Application.find();
      const appliedCount = allApps.length;
      const interviewCount = allApps.filter(a => a.status === 'Interview_R1' || a.status === 'Interview_R2' || a.status === 'OA').length;

      const aiAdvice = interviewCount > 0 
        ? `Great momentum this week! You have ${interviewCount} active interview/OA tracks. Focus on practicing LeetCode Mediums and reviewing past project architectures.`
        : `You have ${appliedCount} active applications. Consider applying to 3-5 new roles this week and customizing your resume skills.`;

      await sendWeeklyDigestEmail('kashishporwal1702@gmail.com', {
        appliedCount,
        interviewCount,
        aiAdvice
      });
    } catch (error) {
      console.error('[Cron] Error sending weekly digest email:', error);
    }
  });

  console.log('Cron jobs initialized successfully.');
};

module.exports = initCronJobs;
