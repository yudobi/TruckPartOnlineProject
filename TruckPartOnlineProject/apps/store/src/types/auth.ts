export type UserInfo = {
  id: string;
  email: string;
  username: string;
  role?: string;
  address?: string | null;
  phone_number?: string | null;

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

