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

interface PaymentSuccessEmailProps {
  username?: string
  planName?: string
  amount?: string
  credits?: number
  nextBillingDate?: string
  invoiceId?: string
}

export const PaymentSuccessEmail = ({
  username = 'Creator',
  planName = 'Pro',
  amount = '$19.00',
  credits = 30,
  nextBillingDate,
  invoiceId,
}: PaymentSuccessEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voxara.app'

  return (
    <Html>
      <Head />
      <Preview>
        Your {planName} subscription is active — {credits.toString()} credits ready!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🎬 voxara</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Payment Confirmed ✅</Heading>

            <Text style={text}>Hi {username},</Text>

            <Text style={text}>
              Thank you for upgrading to the <strong>{planName}</strong> plan!
              Your payment of <strong>{amount}</strong> was successful.
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightText}>
                🎉 {credits} credits have been added to your account
              </Text>
            </Section>

            {nextBillingDate && (
              <Text style={text}>
                Your next billing date is <strong>{nextBillingDate}</strong>.
                You can manage your subscription anytime from your dashboard.
              </Text>
            )}

            {invoiceId && (
              <Section style={invoiceBox}>
                <Text style={invoiceTitle}>Invoice Details</Text>
                <Text style={invoiceRow}>
                  <span style={invoiceLabel}>Invoice ID:</span>{' '}
                  <span style={invoiceValue}>{invoiceId}</span>
                </Text>
                <Text style={invoiceRow}>
                  <span style={invoiceLabel}>Amount Paid:</span>{' '}
                  <span style={invoiceValue}>{amount}</span>
                </Text>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Link href={`${baseUrl}/dashboard`} style={button}>
                Go to Dashboard
              </Link>
            </Section>

            <Text style={text}>
              You now have access to all {planName} features including:
            </Text>

            <ul style={featureList}>
              {planName === 'Pro' && (
                <>
                  <li style={featureItem}>30 videos per month</li>
                  <li style={featureItem}>1080p quality, no watermark</li>
                  <li style={featureItem}>Premium AI voices</li>
                  <li style={featureItem}>Priority email support</li>
                </>
              )}
              {planName === 'Agency' && (
                <>
                  <li style={featureItem}>100 videos per month</li>
                  <li style={featureItem}>4K quality, white-label exports</li>
                  <li style={featureItem}>Custom AI avatars & voice cloning</li>
                  <li style={featureItem}>
                    Team workspaces & priority rendering
                  </li>
                </>
              )}
            </ul>

            <Section style={divider} />

            <Text style={footerText}>
              Need help getting started?{' '}
              <Link href={`${baseUrl}/help`} style={link}>
                Visit our Help Center
              </Link>{' '}
              or reply to this email.
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

const highlightBox = {
  backgroundColor: '#e0e7ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const highlightText = {
  color: '#4338ca',
  fontSize: '20px',
  fontWeight: '600',
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
  backgroundColor: '#6366f1',
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

const featureList = {
  margin: '16px 0',
  paddingLeft: '24px',
}

const featureItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '4px 0',
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
