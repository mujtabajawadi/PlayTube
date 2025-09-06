import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  editPlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);

router.route("/").get(getUserPlaylists);

router.route("/:playlistId").get(getPlaylistById);

router.route("/:playlistId/add/:videoId").patch(addVideoToPlaylist);
router.route("/:playlistId/remove/:videoId").patch(removeVideoFromPlaylist);

router.route("/:playlistId").delete(deletePlaylist);

router.route("/:playlistId").patch(editPlaylist);

export default router;
