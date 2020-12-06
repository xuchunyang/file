const debug = require("debug")("file");
const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

// public url
let SERVER_URL;

const app = express();

app.set("x-powered-by", false);
app.set("trust proxy", 1);

app.use(morgan("dev"));

app.get("/", (req, res) => {
  const body = `\
# 文件存储

## 使用方法

    $ curl --form file=@/path/to/file ${SERVER_URL}

TODO

## 使用限制

1. 单个文件最大 5 * 1024 * 1024 bytes （5 MiB）
2. 一次请求最多上传 10 个文件
3. 一分钟内最多上传 30 次
`;
  res.set("content-type", "text/markdown").end(body);
});

fs.mkdirSync("files", { recursive: true });
let id = fs.readdirSync("files").length;
const storage = multer.diskStorage({
  destination: "files",
  filename: (req, file, cb) => {
    const filename = id++ + "-" + file.originalname;
    debug("生成文件名 %s", filename);
    cb(null, filename);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
});

app.post("/", uploadLimiter, upload.array("file", 10), (req, res) => {
  debug("req.headers: %O", req.headers);
  debug("req.files: %O", req.files);
  debug("req.body: %O", req.body);
  if (req.files.length === 0) {
    throw new Error("Missing files, you need to upload at least one file");
  }

  const body = req.files
    .map((file) => {
      return `${SERVER_URL}/${file.filename}`;
    })
    .join("\n");
  res.set("content-type", "text/plain").end(body + "\n");
});

app.use(express.static("files"));

const server = app.listen(
  process.env.PORT || 3000,
  process.env.HOST || "localhost",
  () => {
    SERVER_URL =
      process.env.SERVER_URL ||
      (() => {
        const { address, port } = server.address();
        return `http://${address}:${port}`;
      })();

    console.log(`Listening at ${SERVER_URL}/`);
  }
);
