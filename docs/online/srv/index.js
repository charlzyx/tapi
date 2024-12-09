import express from "express";
const app = express();
const port = 3111;

import { parser } from "./parser.js";

app.get("/", (req, res) => {
  res.send("Welcome to a TSaid! 🥳");
});

app.get("/rerun", (req, res) => {
  let ans = "NONE";
  try {
    ans = parser();
  } catch (error) {
    ans = error.toString();
  }
  res.json({ ans });
});

app.listen(port, () => {
  console.log(`App is live at http://localhost:${port}`);
});
