import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;
  const owner = req.user?._id;

  if (!isValidObjectId(owner)) {
    throw new ApiError(400, "Invalid User Id!");
  }

  if (!owner) {
    throw new ApiError(401, "Unauthorized request!");
  }
  if (!content) {
    throw new ApiError(400, "Content field is required!");
  }

  const tweet = await Tweet.create({
    content,
    owner,
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user Id!");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
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
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
        likesCount: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  if (!tweets) {
    throw new ApiError(500, "Failed to fetch user tweets!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully!"));
});

const getMyTweets = asyncHandler(async (req, res) => {
  const currentUser = req.user?._id;
  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }

  const myTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(currentUser),
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
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
        likesCount: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  if (!myTweets) {
    throw new ApiError(500, "Failed to fetch tweets!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, myTweets, "Tweets fetched successfully!"));
});

const getFollowedUsersTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const currentUser = req.user?._id;
  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }

  const followedChannels = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(currentUser),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedChannels",
      },
    },
    {
      $unwind: "$subscribedChannels",
    },
    {
      $project: {
        channelId: "$subscribedChannels.channel",
      },
    },
  ]);

  const followedChannelsId = followedChannels.map(
    (channel) => channel.channelId
  );

  const tweetsPipelines = [
    {
      $match: {
        owner: {
          $in: followedChannelsId,
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        likesCount: 1,
        "ownerDetails.fullName": 1,
        "ownerDetails.avatar": 1,
        "ownerDetails.username": 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const tweets = await Tweet.aggregatePaginate(tweetsPipelines, options);

  if (!tweets) {
    throw new ApiError(500, "Failed to fetch tweets!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  const { content } = req.body;
  const owner = req.user?._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id!");
  }

  if (!content) {
    throw new ApiError(400, "Content field is required!");
  }
  if (!owner) {
    throw new ApiError(401, "Unauthorized request!");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found!");
  }

  if (tweet.owner.toString() !== owner.toString()) {
    throw new ApiError(403, "You are not authorized to edit this tweet!");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(500, "Failed to edit tweet!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated Successfully!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const owner = req.user?._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid twwet Id!");
  }

  if (!owner) {
    throw new ApiError(401, "Unauthorized request!");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found!");
  }

  if (tweet.owner.toString() !== owner.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet!");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(500, "Failed to delete tweet. Please Try again!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted Successfully!"));
});

export {
  createTweet,
  getUserTweets,
  getMyTweets,
  getFollowedUsersTweets,
  updateTweet,
  deleteTweet,
};
