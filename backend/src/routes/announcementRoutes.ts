import { Router } from 'express';
import { announcementController } from '../controllers/announcementController';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', announcementController.getAnnouncements);
router.post('/', authMiddleware as any, adminOnly as any, announcementController.createAnnouncement);
router.patch('/:id', authMiddleware as any, adminOnly as any, announcementController.updateAnnouncement);
router.delete('/:id', authMiddleware as any, adminOnly as any, announcementController.deleteAnnouncement);

export default router;
