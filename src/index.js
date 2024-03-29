import dotenv from 'dotenv'
import express from 'express'
import { connectDB } from './db/index.js'
import { app } from './app.js';

//was showing error as it is .env not env just
dotenv.config({
   path:'./.env'
})

connectDB() 
.then( () => {
 app.listen( process.env.PORT || 8000 , () => {
    console.log( `Server is running at Port: ${process.env.PORT}`) ;
 } )
})
.catch( (err)  => {
   console.log("Mongo db connection failed !!!", err ) ;
})
