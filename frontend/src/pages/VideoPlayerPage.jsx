import { VideoPlayer } from '../components/index'
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from "date-fns";

const VideoPlayerPage = () => {
 

  const [video, setVideo] = useState(null)
  const playerRef = useRef(null);



  const handleDataFetching = useCallback((data) => {
    setVideo(data);
    console.log(data);
  },[]);
  if (!video) {
    return (
      <div className="p-4">
        <VideoPlayer onDataFetched={handleDataFetching} />
        <p>Loading video details...</p>
      </div>
    );
  }

  const getMimeType = (url) => {
    if (!url) return "video/mp4";
    if (url.includes(".m3u8")) return "application/x-mpegURL"; // Required for HLS
    if (url.includes(".webm")) return "video/webm";
    return "video/mp4"; // Default fallback
  };

  const videoJsOptions = {
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
  };

 

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };




  return (
    <div>
      <div className="w-full">
        <VideoPlayer
          options={videoJsOptions}
          onReady={handlePlayerReady}
          onDataFetched={handleDataFetching}
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
  );
}

export default VideoPlayerPage
