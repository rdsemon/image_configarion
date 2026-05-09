import "dotenv/config";
import multer from "multer";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import express from "express";
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRATE,
});

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("This is not an image"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const resizeAndUploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    //alter native way to upload and resize image
    //option no 1
    const buffer = await sharp(req.file.buffer)
      .resize(500, 500)
      .jpeg({ quality: 90 })
      .toBuffer();

    // convert buffer to base64
    const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "users",
      public_id: `user-${Date.now()}`,
    });

    //resize image with sharp
    //option no 2 and recomended for large image
    // const buffer = await sharp(req.file.buffer)
    //   .resize(500, 500)
    //   .jpeg({ quality: 90 })
    //   .toBuffer();

    // //upload image with cloudinary
    // const result = await new Promise((resolve, reject) => {
    //   const stream = cloudinary.uploader.upload_stream(
    //     {
    //       folder: "users",
    //       public_id: `user-${Date.now()}`,
    //     },
    //     (error, result) => {
    //       if (error) return reject(error);
    //       resolve(result);
    //     },
    //   );
    //   streamifier.createReadStream(buffer).pipe(stream);
    // });

    req.body.image = result.secure_url;
    req.body.public_id = result.public_id;

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

app.post(
  "/users",
  upload.single("image"),
  resizeAndUploadPhoto,
  (req, res, next) => {
    res.status(200).json({ status: "successful", data: req.body });
  },
);

app.listen(3000, () => {
  console.log(`listening on prot 3000`);
});
