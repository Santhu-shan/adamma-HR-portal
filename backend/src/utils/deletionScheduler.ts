import { UserModel } from '../models/User';
import { sendGraphEmail } from './graphMailHelper';

export const checkAndExecuteDeletions = async (): Promise<void> => {
  try {
    const now = new Date();
    // Query users that are suspended (deactivated) and past their scheduled deletion timestamp
    const usersToDelete = await UserModel.find({
      status: 'SUSPENDED',
      scheduledDeletionDate: { $lte: now }
    });

    if (usersToDelete.length === 0) {
      return;
    }

    console.log(`[AUTO-DELETE] Found ${usersToDelete.length} scheduled accounts ready for permanent scrub.`);

    for (const user of usersToDelete) {
      const email = user.email;
      const name = user.name;

      const deletionHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e53e3e;">
            <h2 style="color: #e53e3e; margin: 0; font-size: 24px; letter-spacing: 1px;">ADAMMA HRMS SECURITY PORTAL</h2>
            <p style="margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; font-family: monospace;">Account Permanent Deletion Dispatch</p>
          </div>
          
          <div style="padding: 30px 10px;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4a5568; margin: 0 0 25px 0;">This is the final notification that your Adamma corporate HRMS user account has been **permanently deleted** from the system as scheduled.</p>
            
            <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <p style="font-size: 13px; line-height: 1.6; margin: 0; color: #718096;">
                All your active employee profiles, shift settings, leave balances, bank credentials, and appraisal files have been scrubbed from the active MongoDB database node.
              </p>
            </div>
            
            <p style="font-size: 12px; line-height: 1.6; color: #718096; margin: 0;">
              Thank you for your time at Adamma Info Services.
            </p>
          </div>

          <div style="border-top: 1px solid #edf2f7; padding-top: 20px; font-size: 10px; color: #a0aec0; text-align: center; font-family: monospace;">
            This is an automated final security cleanup dispatch.
          </div>
        </div>
      `;

      try {
        // Send final notification email
        await sendGraphEmail(email, [], "ADAMMA HRMS - Your Account Has Been Permanently Deleted", deletionHtml);
      } catch (emailErr: any) {
        console.error(`[AUTO-DELETE] Failed to dispatch final deletion notice to ${email}:`, emailErr.message);
      }

      // Hard Delete user record from MongoDB
      await UserModel.findByIdAndDelete(user._id);
      console.log(`[AUTO-DELETE] Permanent database scrub complete for user: ${email}`);
    }
  } catch (error) {
    console.error('[AUTO-DELETE] Deletion scheduler encountered an execution failure:', error);
  }
};

export const startDeletionScheduler = (): void => {
  console.log('⚡ ADAMMA Auto-Deletion Background Worker active. Scanning database hourly.');
  
  // Execute once immediately on server startup
  checkAndExecuteDeletions();

  // Run periodic scanner checks (every 1 minute for fast local test capability, extremely lightweight)
  setInterval(checkAndExecuteDeletions, 60 * 1000);
};
