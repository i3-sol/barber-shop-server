class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidateError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class SystemError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { AuthError, ValidateError, DatabaseError, SystemError }