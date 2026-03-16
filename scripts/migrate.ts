import { execFileSync } from "node:child_process";
import { join } from "node:path";

const drizzleKitBin =
  process.platform === "win32"
    ? join(process.cwd(), "node_modules", ".bin", "drizzle-kit.cmd")
    : join(process.cwd(), "node_modules", ".bin", "drizzle-kit");

execFileSync(drizzleKitBin, ["migrate"], {
  stdio: "inherit",
});
