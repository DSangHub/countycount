import partners from '../data/partners.json' with { type: 'json' };

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  return res.status(200).json(partners.filter((partner) => partner.status === 'active'));
}
