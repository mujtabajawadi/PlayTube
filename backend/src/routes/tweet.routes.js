import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getFollowedUsersTweets,
  getMyTweets,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/create").post(verifyJWT, createTweet);
router.route("/myTweets").get(verifyJWT, getMyTweets);
router.route("/all").get(verifyJWT, getFollowedUsersTweets)
router.route("/:userId").get(getUserTweets);
router.route("/edit/:tweetId").patch(verifyJWT, updateTweet);
router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);

export default router;
