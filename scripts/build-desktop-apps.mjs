import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function copyTreeOverwrite(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyTreeOverwrite(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

const targets = [
  {
    role: "callcenter",
    srcDir: path.join(root, "public", "callcenter"),
    destDir: path.join(root, "callcenter-desktop", "www"),
  },
  {
    role: "sales",
    srcDir: path.join(root, "public", "sales"),
    destDir: path.join(root, "sales-desktop", "www"),
  },
];

for (const { role, srcDir, destDir } of targets) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Missing built public/${role} directory. Run build-public-staff.mjs first.`);
  }
  copyTreeOverwrite(srcDir, destDir);

  for (const extraAsset of ["login-logo.png", "logo.png"]) {
    const assetSrc = path.join(root, "public", extraAsset);
    if (fs.existsSync(assetSrc)) {
      fs.copyFileSync(assetSrc, path.join(destDir, extraAsset));
    }
  }
  console.log(`[build-desktop-apps] Synced /${role}/ bundle into ${destDir}`);
}
