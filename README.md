# CountyCount

Standalone CountyCount web application recovered from the live campaign experience.

## Run locally

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
NODE_ENV=production npm start
```

Copy `.env.example` to `.env` and supply Plaid Sandbox credentials through the hosting provider's secret manager. Never commit secrets.

The partner modal is fed by `GET /api/financial-partners`. Plaid Link uses server-side routes under `/api/plaid`. The public-token exchange intentionally does not persist Plaid access tokens until authenticated user storage and encryption are configured; this prevents unsafe handling of bank credentials.
