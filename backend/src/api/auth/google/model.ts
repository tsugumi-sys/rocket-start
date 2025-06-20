export interface GoogleIdTokenPayload {
  iss: string;
  azp?: string;
  aud: string;
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  at_hash?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat: number;
  exp: number;
}
