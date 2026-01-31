export type UserLoginInfo = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  accessToken?: string;
  refreshToken?: string;
};

export type LoginCredentials ={
    username: string,
    password: string
}

