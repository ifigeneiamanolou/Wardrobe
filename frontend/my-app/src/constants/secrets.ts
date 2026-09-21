type GOOGLE_AUTH_KEYS = 
    | "client_id";

export const oauth_google: Record<GOOGLE_AUTH_KEYS, string> = {
    client_id: process.env.GOOGLE_WEB_CLIENT_ID || "",
}