import express from 'express';
import passport from 'passport';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, changeUserRole, uploadDocuments } from '../controllers/user.controller.js';
import verifyJWT from '../middlewares/verifyJWT.js';
import UserDTO from '../../dto/UserDTO.js';
import UserMongoDAO from '../../dao/mongo/UserMongoDAO.js';
import verifyRole from '../middlewares/verifyRole.js'; 
import logger from '../middlewares/logger.js';
import { sendDeletionEmail } from '../services/emailService.js'; 

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'profile') {
      folder += 'profiles/';
    } else if (file.fieldname === 'product') {
      folder += 'products/';
    } else if (file.fieldname === 'documents') {
      folder += 'documents/';
    }
    
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']; 
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPEG, y PNG.'), false); 
  }
};

const upload = multer({ 
  storage,
  fileFilter  
}).fields([
  { name: 'profile', maxCount: 1 },
  { name: 'product', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);


router.get('/', verifyJWT, verifyRole(['admin']), async (req, res, next) => {
  try {
    const users = await UserMongoDAO.getAllUsers(); 
    const usersDTO = users.map(user => new UserDTO(user)); 
    res.json(usersDTO); 
  } catch (error) {
    next(error);
  }
});

router.delete('/', verifyJWT, verifyRole(['admin']), async (req, res, next) => {
  try {
    const inactiveUsers = await UserMongoDAO.getInactiveUsers(); 

    for (const user of inactiveUsers) {
      await UserMongoDAO.deleteUser(user._id); 
      await sendDeletionEmail(user.email);
    }

    res.json({ message: `${inactiveUsers.length} usuarios eliminados por inactividad.` });
  } catch (error) {
    next(error);
  }
});


router.get('/admin/users', verifyJWT, verifyRole(['admin']), async (req, res, next) => {
  try {
    const users = await UserMongoDAO.getAllUsers(); 
    res.render('adminUsers', { users }); 
  } catch (error) {
    next(error);
  }
});


router.post('/:uid/role', verifyJWT, verifyRole(['admin']), async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    await UserMongoDAO.updateUserRole(uid, role);
    res.redirect('/api/users/admin/users'); 
  } catch (error) {
    next(error);
  }
});


router.post('/:uid/delete', verifyJWT, verifyRole(['admin']), async (req, res, next) => {
  try {
    const { uid } = req.params;
    await UserMongoDAO.deleteUser(uid); 
    res.redirect('/api/users/admin/users'); 
  } catch (error) {
    next(error);
  }
});


router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  registerUser(req, res, next);
});

router.post('/login', (req, res, next) => {
  loginUser(req, res, next);
});

router.get('/logout', (req, res) => {
  logoutUser(req, res);
});

router.get('/current', verifyJWT, (req, res) => {
  const userDTO = new UserDTO(req.user);
  res.json({
    message: 'Acceso autorizado',
    user: userDTO,
  });
});

router.get('/auth/google', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/products');
  }
);

router.post('/forgot-password', (req, res, next) => {
  forgotPassword(req, res, next);
});

router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.render('resetPassword', { token });
});

router.post('/reset-password/:token', (req, res, next) => {
  const { token } = req.params;
  resetPassword(req, res, next);
});

router.put('/premium/:uid', changeUserRole);

router.post('/:uid/documents', upload, uploadDocuments);

export default router;
