import { formatDistanceToNow } from "date-fns"; // Optional for '2 days ago' text
import { useNavigate } from "react-router-dom";

const VideoCard = ({ video }) => {
  const navigate = useNavigate()
  
  console.log(video);

  return (
    <div className="w-full cursor-pointer group" onClick={()=> navigate(`/video/${video._id}`)}>
      {/* Thumbnail */}
      <div className="w-full relative aspect-video  overflow-hidden mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex gap-3">
        <img
          src={video.owner?.avatar}
          className="h-10 w-10 rounded-full object-cover"
          alt="avatar"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold line-clamp-2 leading-tight">
            {video.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {video.owner?.username} • {video.views} views •{" "}
            {formatDistanceToNow(new Date(video.createdAt))} ago
          </p>
          {/* <p className="text-gray-400 text-xs"></p> */}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
