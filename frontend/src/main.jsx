import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from "react-redux"
import store from './store/store.js'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import {Signup, Home, Login, Profile, PublishVideo, VideoPlayerPage} from './pages/index.js'




const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "/signup",
        element: <Signup/>
      },
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/my-profile",
        element: <Profile/>
      },
      {
        path: "/publish-video",
        element: <PublishVideo/>
      },
      {
        path: "/video/:videoId",
        element: <VideoPlayerPage/>
      }
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
