import { Response, Request, NextFunction } from "express";
import { body, validationResult } from "express-validator";

const middleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, message: errors.array()[0]?.msg });
  }

  next();
}

const validate = {
  register: [
    body('firstName').notEmpty().withMessage('First Name does not exists.'),
    body('lastName').notEmpty().withMessage('Last Name does not exists.'),
    body('email').notEmpty().withMessage('Email does not exists.'),
    body('email').isEmail().withMessage('Email is not valid!'),
    body('password').notEmpty().withMessage('Password not exists.'),
    body('phoneNumber').notEmpty().withMessage('PhoneNumber not exists.'),
    body('birthday').notEmpty().withMessage('Birthday not exists.'),
    body('anniversaryDay').notEmpty().withMessage('AnniversaryDay not exists.'),
    body('gender').notEmpty().withMessage('Gender not exists.'),
    body('referBy').notEmpty().withMessage('ReferBy not exists.'),
    middleware,
  ],

  login: [
    body('email').notEmpty().withMessage('Email not exists.'),
    body('email').isEmail().withMessage('Email is not valid!'),
    body('password').notEmpty().withMessage('Password not exists.'),
    middleware,
  ],

  sendEmail: [
    body('email').notEmpty().withMessage('Email not exists.'),
    middleware,
  ],

  resetPassword: [
    body('email').notEmpty().withMessage('Email not exists.'),
    body('password').notEmpty().withMessage('Password not exists.'),
    middleware,
  ],

  updateProfile: [
    body('firstName').notEmpty().withMessage('First Name does not exists.'),
    body('lastName').notEmpty().withMessage('Last Name does not exists.'),
    body('email').notEmpty().withMessage('Email does not exists.'),
    body('email').isEmail().withMessage('Email is not valid!'),
    body('phoneNumber').notEmpty().withMessage('PhoneNumber not exists.'),
    body('birthday').notEmpty().withMessage('Birthday not exists.'),
    middleware,
  ],

  sendContent: [
    body('content').notEmpty().withMessage('Content not exists!.'),
    middleware,
  ]
}

export default validate