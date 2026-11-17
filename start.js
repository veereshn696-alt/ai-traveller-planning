const { spawn } = require("child_process");
const path = require("path");

console.log("=========================================");
console.log("🚀 Starting AI Travel Planner Suite...");
console.log("=========================================\n");

// 1. Start Backend Server
const backend = spawn("node", ["server.js"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
  shell: true,
});

backend.on("error", (err) => {
  console.error("❌ Failed to start Backend Server:", err);
});

// 2. Start Frontend Dev Server
const frontend = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  stdio: "inherit",
  shell: true,
});

frontend.on("error", (err) => {
  console.error("❌ Failed to start Frontend Server:", err);
});

// 3. Open Browser after 2.5 seconds
setTimeout(() => {
  const url = "http://localhost:5173";
  console.log(`\n🌐 Opening web application at ${url}...\n`);
  const openCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(openCmd, [url], { shell: true, stdio: "ignore" });
}, 2500);

// Handle exit cleanly
process.on("SIGINT", () => {
  console.log("\nShutting down servers...");
  backend.kill();
  frontend.kill();
  process.exit();
});
