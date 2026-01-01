import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.fileHandler.js";

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

// const getAllVideos = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 20, query, sortBy, sortType, userId } = req.query;
//   //TODO: get all videos based on query, sort, pagination

//   const pipeline = [];

//   pipeline.push({
//     $match: {
//       isPublished: true,
//     },
//   });

//   if (query) {
//     pipeline.push({
//       $match: {
//         $or: [
//           { title: { $regex: query, $options: "i" } },
//           { description: { $regex: query, $options: "i" } },
//         ],
//       },
//     });
//   }

//   if (userId && isValidObjectId(userId)) {
//     pipeline.push({
//       $match: {
//         owner: new mongoose.Types.ObjectId(userId),
//       },
//     });
//   }

//   const sort = {};
//   if (sortBy && sortType) {
//     sort[sortBy] = sortType === "asc" ? 1 : -1;
//     pipeline.push({
//       $sort: sort,
//     });
//   } else {
//     pipeline.push({
//       $sort: { createdAt: -1 },
//     });
//   }

//   const skip = (page - 1) * limit;
//   pipeline.push({
//     $skip: skip,
//   });
//   pipeline.push({
//     $limit: parseInt(limit),
//   });

//   const videos = await Video.aggregate(pipeline);

//   if (!videos || !videos.length) {
//     throw new ApiError(404, "No videos found!");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { videos }, "Videos fetched successfully!"));
// });

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, query, sortBy, sortType, userId } = req.query;

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

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $project: {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      ],
    },
  });

  pipeline.push({
    $addFields: {
      owner: {
        $first: "$owner",
      },
    },
  });


  pipeline.push({
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "video",
      as: "likes",
    },
  });

  pipeline.push({
    $addFields: {
      likesCount: {
        $size: "$likes",
      },
      isLiked: {
        $cond: {
          if: {
            $in: [req.user?._id, "$likes.likedBy"],
          },
          then: true,
          else: false,
        },
      },
    },
  });

  pipeline.push({
    $project: {
      likes: 0,
    },
  });



  const sort = {};
  if (sortBy && sortType) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }
  pipeline.push({ $sort: sort });

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videoAggregate = Video.aggregate(pipeline);
  console.log(pipeline)

  const result = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});



const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const currentUser = req.user?._id
  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!")
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const video = await Video.findById(videoId);

  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found or is private!");
  }

  video.views += 1;
  await video.save({ validateBeforeSave: false });

  await User.findByIdAndUpdate(currentUser,
    {
      $addToSet: {
        watchHistory: video._id
      }
    },
    {
      new: true
    }
  )

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;
  const newThumbnailLocalPath = req.file?.path;
  const owner = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  if (!title && !description && !newThumbnailLocalPath) {
    throw new ApiError(400, "Atleast one filed is required!");
  }

  const videoToUpdate = await Video.findById(videoId);

  if (!videoToUpdate) {
    throw new ApiError(404, "Video not found!");
  }

  if (videoToUpdate.owner.toString() !== owner.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  let thumbnailUpdate = {};
  if (newThumbnailLocalPath) {
    const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);
    if (newThumbnail) {
      await deleteFromCloudinary(videoToUpdate?.thumbnail);
      thumbnailUpdate = { thumbnail: newThumbnail?.url };
    
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || videoToUpdate?.title,
        description: description || videoToUpdate?.description,
        ...thumbnailUpdate,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Failed to update Video!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated Successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const owner = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const videoToDelete = await Video.findById(videoId);

  if (!videoToDelete) {
    throw new ApiError(404, "Video not found!");
  }

  if (videoToDelete.owner.toString() !== owner.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video!");
  }

  await deleteFromCloudinary(videoToDelete.videoFile);
  await deleteFromCloudinary(videoToDelete.thumbnail);

  const result = await Video.findByIdAndDelete(videoId);

  if (!result) {
    throw new ApiError(500, "Failed to delete video!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted Successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const owner = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== owner.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to change the status of this video"
    );
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        "Video visibility status changed Successfully!"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
