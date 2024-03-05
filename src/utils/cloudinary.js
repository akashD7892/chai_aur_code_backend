import { v2 as cloudinary} from 'cloudinary' ;
import fs from 'fs' ;

          
cloudinary.config({ 
  cloud_name: 'dg9bclwez', 
  api_key: '934347335868684', 
  api_secret: 'eDCBC0_2u9OTgbdRPKVyGFM70hE' 
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
    fs.unlinkSync(localFilepath) ;
    return resp ;

  } catch(err) {
    // if server unable to upload then unlink the file 
    console.log("Unable to uload in cloudinary",err)
    fs.unlinkSync(localFilepath) ;
    return null ;
  }
}

export {uploadOnCloudinary}