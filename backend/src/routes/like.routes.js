import { Router } from "express"
import { getLikedVideos, toggleVideoLike } from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/v/:videoId").patch(toggleVideoLike)

router.route("/videos").get(getLikedVideos)

export default router