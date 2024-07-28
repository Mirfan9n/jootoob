import { Router } from "express";
import { loginUser, logoutUser, refreshAcessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser)

//authenticated routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAcessToken)


export default router;
