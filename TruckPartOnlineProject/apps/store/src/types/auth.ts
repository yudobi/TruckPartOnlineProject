export type UserInfo = {
  id: string;
  email: string;
  username: string;
  role?: string;
  full_name?: string | null;
  address?: string | null;
  phone_number?: string | null;
  is_staff?: boolean;
  is_verified?: boolean;

  accessToken?: string;
  refreshToken?: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access: string;
  refresh: string;
};

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
  phone_number: string;
  address: string;
};

export type RegisterResponse = {
  user: UserInfo;
  access?: string;
  refresh?: string;
  message?: string;
};

export type TokenRefreshResponse = {
  access: string;
};

export type VerifyEmailRequest = {
  token: string;
};

export type VerifyEmailResponse = {
  message: string;
  user: UserInfo;
  access: string;
  refresh: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  message: string;
};

