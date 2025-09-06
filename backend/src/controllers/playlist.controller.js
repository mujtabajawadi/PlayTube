import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name } = req.body;
  //TODO: create playlist
  const owner = req.user?._id;
  if (!owner) {
    throw new ApiError(401, "Unauthorized request!");
  }
  if (!name) {
    throw new ApiError(400, "Playlist name is required!");
  }

  const playlist = await Playlist.create({
    name,
    owner,
  });

  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created Successfully!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const owner = req.user?._id;
  if (!owner) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!");
  }

  if (playlist.owner.toString() !== owner.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to add video to this playlist!"
    );
  }

  const videToAdd = Video.findOne({ _id: videoId, isPublished: true });

  if (!videToAdd) {
    throw new ApiError(404, "Video not found or is not published!");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to add video to playlist!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        "Video added to playlist successfully!"
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID!");
  }
  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner_details",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner_details",
              },
            },
          },
          {
            $project: {
              owner_details: 0,
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        !playlists.length ? "Playlist is empty" : playlists,
        "User playlists fetched successfully!"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const ownerId = req.user?._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!");
  }

  const playlistCheck = await Playlist.findById(playlistId);

  if (playlistCheck.owner.toString() !== ownerId.toString()) {
    throw new ApiError(401, "You are not authorized to access this playlist!");
  }

  if (!playlistCheck) {
    throw new ApiError(404, "Playlist not found!");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$ownerDetails",
              },
            },
          },
          {
            $project: {
              ownerDetails: 0,
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully!"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found!");
  }

  if (playlist.owner.toString() !== ownerId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to remove video from plalist!"
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to remove video from playlist!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatePlaylist,
        "Video removed from playlist successfully!"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  const ownerId = req.user?._id;
  if (!ownerId) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!");
  }

  const playlistToDelete = await Playlist.findById(playlistId);

  if (!playlistToDelete) {
    throw new ApiError(404, "Playlist not found!");
  }

  if (playlistToDelete.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this playlist!");
  }

  const result = await Playlist.findByIdAndDelete(playlistId);
  if (!result) {
    throw new ApiError(500, "Failed to delete playlist!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully!"));
});

const editPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name } = req.body;
  //TODO: update playlist

  const ownerId = req.user?._id;
  if (!ownerId) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!");
  }

  if (!name) {
    throw new ApiError(400, "Name field is required!");
  }

  const playlistToEdit = await Playlist.findById(playlistId);

  if (!playlistToEdit) {
    throw new ApiError(404, "Playlist not found!");
  }

  if (playlistToEdit.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to edit the playlist!");
  }

  const editedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name || playlistToEdit.name,
      },
    },
    {
      new: true,
    }
  );

  if (!editedPlaylist) {
    throw new ApiError(500, "Failed to edit playlist!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, editedPlaylist, "Playlist edited successfully!")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  editPlaylist,
};
