const nodemailer = require('nodemailer');
const env = require('../config/env');

/**
 * Envía un correo electrónico usando el transporte configurado en EMAIL_TRANSPORT.
 * Modos: 'log' (consola), 'smtp' (Nodemailer), 'emailjs' (@emailjs/nodejs).
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const transport = env.email.transport;

  if (transport === 'log') {
    console.log('📧 [EmailService - LOG] Email simulado:');
    console.log(`   Para: ${to}`);
    console.log(`   Asunto: ${subject}`);
    console.log(`   Contenido HTML: ${html.substring(0, 100)}...`);
    return { success: true, mode: 'log' };
  }

  if (transport === 'smtp') {
    const transporter = nodemailer.createTransport({
      host: env.email.smtp.host,
      port: env.email.smtp.port,
      secure: env.email.smtp.port === 465,
      auth: {
        user: env.email.smtp.user,
        pass: env.email.smtp.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"SERMAB Sistema" <${env.email.smtp.user}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 [EmailService - SMTP] Correo enviado: ${info.messageId}`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  }

  if (transport === 'emailjs') {
    const emailjs = require('@emailjs/nodejs');
    const result = await emailjs.send(
      env.email.emailjs.serviceId,
      env.email.emailjs.templateId,
      { to_email: to, subject, html_content: html },
      {
        publicKey: env.email.emailjs.publicKey,
        privateKey: env.email.emailjs.privateKey,
      }
    );
    console.log(`📧 [EmailService - EmailJS] Status: ${result.status}`);
    return { success: true, mode: 'emailjs', status: result.status };
  }

  throw new Error(`EMAIL_TRANSPORT inválido: ${transport}`);
};

module.exports = { sendEmail };
