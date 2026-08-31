import { getPlaidClient } from '../../server/plaid.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const plaid = getPlaidClient();
  if (!plaid) return res.status(503).json({ error: 'Plaid is not configured yet.' });
  if (!req.body?.public_token) return res.status(400).json({ error: 'Missing public token.' });
  try {
    const response = await plaid.itemPublicTokenExchange({ public_token: req.body.public_token });
    // Do not expose or persist access_token until authenticated encrypted storage is configured.
    return res.status(200).json({ connected: true, item_id: response.data.item_id, persistence_required: true });
  } catch (error) {
    return res.status(502).json({ error: 'Unable to finish the bank connection.', detail: error.response?.data?.error_message });
  }
}
