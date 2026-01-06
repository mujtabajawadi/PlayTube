import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import objVideoService from "../../services/videoService";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const VideoPlayer = (props) => {

  const { videoId } = useParams();

  
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const { options, onReady, onDataFetched} = props
  



  
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const videoData = await objVideoService.getVideoById(videoId);

        if (videoData) {
          const data = videoData.data
          onDataFetched(data)
          console.log(data);
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    };
    fetchVideo();
  }, [videoId, onDataFetched]);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js")
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef])
  
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);





  // if (!video) return <p>Loading...</p>;

  return (
  
      <div data-vjs-player>
        <div ref={videoRef} />
      </div>

  );
};
export default VideoPlayer