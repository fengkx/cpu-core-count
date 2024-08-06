import { createGetAvailableCPUs } from "./core/get-cpus";

/**
 * Return current available CPU count
 * can be a non integer in docker container (--cpus command in docker configure CFS scheduler)
 * @returns {Promise<number>}
 */
export const coreCount = createGetAvailableCPUs(
  {
    async fileExists(path) {
      return Bun.file(path).exists();
    },
    async readFile(path) {
      return Bun.file(path).text();
    },
  },
  {
    getSystemCPUs() {
      return navigator.hardwareConcurrency;
    },
  },
);
