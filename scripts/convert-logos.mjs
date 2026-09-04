import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const logoDirectory = path.resolve("public/images/logo");
const files = (await readdir(logoDirectory)).filter((file) =>
  /^logo(?:_\d+)?\.png$/i.test(file),
);

if (files.length === 0) {
  throw new Error(`No logo PNG files found in ${logoDirectory}`);
}

await Promise.all(
  files.map(async (file) => {
    const inputPath = path.join(logoDirectory, file);
    const outputPath = path.join(logoDirectory, `${path.parse(file).name}.webp`);

    await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
    console.log(`${file} -> ${path.basename(outputPath)}`);
  }),
);