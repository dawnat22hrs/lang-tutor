const fs = require("fs");
const path = require("path");

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
console.log("✓ data/ directory ready");
console.log("✓ Setup complete — run `yarn dev` to start");
