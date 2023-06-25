const express = require("express");
const app = express();

const userRoutes = require("./routes/User")
const profileRoutes = require("./routes/Profile")
const paymentRoutes = require("./routes/Payment")
const courseRoutes = require("./routes/Course")

const database = require('./config/database')
const cookieParser = require("cokkie-parser")
const cors = require("cors")
const {cloudinaryConnect} = require('./config/cloudinary')
const fileUpload = require("express-fileuload")
const dotenv = require("dotenv")

dotenv.config()
const PORT = process.env.PORT || 4000;

database.connect()

//middlewares
app.use(express.json())
app.use(cookieParser())

//cors - to entertain req from frontend
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true,
    })
)

//cloudinary connection
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)

//routes
app.use("/api/vi/auth",userRoutes)
app.use("/api/vi/profile",profileRoutes)
app.use("/api/vi/course",courseRoutes)
app.use("/api/vi/payment",paymentRoutes)

//default route
app.get("/", (req,res)=>{
    return res.json({
        success:true,
        message:'Your server is up and running..'
    })
})

//activate server
app.listen(PORT, ()=>{
    console.log(`App is running at ${PORT}`)
})