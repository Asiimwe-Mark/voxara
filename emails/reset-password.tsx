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

interface ResetPasswordEmailProps {
  username?: string
  resetLink: string
  expiresInHours?: number
}

export const ResetPasswordEmail = ({
  username = 'Creator',
  resetLink,
  expiresInHours = 24,
}: ResetPasswordEmailProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://voxara.app'

  return (
    <Html>
      <Head />
      <Preview>Reset your voxara password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Text style={logoText}>🎬 voxara</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Reset Your Password</Heading>

            <Text style={text}>Hi {username},</Text>

            <Text style={text}>
              We received a request to reset the password for your voxara
              account. If you didn't make this request, you can safely ignore
              this email — your password will remain unchanged.
            </Text>

            <Section style={buttonContainer}>
              <Link href={resetLink} style={button}>
                Reset Password
              </Link>
            </Section>

            <Text style={text}>
              This link will expire in <strong>{expiresInHours} hours</strong>.
              If you need a new link, you can request another password reset
              from the login page.
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                🔒 For security, this link can only be used once. If you've
                already reset your password, no further action is needed.
              </Text>
            </Section>

            <Text style={text}>
              If the button above doesn't work, copy and paste this link into
              your browser:
            </Text>

            <Text style={linkText}>{resetLink}</Text>

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

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
}

const infoText = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0',
}

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
}

const linkText = {
  color: '#6366f1',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
  margin: '8px 0',
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
