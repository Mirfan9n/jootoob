import { asynchandler } from "../utils/asynhandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asynchandler(async( req, res)=>{

    // get data from frontend
    // validation on name nd username -> not empty
    // check if user exist : check via username, emnail
    // check for img , check for avatar its compulsary -> 
    // then upload it to cloudinary -> avatar ho gya upload pkka se ??
    
    //user obj -> mongo no sql h 
    // remove pass nd refresh token field or encript
    // check for user creation
    // return the user as a response
    
    const  {fullName, email, username, password } = req.body

    if(
        [fullName, email, username, password]
        .some((field)=> field?.trim() === "" )
    ) // array k internal func -> some usme checking ki MT to ni h 
    {
        new ApiError(400, "All fields are required")
    }

    // email checer
    const existedUser = User.findOne({
        $or : [ {username}, {email}]
    })
    if(existedUser) throw new ApiError(400, "User Email/username Already existed")

    // check for img
    // multer deta h files 
    // ! read the api via loging the data 

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    if(! avatarLocalPath) throw new ApiError(400, "Avatar is required") 
    

    // upload to cloudinary
   const avatar =  await uploadOnCloudinary(avatarLocalPath)
   const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) throw new ApiError(400, "Avatar is required") 


    // obj bna or db m push krde
    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // !IMP
        email,
        password,
        username : username.toLowerCase()
    })
    const createdUser = await User.findById(user._id)
        .select(
            "-password -refreshToken" 
        )

    if(! createdUser){
        throw new ApiError(500, "Internal Server error while creating the user")
    } 

    return res.status(201).json(new ApiResponse(200, createdUser, "User Registered Succesfully" ))
})

export {registerUser}