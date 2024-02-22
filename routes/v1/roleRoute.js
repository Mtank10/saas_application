import express from 'express';
const router = express.Router();

import roleController from '../../controller/roleController.js';

router.post('/', roleController.addRole);

router.get('/', roleController.getRoles);

export default router;