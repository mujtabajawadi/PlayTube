import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getSubscribedChannels);
router.route("/c/:channelId").post(verifyJWT, toggleSubscription);

export default router;
