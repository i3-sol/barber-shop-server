import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AuthSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  birthday: { type: String, required: true },
  anniversaryDay: { type: String, required: true },
  gender: { type: String, required: true },
  referBy: { type: String, required: true },
  chatSummary: { type: String, default: "" },

  resetPasswordToken: { type: String, default: "" },
  resetPasswordExpired: { type: Number, default: 0 },
  code: { type: String, default: "" },

  lasttime: { type: Number, default: 0 },
  image: { type: String,  default: ""}
}, {
  timestamps: true
});

const Auth = mongoose.model("auths", AuthSchema);

const AuthModels = {
  Auth
}

export default AuthModels;