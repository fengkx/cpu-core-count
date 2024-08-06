import { access, readFile } from "fs/promises";
import { cpus } from "node:os";

import { createGetAvailableCPUs } from "./core/get-cpus";

export const coreCount = createGetAvailableCPUs(
  {
    async fileExists(path) {
      try {
        await access(path);
        return true;
      } catch {
        return false;
      }
    },
    async readFile(path) {
      return readFile(path, { encoding: "utf-8" });
    },
  },
  {
    getSystemCPUs() {
      return cpus().length;
    },
  },
);
