import nodemailer from 'nodemailer';
import config from '../config/config.js'; 


export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.emailUser, 
        pass: config.emailPass, 
      },
      tls: {
        rejectUnauthorized: false, 
      },
    });

    const mailOptions = {
      from: 'noreply@app.com', 
      to, 
      subject,
      html: htmlContent, 
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a: ${to}`);
  } catch (error) {
    console.error('Error enviando el correo:', error);
    throw new Error('Error enviando el correo');
  }
};

export const sendDeletionEmail = async (userEmail) => {
  await sendEmail(
    userEmail,
    'Cuenta eliminada por inactividad',
    '<p>Tu cuenta ha sido eliminada por inactividad debido a la falta de conexión en los últimos días.</p>'
  );
};
