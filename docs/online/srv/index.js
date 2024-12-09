import express from "express";
const app = express();
const port = 3111;

import { parser } from "./parser.js";

const html = `
<div>
  <h2 id="build">是兄弟就来点我！</h2>
  <div id="output">
    <h1>Welcome to a TSaid! 🥳</h1>
  </div>
</div>

<script type="module">
  import { codeToHtml } from "https://esm.sh/shiki@1.0.0";
  const build = document.querySelector("#build");
  const out = document.querySelector("#output");
  build.addEventListener("click", () => {
    fetch("/rerun")
      .then((resp) => resp.json())
      .then((resp) => {
        codeToHtml(resp.ans, {
          lang: "json",
          theme: "min-light",
        }).then((html) => {
          out.innerHTML = html;
        });
      });
  });
  setTimeout(() => {
    console.log("click 兄弟")
    build.click()
  }, 500)

</script>


`;

app.get("/", (req, res) => {
  res.send(html);
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
