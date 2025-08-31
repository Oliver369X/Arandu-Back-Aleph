import { Router } from "express";
import routerUser from "../components/user/user.routes.js";
import authRouter from "../services/auth/auth.routes.js";
import routerRole from "../components/role/role.routes.js";
import routerGrade from "../components/grade/grade.routes.js";
import routerSubject from "../components/subject/subject.routes.js";
import routerSubtopic from "../components/subtopic/subtopic.routes.js";
import routerClassAssignment from "../components/classAssignment/classAssignment.routes.js";
import routerProgress from "../components/progress/progress.routes.js";
import routerSchedule from "../components/schedule/schedule.routes.js";
import routerAIFeedback from "../components/aiFeedback/aiFeedback.routes.js";
import routerAIWritingAssistant from "../components/AI/aiWritingAssistant.routes.js";
import routerAIGame from "../components/AIGame/aiGame.routes.js";
// Blockchain integration
import blockchainRouter from "../components/blockchain/blockchainRoutes.js";

const router = Router(); 
router.use('/usuario', routerUser); 
router.use('/auth', authRouter);
router.use('/roles', routerRole);
router.use('/grades', routerGrade);
router.use('/subjects', routerSubject);
router.use('/subtopics', routerSubtopic);
router.use('/class-assignments', routerClassAssignment);
router.use('/progress', routerProgress);
router.use('/schedules', routerSchedule);
router.use('/ai-feedback', routerAIFeedback);
router.use('/ai-writing-assistant', routerAIWritingAssistant);
router.use('/ai-games', routerAIGame);
// Blockchain routes
router.use('/blockchain', blockchainRouter);

export default router;


