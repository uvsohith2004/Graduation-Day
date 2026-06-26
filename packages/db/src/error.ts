export class DatabaseError extends Error {
  readonly code: string;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
    if (cause !== undefined) this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DatabaseConfigError extends DatabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, "DB_CONFIG_ERROR", cause);
    this.name = "DatabaseConfigError";
  }
}

export class DatabasePoolError extends DatabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, "DB_POOL_ERROR", cause);
    this.name = "DatabasePoolError";
  }
}
