import { writeFileSync, mkdirSync } from "node:fs";

const ROWS = Number(process.env.ROWS ?? "10000");
const categories = ["furniture", "stationery", "peripherals", "storage", "lighting", "breakroom"];

mkdirSync("data", { recursive: true });

const lines: string[] = ["id,name,category,price,stock"];

for (let i = 1; i <= ROWS; i++) {
  const category = categories[i % categories.length];
  const name = `${category}-${i}`;
  const price = ((i * 137) % 10000) / 100;
  const stock = (i * 7) % 500;
  lines.push(`${i},${name},${category},${price.toFixed(2)},${stock}`);
}

writeFileSync("data/products.csv", lines.join("\n"));
console.log(`Generated ${ROWS} rows -> data/products.csv`);