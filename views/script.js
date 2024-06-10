const auditParams1 = ["Performance", "Accessibility", "Best Practices", "SEO"];
const auditParams2 = [
  "First Meaningful Paint (s)",
  "First Contentful Paint (s)",
  "Largest Contentful Paint (s)",
  "Total Blocking Time (s)",
  "Cumulative Layout Shift",
  "Speed Index (s)",
];
const auditParams = [
  "Performance",
  "Accessibility",
  "Best Practices",
  "SEO",
  "First Meaningful Paint (s)",
  "First Contentful Paint (s)",
  "Largest Contentful Paint (s)",
  "Total Blocking Time (s)",
  "Cumulative Layout Shift",
  "Speed Index (s)",
];

async function main() {
  document
    .getElementById("generate-report")
    .addEventListener("click", generateReport);
  getAvgValues();
}

async function generateReport() {
  try {
    document.getElementById("generate-report").style.display = "none";
    document.getElementById("generating").style.display = "block";
    const response = await fetch("/generate-report");
    console.log(response);
  } catch (error) {
    console.error("Error generating report:", error);
  } finally {
    document.getElementById("generate-report").style.display = "block";
    document.getElementById("generating").style.display = "none";
  }
}

async function getAvgValues() {
  try {
    const response = await fetch("/get-avg-score-from-all-sheets");
    let data = await response.json();

    auditParams.forEach((params, index) => {
      const chartDiv = document.createElement("div");
      document.querySelector(".chart-section").appendChild(chartDiv);
      const title = document.createElement("h2");
      chartDiv.appendChild(title);
      const canvasDiv = document.createElement("div");
      chartDiv.appendChild(canvasDiv);
      canvasDiv.classList.add("charts");
      title.innerText = params;
      const auditValues = [];
      const xLabel = [];
      const yAxisLabel = index > 3 ? "Time (s)" : "Score";
      data.data.forEach((data) => {
        xLabel.push(data.title);

        auditValues.push(data.values[index]);
      });

      DrawChart(auditValues, xLabel, `lighthouse`, yAxisLabel, canvasDiv);
    });
  } catch (error) {
    console.error("Error getting average values:", error);
    // Handle error
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function DrawChart(data, xValues, canvasId, yAxisLabel, chartDiv) {
  try {
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;

    chartDiv.appendChild(canvas);
    new Chart(canvas, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [
          {
            backgroundColor: "rgb(75, 192, 192)",
            data: data,
            barThickness: 50,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
            pointRadius: 5,
            pointHoverRadius: 10,
            pointBackgroundColor: "green",
            pointHitRadius: 20,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
              color: "green",
              font: {
                weight: "bold",
                size: 16,
              },
            },
            ticks: {
              font: {
                weight: "bold",
                size: 12,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: yAxisLabel,
              color: "green",
              font: {
                weight: "bold",
                size: 16,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
            labels: {
              font: {
                size: 16,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.parsed.y;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error drawing chart:", error);
    // Handle error
  }
}

main();
