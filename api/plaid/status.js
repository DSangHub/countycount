export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const environment = process.env.PLAID_ENV || '';
  return res.status(200).json({
    clientIdConfigured: Boolean(process.env.PLAID_CLIENT_ID),
    secretConfigured: Boolean(process.env.PLAID_SECRET),
    environmentConfigured: ['sandbox', 'development', 'production'].includes(environment),
    environment,
    webhookConfigured: Boolean(process.env.PLAID_WEBHOOK_URL),
  });
}
