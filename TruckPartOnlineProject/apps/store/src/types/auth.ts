export type UserInfo = {
  id: string;
  email: string;
  username: string;
  role?: string;
  address?: string | null;
  phone_number?: string | null;
  name?: string;
  last_name?: string;
  home_address?: string;

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
  access: string;
  refresh: string;
};

