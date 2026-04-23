import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface CreditAlertEmailProps {
  username?: string
  creditsLeft?: number
  autoTopUpEnabled?: boolean
  autoTopUpAmount?: number
  autoTopUpThreshold?: number
  // For manual purchase receipts
  purchaseAmount?: number
  purchaseCredits?: number
  isPurchaseReceipt?: boolean
  transactionId?: string
}

export const CreditAlertEmail = ({
  username = 'Creator',
  creditsLeft = 2,
  autoTopUpEnabled = false,
  autoTopUpAmount,
  autoTopUpThreshold,
  purchaseAmount,
  purchaseCredits,
  isPurchaseReceipt = false,
  transactionId,
}: CreditAlertEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voxara.app'

  return (
    <Html>
      <Head />
      <Preview>
        {isPurchaseReceipt
          ? `Receipt: ${purchaseCredits} credits added to your account`
          : autoTopUpEnabled
            ? `Auto Top‑Up: ${autoTopUpAmount} credits added`
            : `⏳ Low Credits Alert: ${creditsLeft} remaining`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🎬 voxara</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>
              {isPurchaseReceipt
                ? 'Credit Purchase Receipt'
                : autoTopUpEnabled && !creditsLeft
                  ? 'Auto Top‑Up Successful'
                  : 'Credits Running Low'}
            </Heading>

            <Text style={text}>Hi {username},</Text>

            {isPurchaseReceipt ? (
              // Purchase receipt content
              <>
                <Text style={text}>
                  Thank you for your purchase! Your payment has been processed
                  successfully.
                </Text>
                <Section style={receiptBox}>
                  <Row style={receiptRow}>
                    <Column style={receiptLabel}>Credits Added</Column>
                    <Column style={receiptValue}>
                      <strong>{purchaseCredits} credits</strong>
                    </Column>
                  </Row>
                  <Row style={receiptRow}>
                    <Column style={receiptLabel}>Amount Paid</Column>
                    <Column style={receiptValue}>
                      <strong>${purchaseAmount?.toFixed(2)}</strong>
                    </Column>
                  </Row>
                  {transactionId && (
                    <Row style={receiptRow}>
                      <Column style={receiptLabel}>Transaction ID</Column>
                      <Column style={receiptValue}>
                        <span style={monoText}>{transactionId}</span>
                      </Column>
                    </Row>
                  )}
                  <Row style={receiptRow}>
                    <Column style={receiptLabel}>New Balance</Column>
                    <Column style={receiptValue}>
                      <strong>{creditsLeft} credits</strong>
                    </Column>
                  </Row>
                </Section>
                <Text style={text}>
                  You can now continue creating amazing videos.
                </Text>
              </>
            ) : autoTopUpEnabled ? (
              // Auto top‑up confirmation
              <>
                <Text style={text}>
                  We noticed your credit balance dropped below{' '}
                  {autoTopUpThreshold} credits. As requested, we've
                  automatically added {autoTopUpAmount} credits to your account.
                </Text>
                <Section style={highlightBox}>
                  <Text style={highlightText}>
                    ✨ {autoTopUpAmount} credits have been added
                  </Text>
                  <Text style={highlightSubtext}>
                    Your new balance: {creditsLeft} credits
                  </Text>
                </Section>
                <Text style={text}>
                  No action is needed — you're all set to continue creating.
                </Text>
              </>
            ) : (
              // Low balance warning
              <>
                <Text style={text}>
                  You currently have{' '}
                  <strong>
                    {creditsLeft} credit{creditsLeft !== 1 ? 's' : ''}
                  </strong>{' '}
                  remaining in your account. Each video generation consumes 1
                  credit.
                </Text>
                <Section style={warningBox}>
                  <Text style={warningText}>
                    ⚡ Don't let your creativity stop — top up now!
                  </Text>
                </Section>
                <Text style={text}>
                  To ensure uninterrupted service, consider purchasing more
                  credits or enabling Auto Top‑Up.
                </Text>
                <Section style={buttonContainer}>
                  <Link href={`${baseUrl}/dashboard/billing`} style={button}>
                    Buy Credits
                  </Link>
                </Section>
                <Text style={text}>
                  <Link href={`${baseUrl}/dashboard/billing`} style={link}>
                    Manage your credit settings
                  </Link>{' '}
                  to enable Auto Top‑Up and never run out.
                </Text>
              </>
            )}

            <Section style={divider} />

            <Text style={footerText}>
              Need help?{' '}
              <Link href={`${baseUrl}/support`} style={link}>
                Contact Support
              </Link>{' '}
              or visit our{' '}
              <Link href={`${baseUrl}/help`} style={link}>
                Help Center
              </Link>
              .
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
  margin: '0 0 8px',
}

const highlightSubtext = {
  color: '#4338ca',
  fontSize: '14px',
  margin: '0',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
  border: '1px solid #fde68a',
}

const warningText = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
}

const receiptBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
}

const receiptRow = {
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
}

const receiptLabel = {
  color: '#6b7280',
  fontSize: '14px',
  width: '50%',
}

const receiptValue = {
  color: '#1f2937',
  fontSize: '14px',
  width: '50%',
  textAlign: 'right' as const,
}

const monoText = {
  fontFamily: 'monospace',
  fontSize: '12px',
  color: '#6b7280',
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
