import { Router } from 'express';
import { villageInfoController } from '../controllers/villageInfoController';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', villageInfoController.getRules);
router.post('/', authMiddleware as any, adminOnly as any, villageInfoController.createRule);
router.patch('/:id', authMiddleware as any, adminOnly as any, villageInfoController.updateRule);
router.delete('/:id', authMiddleware as any, adminOnly as any, villageInfoController.deleteRule);

export default router;
