import axiosInstance from "../api/config.js";

export class VideoService{
    async getAllVideos({page, query = ""} = {}) {
        try{
            const response = await axiosInstance.get(`/videos/`, {
                params: {page, query}
            })
            return response.data
        } catch(error){
            console.error("Error fetching videos:", error);
            throw error;
        }
    }

}
const objVideoService = new VideoService()
export default objVideoService