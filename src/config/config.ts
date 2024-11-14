require("dotenv").config();

const config = {
  PORT: Number(process.env.PORT),
  DATABASE: process.env.DATABASE,
  JWT_SECRET: process.env.JWT_SECRET,
  debug: process.env.DEBUG === 'true' ? true : false,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  Secret: process.env.Secret,
  backendUrl: process.env.backendUrl,
  ALIABAPI_API_KEY: process.env.ALIABAPI_API_KEY,
  DID_API_KEY: process.env.DID_API_KEY,
  DEEP_IMAGE_KEY: process.env.DEEP_IMAGE_KEY,
}

export default config;