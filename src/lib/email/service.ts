import { resend } from '@/lib/resend';
import { WelcomeEmail } from '../../../emails/welcome';
import { PaymentSuccessEmail } from '../../../emails/payment-success';
import { PaymentFailedEmail } from '../../../emails/payment-failed';
import { CreditAlertEmail } from '../../../emails/credit-alert';

export async function sendWelcomeEmail(to: string, username: string) {
  await resend.emails.send({
    from: 'voxara <welcome@voxara.app>',
    to: [to],
    subject: 'Welcome to voxara! 🎬',
    react: WelcomeEmail({ username, userEmail: to }),
  });
}

export async function sendPaymentSuccessEmail(
  to: string,
  username: string,
  planName: string,
  amount: string,
  credits: number,
  nextBillingDate: string
) {
  await resend.emails.send({
    from: 'voxara <billing@voxara.app>',
    to: [to],
    subject: `Your ${planName} subscription is active! ✅`,
    react: PaymentSuccessEmail({ username, planName, amount, credits, nextBillingDate }),
  });
}

export async function sendPaymentFailedEmail(to: string, username: string, failureReason: string) {
  await resend.emails.send({
    from: 'voxara <billing@voxara.app>',
    to: [to],
    subject: '⚠️ Action Required: Payment Failed',
    react: PaymentFailedEmail({ username, failureReason }),
  });
}

export async function sendCreditAlertEmail(
  to: string,
  username: string,
  creditsLeft: number,
  autoTopUpEnabled: boolean,
  autoTopUpAmount?: number,
  autoTopUpThreshold?: number
) {
  await resend.emails.send({
    from: 'voxara <alerts@voxara.app>',
    to: [to],
    subject: autoTopUpEnabled ? `Auto Top‑Up: ${autoTopUpAmount} credits added` : `⏳ Low Credits: ${creditsLeft} remaining`,
    react: CreditAlertEmail({ username, creditsLeft, autoTopUpEnabled, autoTopUpAmount, autoTopUpThreshold }),
  });
}