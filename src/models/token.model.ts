export interface TokenModel {
    access_token: string,
    expires_in: number | string,
    token_type: string,
    scope: string,
    refresh_token: string
}