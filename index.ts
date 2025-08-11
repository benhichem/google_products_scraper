import { connect } from "puppeteer-real-browser";
import { jsonToCsv, readSearchTerms, updateSearchTerms } from "./utils";
import config from "./config";
import { sleep } from "bun";

async function createBrowserInstance() {
  try {
    const { page, browser } = await connect({
      headless: false,
      args: [],
      customConfig: {},
      turnstile: true,
      connectOption: {},
      ignoreAllFlags: false,
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    return { page, browser };
  } catch (error) {
    throw new Error(`Failed to create browser instance: ${error}`);
  }
}

async function main() {
  let Results: Set<any> = new Set();
  try {
    console.log("Loading Search Terms ...");
    const LoadingSearchTerms = await readSearchTerms();

    if (LoadingSearchTerms.length === 0 || LoadingSearchTerms === undefined) {
      console.log("No search terms found. Please check the file.");
      return;
    }
    console.log("Search Terms Loaded:", LoadingSearchTerms);

    const { page, browser } = await createBrowserInstance();
    console.log("Browser instance created successfully");
    await page.goto("https://www.google.com", {
      timeout: 0,
      waitUntil: "networkidle2",
    });

    // Perform actions with the page
    await page.goto("https://www.google.com", {
      timeout: 0,
      waitUntil: "networkidle2",
    });

    await page.evaluate(() => {
      let btn = Array.from(document.querySelectorAll("button")).filter((item) =>
        item.innerText.includes("Reject all")
      );
      btn[0]?.click();
      console.log("Cookies consent rejected");
    });

    await sleep(1000); // Wait for a second to ensure the page is fully loaded
    let Retry_Delay = config.RETRY_DELAY;
    let Max_Retry = config.RETRY_LIMIT;
    let Max_Retry_Terms = 3;

    for (var i = 1; i < LoadingSearchTerms.length; i++) {
      console.log(`MAX RETRY: ${Max_Retry} `);
      try {
        const term = LoadingSearchTerms[i];
        if (typeof term !== "string") break;
        await page.goto("https://www.google.com", {
          timeout: 0,
          waitUntil: "networkidle2",
        });

        await page.waitForSelector("textarea", { visible: true });
        console.log("Page loaded");
        await page.type("textarea", term, {
          delay: 100,
        });
        await page.keyboard.press("Enter", { delay: 25 });
        console.log(`Searching for: ${term}`);
        await page.waitForNavigation({ waitUntil: "networkidle2" }).catch();
        console.log(`Search completed for: ${term}`);

        const Products = await page.evaluate((stores) => {
          const products: Array<any> = [];
          let carousell = document.querySelector("g-scrolling-carousel");
          if (!carousell) return products;
          let thing = Array.from(
            carousell.querySelectorAll("div.pla-unit")
          ).forEach((item) => {
            let hrefs = Array.from(item.querySelectorAll("a"));
            let ele: HTMLElement | undefined;
            hrefs.map((item2) => {
              if (item2.innerText.includes("By")) ele = item2;
            });

            if (ele !== undefined) {
              let ByText = (ele as HTMLElement).innerText;
              let IsStoreInTheList = stores.includes(ByText);
              if (IsStoreInTheList) {
                let pla_text = (item as HTMLElement).innerText;

                if (pla_text !== "") {
                  let arrayText = pla_text.split("\n");
                  let ProductName = arrayText[0]?.includes("Collect")
                    ? arrayText[1]
                    : arrayText[0];
                  let ByStore = arrayText[arrayText.length - 1];
                  let storeName = Array.from(
                    item.querySelectorAll("span")
                  ).filter((item) =>
                    item.attributes
                      .getNamedItem("aria-label")
                      ?.value.includes("From")
                  )[0]?.innerText;
                  let Store_link_element = Array.from(
                    item
                      .querySelector("div.pla-unit-title")
                      ?.querySelectorAll("a")!
                  ).filter((item) => item.href.startsWith("/") === false);
                  console.log(Store_link_element);
                  const StoreLink = Store_link_element[1]?.href;
                  products.push({
                    ProductName,
                    ByStore,
                    StoreLink,
                    storeName,
                  });
                }
              }
            }
          });

          return products;
        }, config.INTERESTED_STORES);
        console.log(`Found ${Products.length} products for term: ${term}`);

        Products.map((item) => Results.add(item));
        console.log(`Total Results so far: ${Results.size} products found`);

        // Remove the processed term from the search terms file
        try {
          await updateSearchTerms(term);
          console.log(`Removed processed term from search terms file: ${term}`);
        } catch (error) {
          console.error(`Failed to update search terms file: ${error}`);
          // Continue with the next term even if update fails
        }
      } catch (err) {
        console.log(console.error(`Error navigating to Google: ${err}`));
        if (Max_Retry > 0) {
          console.log(`Retrying in ${Retry_Delay}ms...`);
          await sleep(Retry_Delay);
          Max_Retry--;
          i--; // Decrement i to retry the same term
        } else {
          console.log("Max retries reached. Moving to the next term.");
          Max_Retry = config.RETRY_LIMIT; // Reset retry count for the next term
          Max_Retry_Terms--;
          if (Max_Retry_Terms <= 0) {
            console.log("Max retry terms reached. Exiting.");
            break;
          }
          continue;
        }
      }
    }
    // Close the browser when done
    await browser.close();
    console.log("Browser closed");
  } catch (error) {
    console.error(error);
  } finally {
    if (Results.size > 0) {
      console.log("Results found:", Results);
      // Here you can write the results to a file or process them further
      let string = jsonToCsv(Array.from(Results));
      await Bun.write(config.OUTPUT_PATH, string);
    } else {
      console.log("No results found.");
    }
  }
}

main();
