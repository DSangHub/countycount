import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const app = express();
app.use(express.json());

function plaidClient() {
  const environment = process.env.PLAID_ENV || 'sandbox';
  const basePath = PlaidEnvironments[environment];
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET || !basePath) return null;
  return new PlaidApi(new Configuration({
    basePath,
    baseOptions: { headers: { 'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID, 'PLAID-SECRET': process.env.PLAID_SECRET } },
  }));
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/financial-partners', async (_req, res) => {
  const partners = JSON.parse(await fs.readFile(path.join(root, 'data/partners.json'), 'utf8'));
  res.json(partners.filter((partner) => partner.status === 'active'));
});

app.post('/api/plaid/create-link-token', async (req, res) => {
  const plaid = plaidClient();
  if (!plaid) return res.status(503).json({ error: 'Plaid is not configured yet.' });
  try {
    const userId = String(req.body?.userId || crypto.randomUUID());
    const response = await plaid.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'CountyCount',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL || undefined,
    });
    res.json({ link_token: response.data.link_token, userId });
  } catch (error) {
    res.status(502).json({ error: 'Unable to start a secure bank connection.', detail: error.response?.data?.error_message });
  }
});

app.post('/api/plaid/exchange-public-token', async (req, res) => {
  const plaid = plaidClient();
  if (!plaid) return res.status(503).json({ error: 'Plaid is not configured yet.' });
  if (!req.body?.public_token) return res.status(400).json({ error: 'Missing public token.' });
  try {
    const response = await plaid.itemPublicTokenExchange({ public_token: req.body.public_token });
    // Production launch requirement: encrypt and persist access_token against an authenticated user.
    // This starter intentionally does not write bank tokens to disk or expose them to the browser.
    res.json({ connected: true, item_id: response.data.item_id, persistence_required: true });
  } catch (error) {
    res.status(502).json({ error: 'Unable to finish the bank connection.', detail: error.response?.data?.error_message });
  }
});

app.post('/api/plaid/webhook', (req, res) => {
  console.info('Plaid webhook received', req.body?.webhook_type, req.body?.webhook_code);
  res.sendStatus(200);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(root, 'dist/index.html')));
}

app.listen(process.env.PORT || 5000, '0.0.0.0', () => console.log(`CountyCount server running on ${process.env.PORT || 5000}`));
