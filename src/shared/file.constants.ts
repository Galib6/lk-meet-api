import { diskStorage } from "multer";
import * as path from "path";

export const generateFilename = (file) => {
  return `${crypto.randomUUID()}${path.extname(file.originalname)}`;
};

export const storageImageOptions = diskStorage({
  destination: "./uploads/temp",
  filename: (req, file, callback) => {
    callback(null, generateFilename(file));
  },
});

export enum ENUM_FILE_STORAGE {
  LOCAL = "local",
  S3 = "s3",
}
