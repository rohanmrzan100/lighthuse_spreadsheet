import puppeteer from "puppeteer";
import getLightHouseResult from "./getLightHouseResult.js";
export default async function runAudits(urls) {
  const browser = await puppeteer.launch({
    // executablePath: "/usr/bin/chromium-browser",
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox"],
  });

  let result = [];
  const browserWSEndpoint = browser.wsEndpoint();
  const { port } = new URL(browserWSEndpoint);
  try {
    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await getLightHouseResult(urls[i], parseInt(port), i + 1);
        result.push(res);

        console.log("Completed " + i + " urls");
      } catch (error) {
        console.error(`Error processing URL: ${urls[i]}`, error);
      }
    }
  } catch (error) {
    console.error("Error during audits:", error);
  } finally {
    await browser.close();
    return result;
  }
}
