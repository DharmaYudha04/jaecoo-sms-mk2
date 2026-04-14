export function validateEnvironmentVariables(): void {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL', 'PORT'];
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  const nodeEnv = process.env.NODE_ENV?.trim() || 'development';
  const allowed = ['development', 'production', 'test'];
  if (!allowed.includes(nodeEnv.toLowerCase())) {
    throw new Error(`NODE_ENV must be one of ${allowed.join(', ')}`);
  }
  process.env.NODE_ENV = nodeEnv;

  const frontendOrigins = process.env.FRONTEND_URL!
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (frontendOrigins.length === 0) {
    throw new Error('FRONTEND_URL must contain at least one valid URL.');
  }

  const invalidFrontendOrigin = frontendOrigins.find((value) => !/^https?:\/\/.+$/i.test(value));
  if (invalidFrontendOrigin) {
    throw new Error(
      'FRONTEND_URL must contain valid URL values with protocol http/https, separated by commas if needed.',
    );
  }

  if (process.env.BCRYPT_ROUNDS !== undefined) {
    const rounds = Number(process.env.BCRYPT_ROUNDS);
    if (!Number.isFinite(rounds) || !Number.isInteger(rounds) || rounds < 8) {
      throw new Error('BCRYPT_ROUNDS must be an integer >= 8');
    }
  }

  if (!Number.isFinite(Number(process.env.PORT || ''))) {
    throw new Error('PORT must be a valid number');
  }
}
