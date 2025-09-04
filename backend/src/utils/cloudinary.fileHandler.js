import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const uploaderResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //console.log("File has been uploaded on Cloudinary.", uploaderResponse.url);
    fs.unlinkSync(localFilePath);
    return uploaderResponse;
  } catch (error) {
    fs.unlinkSync(localFilePath);
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return null;

    const urlParts = url.split("/")
    const resource_type = urlParts[urlParts.indexOf("upload") -1]

    const publicId = urlParts.pop().split(".")[0]
    const deleteResponse = await cloudinary.uploader.destroy(publicId, {resource_type: resource_type});
    return deleteResponse;
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Error deleting file from Cloudinary!"
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
