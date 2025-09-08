import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/add/:videoId").post(addComment);

router.route("/edit/:commentId").patch(updateComment);

router.route("/delete/:commentId").delete(deleteComment);

router.route("/:videoId").get(getVideoComments)

export default router;
