import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import objVideoService from "../../services/videoService";

const VideoPlayer = () => {
  const { videoId } = useParams(); // Logic: Grabs the ID from the URL
    const [video, setVideo] = useState(null);
    // console.log(video)


    useEffect(() => {

       
        const fetchVideo = async () => {
            try {
                const videoData = await objVideoService.getVideoById(videoId);
               
              if (videoData) {
                  setVideo(videoData?.data);
                  console.log(videoData.data)
              }
            } catch (error) {
              console.log(error);
              throw error;
            }
        }
        fetchVideo()
      
  }, [videoId]);

  if (!video) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <video
        src={video.videoFile}
        controls
              autoPlay
              playsInline
              preload="auto"
        className="w-full aspect-video rounded-xl border border-gray-800"
      />

      <h1 className="text-2xl font-bold mt-4">{video.title}</h1>
      <div>
        {video.views} views • {video.likes} likes •{" "}
        {formatDistanceToNow(new Date(video.createdAt))} ago
      </div>
      <div className="flex justify-between items-center gap-4 mt-2">
        <div className="flex gap-1 items-center justify-center">
          <img src={video?.owner?.avatar} className="w-10 h-10 rounded-full" />
          <span className="font-bold">{video?.owner?.fullName}</span>
        </div>
        <div>
          <span>Subscribe</span>
        </div>
      </div>
    </div>
  );
};
export default VideoPlayer