import lighthouse from "lighthouse";
export default async function getLightHouseResult(url, port, index) {
  const flags = {
    logLevel: "info",
    port,
    // strategy: "desktop",
  };
  const config = {
    extends: "lighthouse:default",
    settings: {
      maxWaitForFcp: 15 * 1000,
      maxWaitForLoad: 35 * 1000,
      formFactor: "desktop",
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0, // 0 means unset
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
      },
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1.25,
        disabled: false,
      },
      emulatedUserAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      skipAudits: [
        // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
        "uses-http2",
        // There are always bf-cache failures when testing in headless. Reenable when headless can give us realistic bf-cache insights.
        "bf-cache",
      ],
    },
  };
  const runnerResult = await lighthouse(url, flags, config);

  if (runnerResult) {
    const { lhr } = runnerResult;
    const {
      performance,
      accessibility,
      "best-practices": bestPractices,
      seo,
    } = lhr.categories;
    const { audits } = lhr;

    console.log(performance.score * 100);
    return [
      index,
      url,
      performance.score * 100,
      accessibility.score * 100,
      bestPractices.score * 100,
      seo.score * 100,
      (audits["first-meaningful-paint"].numericValue / 1000).toFixed(1), // in seconds
      (audits["first-contentful-paint"].numericValue / 1000).toFixed(1), // in seconds
      (audits["largest-contentful-paint"].numericValue / 1000).toFixed(1), // in seconds
      (audits["total-blocking-time"].numericValue / 1000).toFixed(1), // in milliseconds
      audits["cumulative-layout-shift"].numericValue.toFixed(2), // typically a small decimal number
      (audits["speed-index"].numericValue / 1000).toFixed(1), // in seconds
    ];
  }
  return null;
}
