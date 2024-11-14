import express from "express";

import Auth from "./auth";
import validate from "./validate";
import Platform from "./platform";

const Routes = async (router: express.Router) => {
  // check loginStatus
  router.post("/loginStatus", Auth.controllers.middleware, Auth.controllers.checkLoginStatus);

  //user api
  router.post("/login", validate.login, Auth.controllers.login);
  router.post("/signup", validate.register, Auth.controllers.signup);
  router.post("/sendEmail", validate.sendEmail, Auth.controllers.sendEmail);
  router.post("/resetPassword", validate.resetPassword, Auth.controllers.resetPassword);
  router.post("/verifyCode", Auth.controllers.verifyCode);
  router.post("/getProfile", Auth.controllers.middleware, Auth.controllers.getProfile);
  router.post("/updateProfile", Auth.controllers.middleware, Auth.controllers.updateProfile);

  router.post("/getChatHistories", Auth.controllers.middleware, Platform.controllers.getChatHistories);
  router.post("/sendcontent", Auth.controllers.middleware, Platform.controllers.sendContent);
  router.post("/speechToText", Auth.controllers.middleware, Platform.controllers.speechToText);
}

export { Routes };