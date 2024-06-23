import { asynchandler } from "../utils/asynhandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessAndRefreshTocken = async(userId)=>{
    try {
        const user = User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        
        // !IMP
        // validate mt kro kuch bs save krdo i know what m doin 
        user.save({ validateBeforeSave: false }) 
        

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Tockens")
    }
}



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

    // email checker
    const existedUser = await User.findOne({
        $or : [ {username}, {email}]
    })
    if(existedUser) throw new ApiError(400, "User Email/username Already existed")

    // check for img
    // multer deta h files 
    // ! read the API via consoling the data 

    const avatarLocalPath = req.files?.avatar[0]?.path
    // console.log(req);
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    if(! avatarLocalPath) throw new ApiError(400, "Avatar is required") 
    

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage ) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    console.log(req.files);

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

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Succesfully" )
    )
})




const loginUser = asynchandler(async(req, res)=>{
    //retrive login id pass
    // username exists??
    //match
    // gen acc and gen token

    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(400, "User not found")
    }


    // mere user se chahiye not "U"ser <- model se ni milega 
    // ! mere user instance se milega kyu ki ispassword mene bnaya h 

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(! isPasswordValid){
        throw new ApiError(401, "Invalid user credential")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTocken(user._id)
    // uper wala user k instance m tocken mt h to re call krna pdega DB

    const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
            user: logedInUser, accessToken, refreshToken
            },
            "User Logged in succesfully"
        )
    )
})

const logoutUser = asynchandler(async(req, res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(201)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
})



export {registerUser, loginUser, logoutUser}