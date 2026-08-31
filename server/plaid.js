import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

export function getPlaidClient() {
  const environment = process.env.PLAID_ENV || 'sandbox';
  const basePath = PlaidEnvironments[environment];
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET || !basePath) return null;
  return new PlaidApi(new Configuration({
    basePath,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }));
}
