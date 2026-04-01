export default () => {
  const dbTarget = (process.env.DB_TARGET || 'local').toLowerCase();
  const useCloudDb = dbTarget === 'cloud';

  const localDb = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '135792468',
    database: process.env.DB_DATABASE || 'health-pal-db',
  };

  const cloudDb = {
    host: process.env.CLOUD_DB_HOST || localDb.host,
    port: parseInt(process.env.CLOUD_DB_PORT || String(localDb.port), 10),
    username: process.env.CLOUD_DB_USERNAME || localDb.username,
    password: process.env.CLOUD_DB_PASSWORD || localDb.password,
    database: process.env.CLOUD_DB_DATABASE || localDb.database,
  };

  const selectedDb = useCloudDb ? cloudDb : localDb;

  return {
    DB_TARGET: dbTarget,
    DB_DATABASE: selectedDb.database,
    DB_USERNAME: selectedDb.username,
    DB_PORT: selectedDb.port,
    DB_PASSWORD: selectedDb.password,
    DB_HOST: selectedDb.host,
  };
};

// Reads from environment variables with fallback defaults
