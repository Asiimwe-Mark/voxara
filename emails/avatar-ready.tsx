import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components';

export const AvatarReadyEmail = ({ username, avatarName }: { username: string; avatarName: string }) => (
  <Html>
    <Head />
    <Preview>Your AI Avatar "{avatarName}" is ready!</Preview>
    <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
      <Container style={{ backgroundColor: '#ffffff', padding: '48px', maxWidth: '600px' }}>
        <Heading>🎉 Your Avatar is Ready!</Heading>
        <Text>Hi {username},</Text>
        <Text>Your AI avatar "<strong>{avatarName}</strong>" has been created and is ready to use.</Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai-studio`} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' }}>
            View My Avatar
          </Link>
        </Section>
      </Container>
    </Body>
  </Html>
);