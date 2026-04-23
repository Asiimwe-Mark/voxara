import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PaymentFailedEmailProps {
  username?: string
  failureReason?: string
  invoiceId?: string
  amountDue?: string
  dueDate?: string
}

export const PaymentFailedEmail = ({
  username = 'Creator',
  failureReason = 'Your payment method was declined.',
  invoiceId,
  amountDue,
  dueDate,
}: PaymentFailedEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voxara.app'

  return (
    <Html>
      <Head />
      <Preview>⚠️ Action Required: Your payment to voxara failed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🎬 voxara</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>⚠️ Payment Failed</Heading>

            <Text style={text}>Hi {username},</Text>

            <Text style={text}>
              We were unable to process your recent payment. This could be due
              to an expired card, insufficient funds, or a temporary issue with
              your payment method.
            </Text>

            <Section style={errorBox}>
              <Text style={errorText}>Reason: {failureReason}</Text>
            </Section>

            {invoiceId && amountDue && (
              <Section style={invoiceBox}>
                <Text style={invoiceTitle}>Invoice Details</Text>
                <Text style={invoiceRow}>
                  <span style={invoiceLabel}>Invoice ID:</span>{' '}
                  <span style={invoiceValue}>{invoiceId}</span>
                </Text>
                <Text style={invoiceRow}>
                  <span style={invoiceLabel}>Amount Due:</span>{' '}
                  <span style={invoiceValue}>{amountDue}</span>
                </Text>
                {dueDate && (
                  <Text style={invoiceRow}>
                    <span style={invoiceLabel}>Due Date:</span>{' '}
                    <span style={invoiceValue}>{dueDate}</span>
                  </Text>
                )}
              </Section>
            )}

            <Text style={text}>
              To avoid any interruption to your service and ensure continued
              access to your videos and features, please update your payment
              method as soon as possible.
            </Text>

            <Section style={buttonContainer}>
              <Link href={`${baseUrl}/dashboard/billing`} style={button}>
                Update Payment Method
              </Link>
            </Section>

            <Text style={text}>
              We'll automatically retry the payment in a few days. If you have
              any questions or need assistance, please{' '}
              <Link href={`${baseUrl}/support`} style={link}>
                contact our support team
              </Link>
              .
            </Text>

            <Section style={divider} />

            <Text style={footerText}>
              Thank you for being a valued customer.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} voxara. All rights reserved.
            </Text>
            <Text style={footerAddress}>
              voxara Inc., 123 Creator Street, San Francisco, CA 94105
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}

const logo = {
  padding: '32px 48px 0',
  textAlign: 'center' as const,
}

const logoText = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#6366f1',
  margin: '0',
}

const content = {
  padding: '24px 48px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '16px 0 24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
}

const errorBox = {
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
  border: '1px solid #fecaca',
}

const errorText = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
}

const invoiceBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
}

const invoiceTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const invoiceRow = {
  margin: '8px 0',
  fontSize: '14px',
}

const invoiceLabel = {
  color: '#6b7280',
  display: 'inline-block',
  width: '100px',
}

const invoiceValue = {
  color: '#1f2937',
  fontWeight: '500',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#ef4444',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  padding: '12px 32px',
  display: 'inline-block',
}

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
}

const divider = {
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0 24px',
}

const footer = {
  padding: '24px 48px 0',
  borderTop: '1px solid #e5e7eb',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '16px 0',
}

const footerCopyright = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '8px 0',
}

const footerAddress = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '4px 0 16px',
}
