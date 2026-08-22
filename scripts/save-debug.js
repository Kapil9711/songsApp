const http = require("http");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(process.cwd(), "debug.json");

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/save") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);

      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf8");

      console.log(`✅ Saved: ${outputPath}`);

      res.writeHead(200, {
        "Content-Type": "application/json",
      });

      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error(error);

      res.writeHead(400);
      res.end("Invalid JSON");
    }
  });
});

server.listen(5050, "0.0.0.0", () => {
  console.log("🚀 Debug server running on port 5050");
});
