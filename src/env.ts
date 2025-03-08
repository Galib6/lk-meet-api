import { envConfig } from "@src/env.validator";

export const ENV_DEVELOPMENT = "development";
export const ENV_PRODUCTION = "production";
export const ENV_STAGING = "staging";
export const ENV_QA = "qa";

export const ENV = {
  config: {
    port: envConfig.PORT,
    appEnv: envConfig.APP_ENV,
    nodeEnv: envConfig.NODE_ENV,
    timeZone: envConfig.TZ,
    isDevelopment: envConfig.NODE_ENV === "development",
  },
  swagger: {
    apiPrefix: envConfig.API_PREFIX,
    apiBaseUrl: envConfig.API_BASE_URL,
    apiVersion: envConfig.API_VERSION,
    apiTitle: envConfig.API_TITLE,
    apiDescription: envConfig.API_DESCRIPTION,
  },
  defaultDatabase: {
    type: envConfig.DB_TYPE,
    host: envConfig.DB_HOST,
    port: envConfig.DB_PORT,
    user: envConfig.DB_USERNAME,
    password: envConfig.DB_PASSWORD,
    databaseName: envConfig.DB_DATABASE,
    synchronization: envConfig.DB_SYNCHRONIZE,
    logging: envConfig.DB_LOGGING,
  },
  fileStorage: {
    s3Region: envConfig.S3_REGION,
    s3EndPoint: envConfig.S3_ENDPOINT,
    s3AccessKey: envConfig.S3_ACCESS_KEY,
    s3SecretKey: envConfig.S3_SECRET_KEY,
    s3Bucket: envConfig.S3_BUCKET,
    folderPrefix: envConfig.S3_FOLDER_PREFIX,
  },

  google: {
    clientId: envConfig.GOOGLE_CLIENT_ID,
    secret: envConfig.GOOGLE_SECRET,
    redirectUrl: envConfig.GOOGLE_REDIRECT_URL,
  },

  // Security configuration
  CORS_ALLOWED_ORIGINS:
    process.env.CORS_ALLOWED_ORIGINS?.split(",").map((item) => item.trim()) ||
    [],

  rateLimit: {
    rateLimitTTL: envConfig.RATE_LIMIT_TTL,
    rateLimitMax: envConfig.RATE_LIMIT_MAX,
  },

  liveKit: {
    apiKey: envConfig.LIVEKIT_API_KEY,
    secret: envConfig.LIVEKIT_API_SECRET,
    serverUrl: envConfig.LIVEKIT_SERVER_URL,
  },

  // Logger configuration
  logFolder: envConfig.LOG_FOLDER,

  // JWT configuration
  jwt: {
    jwtSecret: envConfig.JWT_SECRET,
    jwtSaltRounds: envConfig.JWT_SALT_ROUNDS,
    jwtExpiresIn: envConfig.JWT_EXPIRES_IN,
    jwtRefreshTokenExpiresIn: envConfig.JWT_REFRESH_TOKEN_EXPIRES_IN,

    secret: envConfig.JWT_SECRET,
    saltRound: parseInt(envConfig.JWT_SALT_ROUNDS, 10),
    tokenExpireIn: envConfig.JWT_EXPIRES_IN,
    refreshTokenExpireIn: envConfig.JWT_REFRESH_TOKEN_EXPIRES_IN,
    audience: envConfig.JWT_TOKEN_AUDIENCE,
    issuer: envConfig.JWT_TOKEN_ISSUER,
  },

  // Auth configuration
  otpExpiresIn: envConfig.OTP_EXPIRES_IN,

  //smtp
  smtp: {
    smtpHost: envConfig.SMTP_HOST,
    smtpPort: envConfig.SMTP_PORT,
    smtpUser: envConfig.SMTP_USERNAME,
    smtpPassword: envConfig.SMTP_PASSWORD,
  },

  redis: {
    host: envConfig.REDIS_HOST,
    port: +envConfig.REDIS_PORT,
    username: envConfig.REDIS_USERNAME,
    password: envConfig.REDIS_PASSWORD,
    tls: envConfig.REDIS_TLS,
  },

  seedData: {
    email: envConfig.SEED_SUPER_ADMIN_EMAIL,
    password: envConfig.SEED_SUPER_ADMIN_PASSWORD,
  },
};
