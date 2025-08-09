import { file } from "bun";
import config from "./config";

async function readFile(filePath: string) {
  try {
    const path = filePath;
    const file = Bun.file(path);
    console.log("Reading file:", file.name);
    const arrbuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrbuf);
    return buffer.toString("utf-8");
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

export async function readSearchTerms() {
  const filePath = config.SEARCH_TEARMS_PATH;
  if (filePath === "") {
    throw new Error("SEARCH_TEARMS_PATH is not set in config.");
  }
  const buff_str = await readFile(filePath);
  let results: Set<string> = new Set();
  buff_str.split("\n").map((term) => {
    if (term.trim()) {
      console.log("Search term:", term.trim());
      results.add(term.trim());
    }
  });
  return Array.from(results);
}
