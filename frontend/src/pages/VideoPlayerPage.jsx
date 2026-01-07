import { VideoPlayer } from '../components/index'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import objVideoService from "../services/videoService";
import { formatDistanceToNow } from "date-fns";
import { useParams } from 'react-router-dom';

const VideoPlayerPage = () => {
 
  const { videoId } = useParams();

  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const playerRef = useRef(null);




   
    useEffect(() => {
      const fetchVideo = async () => {
        try {
          const videoData = await objVideoService.getVideoById(videoId);
  
          if (videoData) {
            const data = videoData.data
            setVideo(data)
            setLoading(false)
            console.log(data);
          }
        } catch (error) {
          console.log(error);
          throw error;
        }
      };
      fetchVideo();
    }, [videoId]);



  

  // if (!video) {
  //   return (
  //     <div className="p-4">
  //       <VideoPlayer/>
  //       <p>Loading video details...</p>
  //     </div>
  //   );
  // }

  const getMimeType = (url) => {
    if (!url) return "video/mp4";
    if (url.includes(".m3u8")) return "application/x-mpegURL"; // Required for HLS
    if (url.includes(".webm")) return "video/webm";
    return "video/mp4"; // Default fallback
  };

  const videoJsOptions = useMemo(() => {
    if (!video) return null;
    return {
      autoplay: true,
      fill: true,
      controls: true,
      responsive: true,
      fluid: true,
      aspectRatio: "16:9",
      sources: [
        {
          src: `${video.videoFile}`,
          type: getMimeType(video.videoFile),
        },
      ],
    }
  }, [video]);

 

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on("waiting", () => {
      console.log("player is waiting");
    });

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };




  return !loading && video ? (
    <div>
      <div className="w-full">
        <VideoPlayer
          options={videoJsOptions}
          onReady={handlePlayerReady}
        />
      </div>
      <div className='p-4'>
        <h1 className="text-2xl font-bold mt-4">{video.title}</h1>
        <div>
          {video.views} views • {video.likes} likes •{" "}
          {formatDistanceToNow(new Date(video.createdAt))} ago
        </div>
        <div className="flex justify-between items-center gap-4 mt-2">
          <div className="flex gap-1 items-center justify-center">
            <img
              src={video?.owner?.avatar}
              className="w-10 h-10 rounded-full"
            />
            <span className="font-bold">{video?.owner?.fullName}</span>
          </div>
          <div>
            <span>Subscribe</span>
          </div>
        </div>
      </div>
    </div>
  ): <div>Loading...</div>;
}

export default VideoPlayerPage
