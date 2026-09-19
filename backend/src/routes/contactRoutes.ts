import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', contactController.getContacts);
router.post('/', authMiddleware as any, adminOnly as any, contactController.createContact);
router.put('/:id', authMiddleware as any, adminOnly as any, contactController.updateContact);
router.patch('/:id', authMiddleware as any, adminOnly as any, contactController.updateContact);
router.delete('/:id', authMiddleware as any, adminOnly as any, contactController.deleteContact);

export default router;
