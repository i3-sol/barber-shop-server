import express from "express";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import rateLimit from 'express-rate-limit';
import fileUpload from 'express-fileupload';

// External Modules
import './subscribe/events'
import { Routes } from "./Routes";
import { setlog } from "./utils/setlog";
import config from './config/config';
import { setupSocketServer } from "./socketServer";
import path from "path";
import axios from "axios";

// Get router
const router: express.Router = express.Router();
const app: express.Express = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const connectDatabase = async (mongoUrl: string) => {
  try {
    const options = {
      autoCreate: true,
      keepAlive: true,
      retryReads: true,
    } as mongoose.ConnectOptions;
    mongoose.set("strictQuery", true);
    const result = await mongoose.connect(mongoUrl, options);
    if (result) {
      setlog("MongoDB connected");
    }
  } catch (err) {
    setlog("ConnectDatabase", err);
  }
};

// Body parser middleware
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", methods: ["POST", "GET"] }));
app.use(express.json());
// app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.static(__dirname + "/public"));
app.use("/upload", express.static("upload"));

app.use(session({
  secret: config.Secret, // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    secure: false // Set to true if using HTTPS
  }
}));
app.use(limiter)
app.set('trust proxy', true);

// API Router
Routes(router);
app.use("/api", router);

connectDatabase(config.DATABASE).then(() => {
  const server = app.listen(config.PORT, () => {
    setlog(`Server listening on ${config.PORT} port`);
  });
  // run socket server
  setupSocketServer(server)
}).catch((err: any) => {
  setlog(err);
});

export default app;