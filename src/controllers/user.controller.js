import UserDao from '../../dao/mongo/UserMongoDAO.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import nodemailer from 'nodemailer';
import config from '../config/config.js'; 
import CustomError from '../middlewares/customError.js';
import errorDictionary from '../config/errorDictionary.js';
import logger from '../middlewares/logger.js';

const jwtSecret = config.jwtSecret;

const userDTO = (user) => ({
  id: user._id,
  first_name: user.first_name,
  last_name: user.last_name,
  email: user.email,
  role: user.role,
});

export const registerUser = async (req, res, next) => {
  const { first_name, last_name, email, age, password } = req.body;

  if (!first_name || !last_name || !email || !age || !password) {
    logger.warn('Campos obligatorios faltantes en el registro.');
    return next(new CustomError(errorDictionary.USER_ERRORS.MISSING_FIELDS));
  }

  try {
    const existingUser = await UserDao.getUserByEmail(email);
    if (existingUser) {
      logger.warn(`Correo ya registrado: ${email}`);
      return next(new CustomError(errorDictionary.USER_ERRORS.EMAIL_ALREADY_REGISTERED));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: 'user',
    };

    await UserDao.createUser(newUser);
    logger.info(`Usuario registrado con éxito: ${email}`);
    res.redirect('/login');
  } catch (error) {
    logger.error('Error en el registro de usuario:', error);
    next(error);
  }
};

export const loginUser = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      logger.error('Error al autenticar el usuario:', err);
      return next(err);
    }
    if (!user) {
      logger.warn('Credenciales inválidas');
      return next(new CustomError(errorDictionary.USER_ERRORS.INVALID_CREDENTIALS));
    }

    user.last_connection = new Date();
    await user.save();

    const token = jwt.sign({ 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      first_name: user.first_name, 
      last_name: user.last_name 
    }, jwtSecret, {
      expiresIn: '1h',
    });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000,
    });

    logger.info(`Usuario ${user.email} autenticado con éxito.`);
    return res.redirect('/products');
  })(req, res, next);
};

export const logoutUser = async (req, res) => {
  if (!req.user) {
    logger.warn('No se encontró un usuario en la solicitud para cerrar sesión.');
    return res.status(400).json({ message: 'No se puede cerrar sesión porque no hay un usuario autenticado.' });
  }

  req.user.last_connection = new Date();
  await req.user.save();

  res.clearCookie('jwt');
  logger.info('Usuario ha cerrado sesión.');
  res.redirect('/login');
};

export const getCurrentUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    logger.warn('Token no encontrado en la solicitud.');
    return next(new CustomError(errorDictionary.AUTH_ERRORS.TOKEN_INVALID));
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await UserDao.getUserById(decoded.id);

    logger.info('Usuario obtenido de la base de datos:', user);

    if (!user) {
      logger.warn('Usuario no encontrado para el token proporcionado.');
      return next(new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND));
    }

    logger.info('Usuario actual obtenido correctamente.');
    res.json(userDTO(user));
  } catch (error) {
    logger.error('Error al obtener el usuario actual:', error);
    next(error);
  }
};

export const googleCallback = passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/products',
});

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await UserDao.getUserByEmail(email);
    if (!user) {
      logger.warn(`Usuario no encontrado con el correo: ${email}`);
      return next(new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND));
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    logger.info(`Token de recuperación generado para el usuario: ${user.email}`);

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${token}`;

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
      from: 'noreply@tuapp.com',
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
             <a href="${resetUrl}">Restablecer contraseña</a>
             <p>Este enlace expirará en 1 hora.</p>`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Correo de recuperación enviado a: ${user.email}`);

    res.status(200).json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    logger.error('Error al enviar el correo de recuperación de contraseña', error);
    return res.status(500).json({ message: 'Error al enviar el correo' });
  }
};

export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await UserDao.getUserById(decoded.id);
    if (!user) {
      logger.warn('Usuario no encontrado al restablecer la contraseña.');
      return next(new CustomError(errorDictionary.USER_ERRORS.USER_NOT_FOUND));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      logger.warn('La nueva contraseña no puede ser la misma que la anterior.');
      return res.status(400).json({ message: 'No puedes usar la misma contraseña' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    logger.info(`Contraseña actualizada exitosamente para el usuario: ${user.email}`);
    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn('El enlace de restablecimiento ha expirado.');
      return res.status(400).json({ message: 'El enlace ha expirado. Solicita un nuevo enlace.' });
    }
    logger.error('Error al restablecer la contraseña:', err);
    next(err);
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await UserDao.getUserById(uid);

    if (!user) {
      logger.warn('Usuario no encontrado al cambiar el rol.');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];
    const uploadedDocuments = user.documents.map(doc => doc.name);
    const missingDocuments = requiredDocuments.filter(doc => !uploadedDocuments.includes(doc));

    if (missingDocuments.length > 0) {
      return res.status(400).json({ 
        message: `Faltan los siguientes documentos para ser premium: ${missingDocuments.join(', ')}` 
      });
    }

    user.role = 'premium';
    await user.save();

    logger.info(`El rol del usuario ${user.email} ha sido actualizado a premium`);
    res.status(200).json({
      message: 'El usuario ha sido actualizado a premium',
      user: userDTO(user),
    });
  } catch (error) {
    logger.error('Error al cambiar el rol del usuario:', error);
    res.status(500).json({ message: 'Error al cambiar el rol del usuario', error });
  }
};

export const uploadDocuments = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await UserDao.getUserById(uid);

    if (!user) {
      logger.warn('Usuario no encontrado.');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const documentNames = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'];

    if (!req.files.documents || req.files.documents.length < documentNames.length) {
      return res.status(400).json({ message: 'No se han subido suficientes documentos.' });
    }

   
    req.files.documents.forEach((file, index) => {
      if (index < documentNames.length) {
        user.documents.push({
          name: documentNames[index], 
          reference: file.path       
        });
      }
    });

    await user.save(); 

    logger.info(`Documentos subidos correctamente para el usuario ${user.email}`);
    res.status(200).json({ message: 'Documentos subidos correctamente', user });
  } catch (error) {
    logger.error('Error al subir documentos:', error);
    res.status(500).json({ message: 'Error al subir documentos', error });
  }
};
