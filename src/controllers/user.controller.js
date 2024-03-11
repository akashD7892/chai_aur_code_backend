import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'; 
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken"; 

const generateAccessAndRefreshTokens = async(userId) =>{
    try{
       
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken ;
        // as we are only introducing token it will ask for password so skip validate part 
        await user.save({ validateBeforeSave: false}) ;

        return {accessToken,refreshToken} ;

    } catch(err) {
        console.log(err) ;
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async(req,resp) => {
    // get user details from frontend
    // validate - not empty
    // check if user already exist: username, email
    // check for images,check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // return resp

    const {fullName, email, username, password} = req.body;
    console.log("email: ", email) ;
    //advance way to wrap up all if else case in one go
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "" )
    ) {
          throw new ApiError( 400, "All field are required" ) ;
    }
    console.log(req.files) ;
    // using $or can check one by one both username and email
    const existUser = await User.findOne({
        $or:[ { username } , { email } ]
    })

    if( existUser ) {
        throw new ApiError( 409, "User with email or username already exist");
    }

    //using multer it gies access to req.files
    
    const avatarLocalPath = req.files?.avatar[0]?.path ; 

    // if coverImage is empty it will show error of undefined
    // const coverLocalPath = req.files?.coverImage[0]?.path ;

    let coverLocalPath ;
    if( req.files && Array.isArray(req.files) && req.files.coverLocalPath > 0 ) {
        coverLocalPath = req.files.coverImage[0]?.path ;
    }
     
    if( !avatarLocalPath ) {
        throw new ApiError(400, "Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath) ;
    const coverImage = await uploadOnCloudinary(coverLocalPath) ;

    if( !avatar ) {
        throw new ApiError(400, "Avatar file is required")
    } 

    const user = await User.create({
        fullName, 
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    // by default all fields are selected to remove any field we write in string with spaces "-password "space" "-refreshToken"; 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if( !createdUser ) {
        throw new ApiError(500, "Somehting went wrong registering the user") ;
    }

    return resp.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler( async( req,resp) => {
   //req.body->data
   //username or email
   //find user
   //password check
   //access and refresh token
   //send cookies 

   const {email,username,password} = req.body ;
   
   if( !(username || email) ) {
    throw new ApiError(400,"username or password is required") ;
   } 

   const user = await User.findOne({
     $or:[ { username } ,{ email } ]
   })

   if( !user ) {
    throw new ApiError(404,"User doesnt exist")
   } 

   //check password after decrypt
   const isPasswordValid = await user.isPasswordCorrect(password) ;
   
   if( !isPasswordValid ) {
    throw new ApiError(401, "Invalid user credentials") ;
   } 

   const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id) ;

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken") ;

   const options = {
    httpOnly:true ,
    secure:true
   } 
   
   // if we have saved the tokens in cookies why sending in client
   // ans - in case client needs to do somechanges
   return resp
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(
        200,
        {
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
    )
   )

})

const logoutUser = asyncHandler(async(req,resp) => {
  await User.findByIdAndUpdate(
    req.user._id ,
    {
        $set:{
            refreshToken:undefined
        } ,
        
    },
    {
        new:true
    }
  ) 

  const options = {
    httpOnly:true ,
    secure:true 
  } 

  return resp
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json( new ApiResponse(200, {}, "User logged out")) ;
}) 

const refreshAccessToken = asyncHandler( async(req,resp) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken ;

    if( !incomingRefreshToken) {
        throw new ApiError(401,"Unauthorised request") ;
    }

    try {
        const decodedToken = Jwt.verify(
            incomingRefreshToken ,
            process.env.REFRESH_TOKEN_SECRET
        ) 
    
        const user = await User.findById(decodedToken?._id) ;
    
        if( !user ) {
            throw new ApiError(401, "unauthorized request") ;
        } 
    
        if( incomingRefreshToken !== user?.refreshToken ) {
            throw new ApiError(401, "Refresh token is expired or used") ;
        } 
    
        const options = {
            httpOnly:true ,
            secure:true
        } 
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return resp
        .status(200)
        .cookie("accesToken", accessToken, options) 
        .cookie("refreshToken", newRefreshToken, options) 
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken:newRefreshToken},
                "Access Token refreshed succesfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token") ;
    }
})
export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken 
} ;