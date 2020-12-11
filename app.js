const debug = require("debug")("file");
const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");

// public url
let SERVER_URL;

const app = express();

// app.set("x-powered-by", false);
app.set("trust proxy", 1);

app.use(morgan("dev"));

app.get("/", (req, res) => {
  debug("Header Accept: %s", req.headers.accept);

  if (req.headers.accept && req.headers.accept.includes("html")) {
    res.sendFile(path.join(__dirname, "public/index.html"));
    return;
  }

  res
    .set("content-type", "text/markdown")
    .sendFile(path.join(__dirname, "README.md"), {
      maxAge: 24 * 3600 * 1000,
      immutable: true,
    });
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
  max: 10,
});

app.post("/", uploadLimiter, upload.array("file", 10), (req, res) => {
  debug("req.headers: %O", req.headers);
  debug("req.files: %O", req.files);
  debug("req.body: %O", req.body);
  if (req.files.length === 0) {
    throw new Error("Missing files, you need to upload at least one file");
  }

  if (req.headers.accept && req.headers.accept.includes("html")) {
    // 一张图直接重定向到结果
    if (req.files.length === 1) {
      const file = req.files[0];
      const url = `${SERVER_URL}/${file.filename}`;
      res.redirect(url);
      return;
    }
    const body =
      "<ol>" +
      req.files
        .map((file) => {
          const url = `${SERVER_URL}/${file.filename}`;
          return `<li><a href="${url}">${url}</a></li>`;
        })
        .join("\n") +
      "</ol>";
    res.send(body);
    return;
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
