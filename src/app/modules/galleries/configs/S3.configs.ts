import { registerAs } from "@nestjs/config";

export default registerAs("AWS_S3_CONFIG", () => ({
  s3EndPoint: process.env.S3_ENDPOINT,
  s3AccessKey: process.env.S3_ACCESS_KEY,
  s3SecretKey: process.env.S3_SECRET_KEY,
  s3Bucket: process.env.S3_BUCKET,
  s3Region: process.env.S3_REGION,

  fileStorage: process.env.FILE_STORAGE,
  fileStorageLocalBase: process.env.FILE_STORAGE_LOCAL_BASE,
}));
