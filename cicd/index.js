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

const runci = () => {
   console.log('Git reset...')
  exec("git -C ~/apps/telegram-translate-bot reset --hard", callback);
   console.log('Git clean...')
   exec("git -C ~/apps/telegram-translate-bot clean -df", callback);
   console.log('Git pull...')
   exec("git -C ~/apps/telegram-translate-bot pull -f", callback);
   console.log('Npm build prod...')
   exec("npm -C ~/apps/telegram-translate-bot install --production", callback);
   console.log('Restart app...')
   exec("pm2 restart 0", callback);
};

const callback = (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.log(stderr);
};

var server = app.listen(app.get("port"), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log(`Node.js API app listening at ${host, port}`);
});
