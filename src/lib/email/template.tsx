import { render } from "@react-email/components";
import { WelcomeEmail } from "../../../emails/welcome";
import { PaymentSuccessEmail } from "../../../emails/payment-success";
import { PaymentFailedEmail } from "../../../emails/payment-failed";
import { CreditAlertEmail } from "../../../emails/credit-alert";
import { AvatarReadyEmail } from "../../../emails/avatar-ready";
import { ResetPasswordEmail } from "../../../emails/reset-password";

// Re-export all templates for convenient imports
export {
  WelcomeEmail,
  PaymentSuccessEmail,
  PaymentFailedEmail,
  CreditAlertEmail,
  AvatarReadyEmail,
  ResetPasswordEmail,
};

/**
 * Render a React Email template to an HTML string.
 * Useful when sending emails via Resend or other providers.
 */
export async function renderEmailTemplate<T extends Record<string, any>>(
  Template: React.ComponentType<T>,
  props: T
): Promise<string> {
  return await render(<Template {...props} />);
}

/**
 * Convenience functions for each template type.
 */
export async function renderWelcomeEmail(
  props: Parameters<typeof WelcomeEmail>[0]
): Promise<string> {
  return renderEmailTemplate(WelcomeEmail, props);
}

export async function renderPaymentSuccessEmail(
  props: Parameters<typeof PaymentSuccessEmail>[0]
): Promise<string> {
  return renderEmailTemplate(PaymentSuccessEmail, props);
}

export async function renderPaymentFailedEmail(
  props: Parameters<typeof PaymentFailedEmail>[0]
): Promise<string> {
  return renderEmailTemplate(PaymentFailedEmail, props);
}

export async function renderCreditAlertEmail(
  props: Parameters<typeof CreditAlertEmail>[0]
): Promise<string> {
  return renderEmailTemplate(CreditAlertEmail, props);
}

export async function renderAvatarReadyEmail(
  props: Parameters<typeof AvatarReadyEmail>[0]
): Promise<string> {
  return renderEmailTemplate(AvatarReadyEmail, props);
}

export async function renderResetPasswordEmail(
  props: Parameters<typeof ResetPasswordEmail>[0]
): Promise<string> {
  return renderEmailTemplate(ResetPasswordEmail, props);
}