import { Router } from 'express';
import { getProgress, resetProgress, saveProgress } from '../controllers/progressController.js';

const router = Router();

router.post('/', saveProgress);
router.get('/:username', getProgress);
router.delete('/:username', resetProgress);

export default router;
