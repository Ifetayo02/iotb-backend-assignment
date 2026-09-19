import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";

const start = performance.now();

const byCategory = new Map<string, number>();
let grandTotal = 0;
let count = 0;
let isFirstLine = true;

const rl = createInterface({
  input: createReadStream("data/products.csv"),
  crlfDelay: Infinity,
});

for await (const line of rl) {
  if (isFirstLine) {
    isFirstLine = false;
    continue; // skip header
  }
  if (!line.trim()) continue;

  const [, , category, price, stock] = line.split(",");
  const total = Number(price) * Number(stock);

  byCategory.set(category, (byCategory.get(category) ?? 0) + total);
  grandTotal += total;
  count++;
}

const outPath = process.env.OUTFile ?? "data/category-summary.csv";
const out = createWriteStream(outPath);
out.write("category,total\n");

for (const [category, total] of byCategory) {
  console.log(`${category} → $${total.toFixed(2)}`);
  out.write(`${category},${total.toFixed(2)}\n`);
}
out.end();

console.log(`Rows: ${count}`);
console.log(`Grand total: $${grandTotal.toFixed(2)}`);
console.log(`Took ${(performance.now() - start).toFixed(1)} ms`);