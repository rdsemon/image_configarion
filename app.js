import express from "express";
import multer from "multer";
import sharp from "sharp";

const app = express();

app.use(express.static("public"));

app.get("/", (req, res, next) => {
  res.send("get the calls");
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(console.log("This is not image"));
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const resizePhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/user${req.file.filename}`);

  next();
};

app.post("/profile", upload.single("image"), resizePhoto, (req, res) => {
  console.log(req.file);
  console.log(req.body);

  res.send("get the call from profile");
});

app.listen(3000, () => {
  console.log(`listening on port ${3000}`);
});
