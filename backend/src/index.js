import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB().then(() => { 
    app.on("error", (error) => {
        console.log("Error :", error)
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server running at port: ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log(`MongoDB Connection Failed!`, error)
})