import mongoose from "mongoose";
import jwt  from "jsonwebtoken";
import bcrypt from 'bcrypt' 

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true ,
        unique:true,
        lowecase:true,
        trim:true,
        index:true
    } ,
    email:{
        type:String,
        required:true ,
        unique:true,
        lowecase:true,
        trim:true,
    } ,
    fullName:{
        type:String,
        required:true ,
        trim:true,
        index:true
    } ,
    avatar:{
        type:String, // cloudinary url
        required:true,
    } ,
    coverImage: {
        type:String, // cloudinary url
    } ,
    watchHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true, 'Password is required']
    },
    refreshToken:{
        type:String
    }

}, {timestamps:true}) ;

// pre is middleware just before save do the encrption of password;
// we can't use arrow function in it as it doesnt have acces of "this" keyword
userSchema.pre("save", async function(next){
    if( !this.isModified("password")) return next() ;

    this.password = await bcrypt.hash(this.password, 10) ;
    next() ;
})

//method to check password correct or not
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password) ;
}

//access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id ,
            email:this.email,
            username:this.username ,
            fullname:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//REFERENCE TOKEN
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema) ;