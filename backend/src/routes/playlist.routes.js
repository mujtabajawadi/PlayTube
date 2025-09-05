import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist } from "../controllers/playlist.controller.js";




const router = Router()

router.use(verifyJWT)

router.route("/create-playlist").post(createPlaylist)

router.route("/:playlistId/add/:videoId").patch(addVideoToPlaylist)

export default router