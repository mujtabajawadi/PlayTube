import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
);

app.use(express.static('public'))
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser())


//importing routes 
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'




//routes declaraion
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/playlists', playlistRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/tweets', tweetRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', videoRouter)


export { app };
