import { v2 as cloudinary} from 'cloudinary' ;
import fs from 'fs' ;

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async(localFilepath) => {
    
try{
    
    if(!localFilepath) return null ;
    
    // upload file in cloudinary
    const resp = await cloudinary.uploader.upload
    (localFilepath, {
        resource_type:"auto"
    })

    // file has been uploaded successfully
    console.log("file is uploaded on cloudinary", resp.url) ;
    return resp ;

  } catch(err) {
    // if server unable to upload then unlink the file 
    fs.unlinkSync(localFilepath) ;
    return null ;
  }
}

export {uploadOnCloudinary}