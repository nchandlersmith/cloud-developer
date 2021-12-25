import { decode } from 'jsonwebtoken'

import { JwtToken } from './JwtToken'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function getUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtToken
  return decodedJwt.sub
}

export const cert = '-----BEGIN CERTIFICATE-----MIIDDTCCAfWgAwIBAgIJC9/ehgKuZG3RMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMTGWRldi1vcjU4MGwwNy51cy5hdXRoMC5jb20wHhcNMjExMjI1MTgwNDMzWhcNMzUwOTAzMTgwNDMzWjAkMSIwIAYDVQQDExlkZXYtb3I1ODBsMDcudXMuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1rE3I3V3xmXQzydatgtrjv95tX7VGL5AkzLOUXeo3I0MsZbZnFKRmBpRqVb8okmm7JWkFpy8dKloYO6magypUJARMLhZR+D7SIGyQq+wstCykLsUVZuOa4n2bGMXpB06eq8aXSHy8BuHX9rfvd5Yu5U50LYRTToTiAvms86QJk4P3bt6+wfOJixwmQLRA/k313og7f5jbQ4Q9RNRQUQ5KYYJG3YmRedtDsTOBgfkPx+UgM3KX+hfJonkxtx/Rcg3j5+LJEyjVIdRJKE1x+waRk8OmyPbbnEzQwqDb/CLhgECpxSW59EWAIQU3Pxv+tCIuQvsL4Yq4V82Q9uh6eA8UwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS22OIFMdABw1qtvsAOEbTYbJaCqzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAC936V9Jlgb5E3btFaESsplFnVnmpaMLcdzWM3tbW8GGSzzzKuWu6RB9bQ7MYD6ViqUPdnBRgiqMcj0oERt9aP0V8ZFjg5NmZ58do9k4+XWNWH9NwL77w8+LR89E64kRoQB2XDLCc4kjHeHXTZjYvqZ3Hd0dXTwkzFEEIAH1BQWUTP46YggQ2NBO+eXkJAI46UyOHRLYkKkGUSTJDoop/CZLdA1ePU5DlHrrOHNIuxkBLuxtSK+8x2kU+xGKjduvezxdUCAnFVDR/CTpY/ySeXu2kLIBHbuW9itMvRtSqrks8T+Un5HUa2Dr+kHR/KEZK9XD+UbX2xDtHTTXuAIz5ow=-----END CERTIFICATE-----'