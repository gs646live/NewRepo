import { Router } from 'express';
import { getCatalog, getLesson } from '../controllers/lessonController.js';

const router = Router();

router.get('/', getCatalog);
router.get('/:alphabet/:level', getLesson);

export default router;
