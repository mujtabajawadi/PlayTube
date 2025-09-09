import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  const currentUser = req.user?._id;
  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID!");
  }

  if (currentUser.toString() === channelId.toString()) {
    throw new ApiError(400, "Can not subscribe your own channel!")
  }

  const existingSubscriber = await Subscription.findOne({
    subscriber: currentUser,
    channel: channelId,
  });

  if (existingSubscriber) {
    const unsubscribed = await Subscription.findByIdAndDelete(
      existingSubscriber._id
    );

    if (!unsubscribed) {
      throw new ApiError(500, "Failed to unsubscribe!");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { subscribed: false }, "Channel Unsubscribed!")
      );
  } else {
    const newSubscriber = await Subscription.create({
      subscriber: currentUser,
      channel: channelId,
    });

    if (!newSubscriber) {
      throw new ApiError(500, "Failed to subscribe!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: true }, "Channel Subscribed!"));
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const currentUser = req.user?._id;

  if (!isValidObjectId(currentUser)) {
    throw new ApiError(400, "Invalid user ID!");
  }

  if (!currentUser) {
    throw new ApiError(401, "Unauthorized request!");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(currentUser),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
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
        channelDetails: {
          $first: "$channelDetails",
        },
      },
    },
    {
      $unwind: "$channelDetails",
    },
    {
      $replaceRoot: {
        newRoot: "$channelDetails",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully!"
      )
    );
});

export { toggleSubscription, getSubscribedChannels };
