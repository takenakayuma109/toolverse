export class ToolverseError extends Error {
  public code: string;
  public status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'ToolverseError';
    this.code = code;
    this.status = status;

    // Restore prototype chain (needed when extending built-ins)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthError extends ToolverseError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class InsufficientCreditsError extends ToolverseError {
  constructor() {
    super('Insufficient credits', 'INSUFFICIENT_CREDITS', 402);
    this.name = 'InsufficientCreditsError';
  }
}

export class NetworkError extends ToolverseError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ApiError extends ToolverseError {
  constructor(message: string, status: number) {
    super(message, 'API_ERROR', status);
    this.name = 'ApiError';
  }
}
