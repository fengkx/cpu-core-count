import { coreCount as bunImpl } from "../bun";
import { coreCount as nodeImpl } from "../node";

export const isBun = globalThis.process?.versions?.bun !== undefined;

async function main() {
  const count = isBun ? await bunImpl() : await nodeImpl();
  console.log(count);
  return;
}

main();
