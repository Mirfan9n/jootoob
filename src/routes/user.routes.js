import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([     // middleware of multer, field is a multer method
        {
            name : "avatar",
            maxCount: 1
        },
        {
            name : "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
) 
// http://localhost:3000/users/register  

// router.route("/login").post(loginUser)



export default router;
