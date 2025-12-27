export type LoginResponse = {
  accessToken: string;
};

export type SignUpResponse = LoginResponse;

export type SignUpBody = {
  email: string;
  password: string;
  name: string;
}