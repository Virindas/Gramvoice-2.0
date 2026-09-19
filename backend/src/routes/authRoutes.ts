import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register-admin', authController.registerAdmin);
router.post('/login-admin', authController.loginAdmin);
router.post('/register-villager', authController.registerVillager);
router.post('/login-villager', authController.loginVillager);
router.post('/check-phone', authController.checkVillagerPhone);
router.post('/reset-pin', authController.resetVillagerPin);
router.post('/verify-otp', authController.verifyVillagerOTP);
router.get('/me', authMiddleware as any, authController.getMe as any);
router.put('/me', authMiddleware as any, authController.updateUserProfile as any);
router.post('/forgot-password-question', authController.getAdminSecurityQuestion);
router.post('/verify-security-answers', authController.verifyAdminSecurityAnswers);
router.post('/reset-password', authController.resetAdminPassword);

export default router;
