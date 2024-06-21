import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async(localFilePath) =>{

    try {
        // localFilePath is in my local server 
        //1st i have uploaded into local server
        // then to cloudinary
        // then deletes from local server 

        if(! localFilePath) return null;

        //upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded succesfully
        console.log("file is uploaded on cloudinary", response.url)

        return response


    } catch (error) {
        fs.unlink(localFilePath)  // remove the locally saved temp file
        // as the upload got failed

        return null;
    }

}

export {uploadOnCloudinary}