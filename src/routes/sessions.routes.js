import express from 'express';
import verifyJWT from '../middlewares/verifyJWT.js';
import UserDTO from '../../dto/UserDTO.js';

const router = express.Router();

router.get('/current', verifyJWT, (req, res) => {
  const userDTO = new UserDTO(req.user);
  res.json({
    user: userDTO,
  });
});

export default router;
