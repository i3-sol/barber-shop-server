import { ValidateError } from "../../@types/customError";
import authDatas from "../data-access";

const uerServices = {
  checkExistOfUser: async ({ email }) => {
    let existsUser = await authDatas.AuthDB.findOne({
      filter: { email: email }
    });
    if (!!existsUser)
      return {
        res: true,
        param: "email",
        msg: "Already registered user!"
      }

    return {
      res: false,
      param: "none",
      msg: "true"
    }
  },
  checkUserData: async (email: string): Promise<UserDataObject> => {
    const userInfo: UserDataObject = await authDatas.AuthDB.findOne({
      filter: { email: email }
    })

    if (!userInfo) {
      throw new ValidateError("Invalid User!");
    }

    return userInfo;
  },
}

export default uerServices