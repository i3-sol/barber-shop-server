import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import nodemailer from "nodemailer";

import { Now, bufferToImage } from "../../utils";
import { setlog } from "../../utils/setlog";
import config from '../../config/config';

import uerServices from "../services";
import authDatas from "../data-access";
import { getErrorCode } from "../../utils/platform";
import { generateCode, getHashPassword, session } from "../services/utils";
import { AuthError, ValidateError } from "../../@types/customError";

interface LoginStatusRequest extends Request {
  user: UserDataObject
}

const authController = {
  // check auth token
  checkLoginStatus: async (req: LoginStatusRequest, res: Response) => {
    const userData = req.user;

    const authInfo: UserDataObject = await authDatas.AuthDB.findOne({
      filter: { email: userData.email }
    });

    const loginStatus = {
      status: true,
      email: authInfo.email,
      firstName: authInfo.firstName,
      lastName: authInfo.lastName,
      phoneNumber: authInfo.phoneNumber,
      birthday: authInfo.birthday,
      image: authInfo.image
    }

    return res.status(200).json(loginStatus);
  },

  // This function is for signing up a new user.
  signup: async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email, password, phoneNumber, birthday, anniversaryDay, gender, referBy } = req.body;

      // service
      const hashPassword = getHashPassword(password);
      const existsMail = await uerServices.checkExistOfUser({ email });

      if (existsMail.res === true) {
        // throw new ValidateError(`${existsMail.param} is already exist!`);
        throw new ValidateError(`User already exist!`);
      }

      // data access
      await authDatas.AuthDB.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashPassword,
        phoneNumber: phoneNumber,
        birthday: birthday,
        anniversaryDay: anniversaryDay,
        gender: gender,
        referBy: referBy
      })

      const data = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        birthday: birthday,
        image: ""
      }

      const token = jwt.sign(data, config.JWT_SECRET, {
        expiresIn: "144h",
      });

      return res.status(200).json({ message: "success", token: token, data: data });
    } catch (err) {
      setlog("signup::", err);
      const { errCode, errMsg } = getErrorCode(err);
      return res.status(errCode).send({ message: errMsg });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const hashPassword = getHashPassword(password);

      // data access
      const authInfo: UserDataObject = await authDatas.AuthDB.findOne({
        filter: { $or: [{ email: email, password: hashPassword }] }
      });

      console.log(email, password)
      if (!authInfo) {
        throw new ValidateError("Invalid User email or password!");
      }

      const data = {
        email: authInfo.email,
        firstName: authInfo.firstName,
        lastName: authInfo.lastName,
        phoneNumber: authInfo.phoneNumber,
        birthday: authInfo.birthday,
        image: authInfo.image
      }

      const token = jwt.sign(data, config.JWT_SECRET, {
        expiresIn: "144h",
      });

      await authDatas.AuthDB.update({
        filter: { email: email },
        update: { lasttime: Now() }
      })

      return res.status(200).json({ token, data });
    } catch (err) {
      setlog("login::", err);
      const { errCode, errMsg } = getErrorCode(err);
      return res.status(errCode).send({ message: errMsg });
    }
  },

  sendEmail: async (req: Request, res: Response) => {
    try {
      const { email, lang } = req.body;
      const user: UserDataObject = await authDatas.AuthDB.findOne({
        filter: { $or: [{ email: email }] }
      });

      if (!user) {
        throw new ValidateError("Invalid User email!");
      }

      const transporter = nodemailer.createTransport({
        host: "Free-cards.co.uk",
        service: "smtp",
        port: 465,
        secure: true,
        auth: {
          user: "support@free-cards.co.uk",
          pass: "FreeCards@123",
        },
      });

      const code = generateCode();
      req.session[email] = code.toString();

      console.log(req.session)
      res.status(200).json({ "message": "success" });

      let content = 'A request has been made to reset your password. If you made this request, please click on the button below.';
      content = lang === 'en' ? content : "בקשה לאיפוס סיסמא נשלח אליך, במידה ואתה ביקשת את הקישור לאיפוס הסיסמא אנא הקלק כאן" 
      let title_content = ` <h4 style="margin: unset; margin-bottom: 10px;">Dear <sapn style="font-weight: 700;">${user.firstName},<span></h4>`

      title_content = lang === 'en' ? title_content : ` <h4 style="margin: unset; margin-bottom: 10px; text-align: right"><sapn style="font-weight: 700;">,${user.firstName} <span>שלום</h4>`

      let code_content = `<h2 style="margin: unset; margin-bottom: 10px;">Verification Code:<span style="font-weight: 600;"> ${code} </span></h2>`

      code_content = lang === "en" ? code_content :  `<h2 style="margin: unset; margin-bottom: 10px; text-align: right"><span style="font-weight: 600;"> ${code} </span>קוד אימות:</h2>`

      try {
        const to = req.body.email;
        const response = await transporter.sendMail({
          from: "support@free-cards.co.uk", to,
          subject: "Reset Your Password",
          html: `<div style="padding: 14px 20px;">
            <div style="max-width: 375px; font-size: 1.0rem; margin: auto;">
              <img alt="logo" src="https://ipfs.defitankland.com/ipfs/QmVtoMavmBpLdM9KxZdZZCPUZdM162FYjVob6WnvETp6gZ"
                style="width: 100%;" />

              <div style="margin-top: 15px">
                ${code_content}
                ${title_content}
                <p style="margin: unset; margin-bottom: 10px; text-align: ${lang === 'en' ? 'left' : 'right'}">${content}</p>
              </div>
            </div>
          </div>`,
        });

        console.log(response)

        res.json({
          status: 200,
          message:
            "We have sent an email to your email address. Follow the steps provided in the email to update your password.",
        });
      } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json();
      }
    } catch (error) {
      setlog("sendEmail::", error);
      const { errCode, errMsg } = getErrorCode(error);
      return res.status(errCode).send({ message: errMsg });
    }
  },

  verifyCode: async (req: Request, res: Response) => {
    try {
      const { code, email } = req.body;
      if (code === req.session[email]) {
        return res.status(200).json({ "message": "success" });
      } else {
        return res.status(400).json({ "message": "failed" });
      }
    } catch (error) {
      setlog("verifyCode::", error);
      const { errCode, errMsg } = getErrorCode(error);
      return res.status(errCode).send({ message: errMsg });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // service
      const hashPassword = getHashPassword(password);

      // data access
      const user: UserDataObject = await authDatas.AuthDB.update({
        filter: { email: email },
        update: { password: hashPassword }
      });

      return res.status(200).json({ message: "success" });
    } catch (err) {
      setlog("resetPassword::", err);
      const { errCode, errMsg } = getErrorCode(err);
      return res.status(errCode).send({ message: errMsg });
    }
  },

  getProfile: async (req: any, res: Response) => {
    try {
      const user = await authDatas.AuthDB.findOne({
        filter: { email: req.user.email },
      });

      return res.status(200).json({
        data: {
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday,
          email: user.email,
        }
      });
    } catch (err) {
      setlog("getProfile::", err);
      const { errCode, errMsg } = getErrorCode(err);
      return res.status(errCode).send({ message: errMsg });
    }
  },

  updateProfile: async (req: any, res: Response) => {
    try {
      const user = req.body;
      let imageUrl = req.user.imageUrl;
      if (req?.files?.image?.data) {
        const imageData = req.files.image.data;

        // imageUrl = await fileUploadToIpfs(imageData);
        imageUrl = bufferToImage(imageData, 'png')
      }
      const updateUser = await authDatas.AuthDB.update({
        filter: { email: req.user.email },
        update: {
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday,
          image: imageUrl,
          lasttime: Now()
        }
      });
      const data = {
        phoneNumber: updateUser.phoneNumber,
        firstName: updateUser.firstName,
        lastName: updateUser.lastName,
        image: imageUrl,
        birthday: updateUser.birthday,
        email: user.email,
      }

      console.log(data)
      return res.status(200).json({ data });
    } catch (err) {
      setlog("updateProfile::", err);
      const { errCode, errMsg } = getErrorCode(err);
      return res.status(errCode).send({ message: errMsg });
    }
  },

  middleware: (req: any, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization || "";

      if (!token) {
        throw new AuthError("Invalid Token!");
      }

      jwt.verify(token, config.JWT_SECRET,
        async (err: any, userData: any) => {
          try {
            if (err) throw new AuthError("Invalid Token!");

            const user = await authDatas.AuthDB.findOne({
              filter: { email: userData.email },
            });

            if (!user) {
              throw new ValidateError("Invalid User email!");
            }

            req.user = {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phoneNumber: userData.phoneNumber,
              birthday: userData.birthday,
              image: userData.image
            };

            authDatas.AuthDB.update({
              filter: { email: userData.email },
              update: { lasttime: Now() }
            });

            next();
          } catch (err: any) {
            setlog("middleware::", err.message);
            const { errCode, errMsg } = getErrorCode(err);
            return res.status(errCode).send({ message: errMsg });
          }
        }
      );
    } catch (err: any) {
      setlog("middleware::", err.message);
      const { errCode, errMsg } = getErrorCode(err);
      return res.status(errCode).send({ message: errMsg });
    }
  }
}

export default authController;

