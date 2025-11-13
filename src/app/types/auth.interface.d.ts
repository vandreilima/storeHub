declare interface LoginRequest {
  email: string;
  password: string;
}

declare interface ApiSuccessResponse {
  token: string;
}

declare interface AuthStorageData {
  token: string;
}

declare interface ApiErrorResponse {}

interface ResetPasswordRequest {
  email: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
