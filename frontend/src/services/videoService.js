import axiosInstance from "../api/config.js";

export class VideoService {
  async getAllVideos({ page, query = "" } = {}) {
    try {
      const response = await axiosInstance.get(`/videos/`, {
        params: { page, query },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching videos:", error);
      throw error;
    }
  }

  async publishVideo({
    title,
    description,
    isPublished,
    videoFile,
    thumbnail,
  }) {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isPublished", isPublished);

      if (videoFile && videoFile[0]) {
        formData.append("videoFile", videoFile[0]);
      }
      if (thumbnail && thumbnail[0]) {
        formData.append("thumbnail", thumbnail[0]);
      }

      const uploadedVideo = await axiosInstance.post(
        `/videos/publish-video`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        //   onUploadProgress: (progressEvent) => {
        //     const percentCompleted = Math.round(
        //       (progressEvent.loaded * 100) / progressEvent.total
        //     );
        //     if (onProgress) onProgress(percentCompleted);
        //   },
        }
        );
        
      return uploadedVideo
    } catch (error) {
        throw error
      }
  }
}
const objVideoService = new VideoService();
export default objVideoService;
