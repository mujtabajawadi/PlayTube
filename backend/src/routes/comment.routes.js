import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/:videoId").get(getVideoComments);

router.route("/add/:videoId").post(verifyJWT, addComment);

router.route("/edit/:commentId").patch(verifyJWT, updateComment);

router.route("/delete/:commentId").delete(verifyJWT, deleteComment);


export default router;
