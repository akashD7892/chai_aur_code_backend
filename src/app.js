import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})) ;

// to work with middleware we use app.use
//to send form form the client
app.use(express.json({limit:"16kb"}));

//to send string something or object 
app.use(express.urlencoded({extended:true, limit:"16kb"}));

// to store some pic or pdf 
app.use(express.static("public")) ;

// to add crud operation on cookies of client
app.use(cookieParser()) ;

export {app} 