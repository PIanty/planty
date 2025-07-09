import { cleanEnv, str, port, num } from 'envalid';

export const ValidateEnv = () => {
  const env = cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    ORIGIN: str(),
    CREDENTIALS: str(),
    MAX_FILE_SIZE: str({ default: '5mb' }),
    LOG_FORMAT: str(),
    LOG_DIR: str(),
    OPENAI_API_KEY: str(),
    ADMIN_MNEMONIC: str(),
    ADMIN_ADDRESS: str(),
    NETWORK_URL: str(),
    NETWORK_TYPE: str(),
    REWARD_AMOUNT: str(),
    SUPABASE_URL: str(),
    SUPABASE_JUSROLE: str(),
    BACKEND_URL: str({ default: 'http://localhost:3000' }),
  });
  
  return env;
};
