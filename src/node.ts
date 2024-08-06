import { access, readFile } from "node:fs/promises";
import { cpus } from "node:os";

import { createGetAvailableCPUs } from "./core/get-cpus";

/**
 * @remarks
 * Get available CPU core count inside / outside docker container
 *
 * @packageDocumentation
 */

/**
 * @example
 * ```js
 * console.log(await coreCount()) // print 12
 * console.log(await coreCount()) // print 1.5 inside docker with --cpus 1.5
 * ```
 * @public
 *
 * @remarks
 * Return current available CPU count
 *
 * it can be a non integer in docker container (--cpus command in docker configure CFS scheduler)
 *
 * @link {https://docs.docker.com/config/containers/resource_constraints/#configure-the-default-cfs-scheduler}
 */
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
