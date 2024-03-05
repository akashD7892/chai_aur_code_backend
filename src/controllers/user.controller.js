import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'; 
import { ApiResponse } from "../utils/ApiResponse.js";

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

export {registerUser} ;