import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.fileHandler.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const owner = req.user?._id;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required!");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail files are required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(500, "Failed to upload files!");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner,
  });

  if (!video) {
    throw new ApiError(500, "Failed to create video entry in database!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published Successfully!"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const pipeline = [];

  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  if (userId && isValidObjectId(userId)) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  const sort = {};
  if (sortBy && sortType) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
    pipeline.push({
      $sort: sort,
    });
  } else {
    pipeline.push({
      $sort: { createdAt: -1 },
    });
  }

  const skip = (page - 1) * limit;
  pipeline.push({
    $skip: skip,
  });
  pipeline.push({
    $limit: parseInt(limit),
  });

  const videos = await Video.aggregate(pipeline);

  if (!videos || !videos.length) {
    throw new ApiError(404, "No videos found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "Videos fetched successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const video = await Video.findById(videoId);

  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found or is private!");
  }

  video.viwes += 1;
  await video.save({ validateBeforeSave: false });


  return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully!"))
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
