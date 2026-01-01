import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { VideoCard } from '../components/index'
import objVideoService from '../services/videoService'



const Home = () => {

  const [video, setVideo] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await objVideoService.getAllVideos()
        console.log(response.data.docs)
        if (response?.data?.docs) {
          setVideo(response.data.docs);
        }
      } catch (error) {
        console.log("Failed to fetch videos");
      } finally {
        setLoading(false)
      }
    }
    loadVideos()
  

  }, [])

  console.log(video)
  



  return !loading ? (
    <div className='flex flex-col h-400'>
      <div className="pb-12">
        {video.length > 0 ? (
          video.map((video) => <VideoCard key={video._id} video={video} />)
        ) : (
          <p>No videos found.</p>
        )}
      </div>

      <footer className='w-full h-10 fixed bottom-0 z-999 bg-[rgba(0,0,0,0.4)] backdrop-blur-xl flex gap-5 justify-between text-white p-3'>

        <h1>Home</h1>
        <NavLink to="/publish-video">Publish Video</NavLink>
      <NavLink to="/my-profile">My Profile</NavLink>
      </footer>

    </div>
  ) : (
    <h1>Loading...</h1>
  );
}

export default Home
