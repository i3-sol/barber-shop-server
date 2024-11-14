const getErrorCode = (err: any) => {
  let tempCode = 500;
  let tempMessage = "Internal Server Error";

  switch (err?.name) {
    case "AuthError":
      tempCode = 403;
      tempMessage = err.message;
      break;

    case "ValidateError":
      tempCode = 400;
      tempMessage = err.message;
      break;

    default:
      break;
  }

  return { errCode: tempCode, errMsg: tempMessage };
}

export { getErrorCode };