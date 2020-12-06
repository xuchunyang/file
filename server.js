const express = require("express");
const morgan = require("morgan");
const debug = require("debug")("file");
const multer = require("multer"); // v1.0.5
const upload = multer(); // for parsing multipart/form-data

const app = express();

app.use(morgan("dev"));

// curl -d @emacs.png 没有文件名 也没有 content-type
// application/x-www-form-urlencoded

app.post("/x", (req, res) => {
  debug("=> %s %s", req.method, req.url);
  debug("HEADERS: %O", req.headers);
  req.setEncoding("utf8");
  req.on("data", (chunk) => debug("CHUNK: %s", chunk));
  res.send("TODO");
});

// curl -F/--form multipart/form-data 有 文件名 也有 mimetype
app.post(/.*/, upload.single("file"), (req, res) => {
  debug("=> %s %s", req.method, req.url);
  debug("HEADERS: %O", req.headers);
  req.on("data", (chunk) => debug("CHUNK: %o", chunk));
  debug("BODY: ", req.body);
  debug("FILE: ", req.file);
  res.send("POST");
});

// curl -T/--upload-file 没有 content-type，但是有文件名称，这样能得到 content-type
let i = 1;
app.put(/.*/, (req, res) => {
  debug("=> %s %s", req.method, req.url);
  debug("HEADERS: %O", req.headers);
  req.setEncoding("utf8");
  req.on("data", (chunk) => debug("CHUNK: %o", chunk));
  res.send("TODO" + i++);
});

const server = app.listen(3000, "localhost", () => {
  const { address, port } = server.address();
  console.log(`Listening at http://${address}:${port}/`);
});
