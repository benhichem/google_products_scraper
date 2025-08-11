# Google Product Scraper

A powerful and efficient web scraping tool designed to extract product information from Google Shopping search results. This tool automates the process of searching for products across multiple search terms and stores the results in a structured CSV format.

## Features

- **Automated Browsing**: Uses Puppeteer with a real browser instance for reliable scraping
- **Multiple Search Terms**: Process multiple search terms from a simple text file
- **Structured Output**: Exports results to a clean, organized CSV file
- **Configurable**: Easy-to-modify configuration for different use cases
- **Retry Mechanism**: Built-in retry logic for handling network issues
- **Store Filtering**: Filter results by specific stores (e.g., "By Crowd Shopper")

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime) - version 1.0.0 or higher

## Installation

1. **Download and Extract**:

   - Download the project zip file
   - Extract the contents to your preferred directory

2. Install Bun (if not already installed):

   - Windows (PowerShell):
     ```powershell
     irm https://bun.sh/install.ps1 | iex
     ```
   - macOS/Linux:
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```

3. Install project dependencies:
   ```bash
   bun install
   ```

## Configuration

Edit the `config.ts` file to customize the following settings:

- `SEARCH_TEARMS_PATH`: Path to the text file (**must be a `.txt` file**) containing search terms (default: "search_terms.txt")
- `INTERESTED_STORES`: Array of store names to filter results by (default: ["By Crowd Shopper"])
- `OUTPUT_PATH`: Path where the output CSV will be saved (default: "output_product.csv")
- `RETRY_LIMIT`: Number of retry attempts for failed requests (default: 3)
- `RETRY_DELAY`: Delay between retry attempts in milliseconds (default: 1000)

## Usage

1. Add your search terms to `search_terms.txt`, one per line
2. Run the scraper:
   ```bash
   bun run index.ts
   ```
3. The script will:
   - Open a browser window
   - Process each search term
   - Save the results to the specified output file

## File Structure

- `index.ts`: Main application entry point
- `config.ts`: Configuration settings
- `utils.ts`: Utility functions
- `search_terms.txt`: Input file containing search terms (one per line)
- `template.csv`: Template for the output CSV structure

## Output Format

The scraper generates a CSV file with the following columns:

- ProductName
- ByStore
- StoreLink
- storeName
