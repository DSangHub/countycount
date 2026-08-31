export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  console.info('Plaid webhook received', req.body?.webhook_type, req.body?.webhook_code);
  return res.status(200).json({ received: true });
}
