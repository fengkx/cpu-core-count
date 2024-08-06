import { createGetAvailableCPUs } from "./core/get-cpus";

/**
 * @public
 * Return current available CPU count
 * can be a non integer in docker container (--cpus command in docker configure CFS scheduler)
 * @returns {Promise<number>}
 */
export const coreCount = createGetAvailableCPUs(
  {
    async fileExists(path) {
      try {
        await Deno.lstat(path);
        return true;
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return false;
        }
        throw error;
      }
    },
    async readFile(path) {
      return Deno.readTextFile(path);
    },
  },
  {
    getSystemCPUs() {
      return navigator.hardwareConcurrency;
    },
  },
);
