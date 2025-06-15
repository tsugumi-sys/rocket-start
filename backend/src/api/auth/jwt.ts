export type JwtPayload = {
  sub: string;
  /** Expiration time as a Unix timestamp in seconds */
  exp: number;
  /** Token type distinguishes access and refresh tokens */
  typ?: "refresh";
};
