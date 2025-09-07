import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
// import { Tweet } from "../models/tweet.model.js";
// import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  const currentUser = req.user?._id;
  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const existingLike = await Like.findOne({
    likedBy: currentUser,
    video: videoId,
  });

  let video = await Video.findById(videoId);

  if (existingLike) {
    await existingLike.deleteOne();

    video.likes -= 1;
    await video.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Video unliked!"));
  } else {
    await Like.create({
      video: videoId,
      likedBy: currentUser,
    });

    video.likes += 1;
    await video.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: true }, "Video liked!"));
  }
});

// const toggleCommentLike = asyncHandler(async (req, res) => {
//   const { commentId } = req.params;
//   //TODO: toggle like on comment

//   const currentUser = req.user?._id;
//   if (!currentUser) {
//     throw new ApiError(401, "Unauthorized request!");
//   }
//   if (!isValidObjectId(commentId)) {
//     throw new ApiError(400, "Invalid comment ID!");
//   }

//   const existingLike = await Like.findOne({
//     likedBy: currentUser,
//     comment: commentId,
//   });

//   let comment = await Comment.findById(commentId);

//   if (existingLike) {
//     await existingLike.deleteOne();

//     comment.likes -= 1;
//     await comment.save({ validateBeforeSave: false });

//     return res
//       .status(200)
//       .json(new ApiResponse(200, { isLiked: false }, "Comment unliked!"));
//   } else {
//     await Like.create({
//       comment: commentId,
//       likedBy: currentUser,
//     });

//     comment.likes += 1;
//     await comment.save({ validateBeforeSave: false });

//     return res
//       .status(200)
//       .json(new ApiResponse(200, { isLiked: true }, "Comment liked!"));
//   }
// });

// const toggleTweetLike = asyncHandler(async (req, res) => {
//   const { tweetId } = req.params;
//   //TODO: toggle like on tweet

//   const currentUser = req.user?._id;
//   if (!currentUser) {
//     throw new ApiError(401, "Unauthorized request!");
//   }
//   if (!isValidObjectId(tweetId)) {
//     throw new ApiError(400, "Invalid Tweet ID!");
//   }

//   const existingLike = await Like.findOne({
//     likedBy: currentUser,
//     tweet: tweetId,
//   });

//   let tweet = await Tweet.findById(tweetId);

//   if (existingLike) {
//     await existingLike.deleteOne();

//     tweet.likes -= 1;
//     await tweet.save({ validateBeforeSave: false });

//     return res
//       .status(200)
//       .json(new ApiResponse(200, { isLiked: false }, "Tweet unliked!"));
//   } else {
//     await Like.create({
//       tweet: tweetId,
//       likedBy: currentUser,
//     });

//     tweet.likes += 1;
//     await tweet.save({ validateBeforeSave: false });

//     return res
//       .status(200)
//       .json(new ApiResponse(200, { isLiked: true }, "Tweet liked!"));
//   }
// });

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const currentUser = req.user?._id;
  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(currentUser)) {
    throw new ApiError(403, "Invalid User ID!");
  }

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(currentUser),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
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
    {
      $unwind: "$videoDetails",
    },
    {
      $replaceRoot: {
        newRoot: "$videoDetails",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked Videos fetched Successfully!")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
