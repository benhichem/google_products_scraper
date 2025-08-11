import { file } from "bun";
import config from "./config";
import Papa from "papaparse";

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

export async function updateSearchTerms(processedTerm: string) {
  try {
    const filePath = config.SEARCH_TEARMS_PATH;
    const searchTerms = await readFile(filePath);
    const terms = searchTerms.split("\n").filter((term) => term.trim() !== "");
    // Remove the processed term
    const updatedTerms = terms.filter(term => term.trim() !== processedTerm.trim());
    // Write the updated terms back to the file
    await writeFile(filePath, updatedTerms);
    console.log(`Successfully removed processed term: "${processedTerm}"`);
    return updatedTerms;
  } catch (error) {
    console.error('Error updating search terms:', error);
    throw error;
  }
}

async function writeFile(filePath: string, data: Array<string>) {
  try {
    const path = filePath;
    const file = Bun.file(path);
    console.log("Writing to file:", file.name);
    let dataString = data.join("\n");
    await Bun.write(file, dataString);
    console.log("File written successfully");
  } catch (error) {
    console.log(error);
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

// Function to convert JSON data to CSV using Papa Parse
export function jsonToCsv(jsonData: Array<any>, options = {}) {
  // Default options
  const defaultOptions = {
    quotes: false, // Whether to wrap fields in quotes
    quoteChar: '"', // Character to use for quotes
    escapeChar: '"', // Character to escape quotes
    delimiter: ",", // Field delimiter
    header: true, // Include header row
    newline: "\r\n", // Line ending
    skipEmptyLines: false, // Skip empty lines
  };

  // Merge user options with defaults
  const config = { ...defaultOptions, ...options };

  try {
    // Use Papa Parse's unparse method to convert JSON to CSV
    const csv = Papa.unparse(jsonData, config);
    return csv;
  } catch (error) {
    throw new Error(`Error converting JSON to CSV: ${error}`);
  }
}
