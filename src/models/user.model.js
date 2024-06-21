import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
{
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,  // searchable hojata h 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String, //cloudnary URL
        required: true,
    },
    coverimage:{
        type: String,
    },
    watchHistory:[      
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken:{
        type: String
    },
    
}, 
{
    timestamps: true
}
)

// password got encrypted b4 saving
// using mongoose hook "pre"
userSchema.pre("save", async function(next){
    if(this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//creating mongoose new method 
//for checking password 
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}


//for refresh tockens
userSchema.methods.generateAccessToken = function(){
    jwt.sign(
    {  //1 -> payload  
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    //2 -> access tocken
    process.env.ACCESS_TOKEN_SECRET,
    { //3 -> expiry obj
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
    {  //1 -> payload  
        _id: this._id,
    },
    //2 -> access tocken
    process.env.REFRESH_TOKEN_SECRET,
    { //3 -> expiry obj
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}



export const User = mongoose.model("User", userSchema)