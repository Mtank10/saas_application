import express from 'express';
const router = express.Router()

import userController from "../../controller/userController.js";

router.post('/signup',userController.signup);

router.post('/signin',userController.signin);

router.get('/me',userController.profile);


export default router