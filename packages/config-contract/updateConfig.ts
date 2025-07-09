import fs from "fs";
import path from "path";

export const updateConfig = async (newConfig: unknown, jusCatAbi?: any, passportAbi?: any) => {
  const toWrite =
    `export const config = ` +
    JSON.stringify(newConfig, null, 2) +
    ";\n" +
    `export const JUSCAT_SOL_ABI = ` +
    JSON.stringify(jusCatAbi || null, null, 2) +
    " as const;\n" +
    `export const JUSCAT_PASSPORT_ABI = ` +
    JSON.stringify(passportAbi || null, null, 2) +
    " as const;\n" +
    `export const ECO_SOL_ABI = ` +
    JSON.stringify(jusCatAbi || null, null, 2) +
    " as const;\n";

  fs.writeFileSync(path.join(__dirname, "config.ts"), toWrite);
};
