import { Router } from 'express';
const router = Router();
import memberController from '../../controller/memberController.js';
import authenticateUser from '../../middleware/authenticateUser.js';
// POST /v1/member route handler
router.post('/', authenticateUser, memberController.addMember);
// DELETE /v1/member/:id
router.delete('/:id', authenticateUser, memberController.removeMember);
export default router;
