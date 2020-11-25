"use strict";

const { exec } = require("child_process");
var express = require("express");
var app = express();

app.set("port", process.env.PORT || 4000);

app.post("/", function (req, res) {
  runci();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ response: "OK" }));
});

function aexec(command, options = { cwd: process.cwd() }) {
  return new Promise((done, failed) => {
    exec(command, { ...options }, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout;
        err.stderr = stderr;
        failed(err);
        return;
      }

      done({ stdout, stderr });
    });
  });
}

const runci = async () => {
  console.log("Git reset...");
  await aexec("git -C ~/apps/telegram-translate-bot reset --hard", callback);
  console.log("Git clean...");
  await aexec("git -C ~/apps/telegram-translate-bot clean -df", callback);
  console.log("Git pull...");
  await aexec("git -C ~/apps/telegram-translate-bot pull -f", callback);
  console.log("Npm build prod...");
  await aexec(
    "npm -C ~/apps/telegram-translate-bot install --production",
    callback
  );
  console.log("Restart app...");
  await aexec("pm2 restart 0", callback);
};

const callback = (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.log(stderr);
};

var server = app.listen(app.get("port"), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log(`Node.js API app listening at ${(host, port)}`);
});
