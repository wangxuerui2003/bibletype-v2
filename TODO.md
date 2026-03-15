# TODO

## Google Cloud Console setup

- Create or reuse a Google Cloud project for BibleType.
- Enable the Google OAuth APIs needed for sign-in.
- Create OAuth client credentials for the web app.
- Add the local callback and origin values while developing:
  - Origin: `http://localhost:3100`
  - Better Auth base URL: `http://localhost:3100`
- Add the production origin and callback values before deployment.
- Fill these environment variables:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- After the credentials are set, manually test the Google sign-in button and callback flow.
