import { Router } from 'express';
import { serviceRequestController } from '../controllers/serviceRequestController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware as any, serviceRequestController.getRequests as any);
router.post('/', authMiddleware as any, serviceRequestController.createRequest as any);
router.put('/:id', authMiddleware as any, serviceRequestController.updateRequest as any);
router.patch('/:id', authMiddleware as any, serviceRequestController.updateRequest as any);
router.delete('/:id', authMiddleware as any, serviceRequestController.deleteRequest as any);

export default router;
