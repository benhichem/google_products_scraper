import { connect } from "puppeteer-real-browser";
import { readSearchTerms } from "./utils";
import config from "./config";

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

    return { page, browser };
  } catch (error) {
    throw new Error(`Failed to create browser instance: ${error}`);
  }
}

async function main() {
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
    // Perform actions with the page

    for (var i = 1; i < LoadingSearchTerms.length; i++) {
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
              /*    let IsStoreInTheList = stores.map((store) => {
                if(store.includes(ByText)){
                    
                }
              }); */
              let IsStoreInTheList = stores.includes(ByText);
              if (IsStoreInTheList) {
                let pla_text = (item as HTMLElement).innerText;
                if (pla_text !== "") {
                  let arrayText = pla_text.split("\n");
                  let ProductName = arrayText[0]?.includes("Collect")
                    ? arrayText[1]
                    : arrayText[0];
                  let ByStore = arrayText[arrayText.length - 1];
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
                  });
                }
              }
            }
          });

          return products;
        }, config.INTERESTED_STORES);
        console.log(Products);
      } catch (err) {
        console.log(console.error(`Error navigating to Google: ${err}`));
      }
    }
    // Close the browser when done
    await browser.close();
    console.log("Browser closed");
  } catch (error) {
    console.error(error);
  }
}

main();
