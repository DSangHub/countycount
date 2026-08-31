import crypto from 'node:crypto';
import { CountryCode, Products } from 'plaid';
import { getPlaidClient } from '../../server/plaid.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const plaid = getPlaidClient();
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
    return res.status(200).json({ link_token: response.data.link_token, userId });
  } catch (error) {
    return res.status(502).json({ error: 'Unable to start a secure bank connection.', detail: error.response?.data?.error_message });
  }
}
