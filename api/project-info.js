export default function handler(req, res) {
  return res.status(200).json({
    productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL || '',
    deploymentUrl: process.env.VERCEL_URL || '',
    environment: process.env.VERCEL_ENV || '',
    repository: process.env.VERCEL_GIT_REPO_SLUG || '',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || '',
  });
}
