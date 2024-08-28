// import express from "express";
import runAudits from "./func/runAudits.js";
import addSheet from "./func/writeToSpreadsheet.js";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 4000;

import { google } from "googleapis";
import "dotenv/config";
import getColumnValues from "./func/readFromSpreadSheet.js";
import getAllSheetNames from "./func/getAllSheetNames.js";
const clientEmail = process.env.clientEmail;
const privateKey = process.env.privateKey.replace(/\\n/g, "\n");
const googleSheetId = process.env.googleSheetId;

const googleAuth = new google.auth.JWT(
  clientEmail,
  null,
  privateKey.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);
app.use(express.json());
const urls = [
  "https://harness.io/",
  "https://www.harness.io/customers",
  "https://www.harness.io/pricing",
  "https://www.harness.io/blog",
  "https://www.harness.io/products/platform",
  "https://www.harness.io/products/continuous-delivery",
  "https://www.harness.io/products/continuous-integration",
  "https://www.harness.io/products/feature-flags",
  "https://www.harness.io/products/infrastructure-as-code-management",
  "https://www.harness.io/products/chaos-engineering",
  "https://www.harness.io/products/service-reliability-management",
  "https://www.harness.io/products/internal-developer-portal",
  "https://www.harness.io/products/code-repository",
  "https://www.harness.io/products/software-engineering-insights",
  "https://www.harness.io/products/software-supply-chain-assurance",
  "https://www.harness.io/products/security-testing-orchestration",
  "https://www.harness.io/products/cloud-cost-management",
  "https://www.harness.io/comparison-guide",
  "https://www.harness.io/learn/resource-center",
  "https://www.harness.io/harness-devops-academy",
  "https://www.harness.io/support",
  "https://www.harness.io/events",
  "https://www.harness.io/solutions/devops",
  "https://www.harness.io/solutions/secure-software-delivery",
  "https://www.harness.io/solutions/finops-excellence",
  "https://www.harness.io/solutions/engineering-excellence",
  "https://www.harness.io/webinars/harness-101",
  "https://www.harness.io/company/contact-sales",
  "https://www.harness.io/company/about-us",
  "https://www.harness.io/company/careers",
  "https://www.harness.io/company/jobs",
  "https://www.harness.io/security",
  "https://www.harness.io/company/press-and-news",
  "https://www.harness.io/legal/subscription-terms",
  "https://www.harness.io/company/partners",
  "https://www.harness.io/event/dev-ops-summit",
  "https://www.harness.io/event/developer-experience-summit",
  "https://www.harness.io/state-of-developer-experience",
  "https://www.harness.io/blog/introducing-harness-feature-flags",
];
app.use(express.static(path.join(__dirname, "views")));
app.get("/", function (req, res) {
  const htmlFilePath = path.join(__dirname, "views/index.html");
  res.sendFile(htmlFilePath);
});

app.get("/generate-report", async (req, res) => {
  try {
    async function main() {
      const response = await runAudits(urls);
      return response;
    }
    main().then(async (response) => {
      const titleRow = [
        "No.",
        "Path",
        "Performance",
        "Accessibility",
        "Best Practices",
        "SEO",
        "First Meaningful Paint (s)",
        "First Contentful Paint (s)",
        "Largest Contentful Paint (s)",
        "Total Blocking Time (ms)",
        "Cumulative Layout Shift",
        "Speed Index (s)",
      ];

      let currentDate = new Date();
      let options = { month: "long", day: "numeric", year: "numeric" };
      let formattedDate = currentDate.toLocaleDateString("en-US", options);
      await addSheet(
        googleAuth,
        googleSheetId,
        formattedDate,
        titleRow,
        response
      );

      res.setHeader("Content-Type", "text/html");
      res.status(200).json({ msg: "Success !" });
    });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
});

app.post("/get-values", async (req, res) => {
  try {
    const sheetTitle = req.body.sheetTitle;

    console.log(req.body);
    const response = await getColumnValues(
      googleAuth,
      googleSheetId,
      sheetTitle
    );
    res.status(200).json({ msg: "Success !", data: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
});
app.get("/get-sheet-names", async (req, res) => {
  try {
    const response = await getAllSheetNames(googleAuth, googleSheetId);
    res.status(200).json({ msg: "Success !", data: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Something went wrong" });
  }
});

app.get("/get-avg-score-from-all-sheets", async (req, res) => {
  let sheetNameAndAvgValues = [];

  const sheetList = await getAllSheetNames(googleAuth, googleSheetId);

  for (let i = 0; i < sheetList.length; i++) {
    const response = await getColumnValues(
      googleAuth,
      googleSheetId,
      sheetList[i]
    );

    sheetNameAndAvgValues.push({ title: sheetList[i], values: response });
  }
  res.status(200).json({ msg: "Success !", data: sheetNameAndAvgValues });
});

async function scheduleEndpointCall() {
  console.log("Called");
  try {
    async function main() {
      const response = await runAudits(urls);
      return response;
    }
    main().then(async (response) => {
      const titleRow = [
        "No.",
        "Path",
        "Performance",
        "Accessibility",
        "Best Practices",
        "SEO",
        "First Meaningful Paint (s)",
        "First Contentful Paint (s)",
        "Largest Contentful Paint (s)",
        "Total Blocking Time (ms)",
        "Cumulative Layout Shift",
        "Speed Index (s)",
      ];

      let currentDate = new Date();
      let options = { month: "long", day: "numeric", year: "numeric" };
      let formattedDate = currentDate.toLocaleDateString("en-US", options);
      await addSheet(
        googleAuth,
        googleSheetId,
        formattedDate,
        titleRow,
        response
      );
    });
  } catch (error) {
    console.log(error);
  }
}
setInterval(scheduleEndpointCall, 360000);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
