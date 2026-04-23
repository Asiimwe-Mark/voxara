import { resend } from '@/lib/resend';
import { AvatarReadyEmail } from '../../../emails/avatar-ready';

export async function sendAvatarReadyEmail(to: string, username: string, avatarName: string) {
  await resend.emails.send({
    from: 'voxara <ai@voxara.app>',
    to: [to],
    subject: `✨ Your AI Avatar "${avatarName}" is ready!`,
    react: AvatarReadyEmail({ username, avatarName }),
  });
}