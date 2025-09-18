// services/emailService.js
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendResetTokenEmail(to, token) {
  try {
     const { data, error } = await resend.emails.send({
      from: 'SeuApp <rbernardoc@gmail.com>',
      to,
      subject: 'Recuperação de senha',
      html: `<p>Seu token para redefinir a senha é: <strong>${token}</strong></p>`,
    });
     if (error) {
       console.error('Erro ao enviar e-mail:', error);
       throw error;
     }
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}

export { sendResetTokenEmail };
