# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


npm run build -- --preset=firebase

firebase emulators:start --project sso-playground-b2050

firebase apphosting:secrets:grantaccess --backend sso-playground-app BASE_URL --project sso-playground-b2050

## SSO Implementation TODO

### OpenID Connect (OIDC)

#### Essential Endpoints
- [ ] `GET /api/auth/[key]/login` - Initiate OIDC login flow
  - Redirect to provider's authorization endpoint
  - Generate `state` and `nonce` for security
  - Build authorization URL with required parameters
- [x] `GET /api/auth/[key]/callback` - Handle OAuth callback
  - Receive authorization code from provider
  - Exchange code for tokens (access_token, id_token)
  - Validate ID token
  - Create user session
- [ ] `POST /api/auth/[key]/logout` - Handle logout
  - End user session
  - Optionally call provider's logout endpoint

#### Optional Endpoints
- [ ] `GET /api/auth/[key]/.well-known/openid-configuration` - OIDC discovery metadata

### SAML 2.0

#### Essential Endpoints
- [ ] `GET /api/auth/[key]/metadata` - Service Provider metadata
  - Return SP metadata XML
  - Include entity ID, ACS URL, certificates
- [ ] `GET /api/auth/[key]/login` - Initiate SAML SSO (SP-Initiated)
  - Generate SAML AuthnRequest
  - Redirect to IdP's SSO endpoint
  - Include `RelayState` for return URL
- [ ] `POST /api/auth/[key]/callback` - Assertion Consumer Service (ACS)
  - Receive SAML Response from IdP
  - Validate signature and assertions
  - Extract user attributes
  - Create user session

#### Optional Endpoints
- [ ] `GET/POST /api/auth/[key]/logout` - Single Logout (SLO)
  - Handle logout requests from IdP
  - Send logout requests to IdP

