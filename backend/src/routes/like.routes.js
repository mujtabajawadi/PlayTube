import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/videos").get(getLikedVideos);

router.route("/v/:videoId").patch(toggleVideoLike);
router.route("/c/:commentId").patch(toggleCommentLike);
router.route("/t/:tweetId").patch(toggleTweetLike);

export default router;
