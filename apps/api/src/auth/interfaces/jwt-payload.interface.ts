export interface JwtPayload {
  email: string;
  sub: string;
}

export interface UserRequest {
  id: string;
  email: string;
}
