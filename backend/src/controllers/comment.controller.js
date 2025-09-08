import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const currentUser = req.user?._id;

  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  const videoCommentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [new mongoose.Types.ObjectId(currentUser), "$likes.likedBy"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        likes: 0,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const result = await Comment.aggregatePaginate(
    videoCommentsAggregate,
    options
  );

  if (!result) {
    throw new ApiError(500, "Something went wrong while fetching Comments!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully!"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  const currentUser = req.user?._id;

  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID!");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required!");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  const newComment = await Comment.create({
    content,
    video: videoId,
    owner: currentUser,
  });
  if (!newComment) {
    throw new ApiError(500, "Failed to add comment!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfully!"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  const currentUser = req.user?._id;

  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID!");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required!");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  if (comment.owner.toString() !== currentUser.toString()) {
    throw new ApiError(403, "You are not authorized to edit this comment!");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new ApiError(500, "Failed to edit comment!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment updated successfully!")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const currentUser = req.user?._id;

  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID!");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }
  if (comment.owner.toString() !== currentUser.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment!");
  }

  await Comment.findByIdAndDelete(commentId);

  await Like.deleteMany({
    comment: commentId,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
