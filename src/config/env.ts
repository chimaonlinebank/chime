type RequiredEnv = {
  VITE_API_URL: string;
  VITE_APP_NAME: string;
  VITE_FEATURE_FLAGS?: string;
  VITE_LOG_LEVEL?: string;
  VITE_IS_PRODUCTION?: boolean;
};

function getEnv(): RequiredEnv {
  // Vite exposes env via import.meta.env
  const env = (import.meta as any).env;

  const vars: RequiredEnv = {
    VITE_API_URL: env.VITE_API_URL,
    VITE_APP_NAME: env.VITE_APP_NAME,
    VITE_FEATURE_FLAGS: env.VITE_FEATURE_FLAGS,
    VITE_LOG_LEVEL: env.VITE_LOG_LEVEL || 'warn',
    VITE_IS_PRODUCTION: env.VITE_IS_PRODUCTION || env.MODE === 'production',
  };

  // Validate required
  if (!vars.VITE_API_URL) {
    throw new Error('Missing required env variable: VITE_API_URL');
  }
  if (!vars.VITE_APP_NAME) {
    throw new Error('Missing required env variable: VITE_APP_NAME');
  }

  return vars;
}

export const ENV = getEnv();

// Disable console in production to prevent logging sensitive data
if (ENV.VITE_IS_PRODUCTION && ENV.VITE_LOG_LEVEL === 'error') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

export default ENV;
