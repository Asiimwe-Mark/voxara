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

interface WelcomeEmailProps {
  username?: string
  userEmail?: string
}

export const WelcomeEmail = ({
  username = 'Creator',
  userEmail = 'creator@example.com',
}: WelcomeEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voxara.app'

  return (
    <Html>
      <Head />
      <Preview>Welcome to voxara — Start creating viral videos with AI</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🎬 voxara</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Welcome to voxara, {username}!</Heading>

            <Text style={text}>
              We're thrilled to have you on board. Your account has been created
              successfully, and you're ready to start creating stunning faceless
              videos with the power of AI.
            </Text>

            <Section style={highlightBox}>
              <Row>
                <Column style={highlightColumn}>
                  <Text style={highlightNumber}>3</Text>
                  <Text style={highlightLabel}>Free Credits</Text>
                </Column>
                <Column style={highlightColumn}>
                  <Text style={highlightNumber}>∞</Text>
                  <Text style={highlightLabel}>Creative Possibilities</Text>
                </Column>
              </Row>
            </Section>

            <Text style={text}>With voxara, you can:</Text>

            <ul style={featureList}>
              <li style={featureItem}>
                <strong>✨ AI Script Generation</strong> — Turn any topic into
                an engaging script in seconds
              </li>
              <li style={featureItem}>
                <strong>🎙️ Professional Voiceovers</strong> — Natural AI voices
                that bring your script to life
              </li>
              <li style={featureItem}>
                <strong>🎥 Stunning Visuals</strong> — Automatically matched
                stock footage for every scene
              </li>
              <li style={featureItem}>
                <strong>🚀 One‑Click Export</strong> — Download ready‑to‑publish
                videos for YouTube, TikTok, and more
              </li>
            </ul>

            <Section style={buttonContainer}>
              <Link href={`${baseUrl}/dashboard/create`} style={button}>
                Create Your First Video
              </Link>
            </Section>

            <Text style={text}>
              Your free plan includes <strong>3 videos per month</strong> at
              720p quality. Ready to take it further? Upgrade to Pro for
              watermark‑free 1080p videos and premium voices.
            </Text>

            <Section style={divider} />

            <Text style={footerText}>
              Need help?{' '}
              <Link href={`${baseUrl}/help`} style={link}>
                Visit our Help Center
              </Link>{' '}
              or reply to this email — we're here for you.
            </Text>

            <Text style={footerText}>
              Happy creating!
              <br />
              The voxara Team
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
  padding: '16px',
  margin: '24px 0',
}

const highlightColumn = {
  textAlign: 'center' as const,
  width: '50%',
}

const highlightNumber = {
  color: '#4338ca',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '1.2',
}

const highlightLabel = {
  color: '#4338ca',
  fontSize: '14px',
  fontWeight: '500',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
}

const featureList = {
  margin: '16px 0',
  paddingLeft: '24px',
}

const featureItem = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '8px 0',
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
