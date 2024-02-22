import { Router } from 'express';
import communityController from '../../controller/communityController.js';
import authenticateUser from '../../middleware/authenticateUser.js';

const router = Router();

// POST /v1/community
router.post('/', authenticateUser, communityController.createCommunity);

// GET /v1/community
router.get('/', communityController.getAllCommunities);

router.get('/:id/members', communityController.getCommunityMembers);

router.get('/me/owner',authenticateUser, communityController.getMyCommunities);

router.get('/me/member',authenticateUser, communityController.getJoinedCommunities);
export default router;
