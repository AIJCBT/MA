//Chart.js variables
//CHART SCRIPT FROM https://www.chartjs.org/docs/latest/getting-started/
// Create a bar chart using Chart.js
const getChartData = (actclass1, actclass2, actclass3, actclass4, actclass5, actclass6) => {
    const chartData = {
        labels: ["BMI <18.5", "BMI 18.5-24.9", "BMI 25-29.9", "BMI 30-34.9", "BMI 35-39.9", "BMI >40"], // Labels for each bar
        datasets: [{
            label: 'BMI Values',
            data: [actclass1, actclass2, actclass3, actclass4, actclass5, actclass6], // Array of BMI values
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false // Do not fill the area under the line
        }]
    };
    return chartData;
};

const getChartOptions = () => {
    const chartOptions = {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'BMI Categories'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'BMI Values'
                }
            }
        }
    };
    return chartOptions;
};

const getChartScript = (chartData, chartOptions) => {
    return `<script>
            const ctx = document.getElementById('myBarChart');
            const barChart = new Chart(ctx, {
            type: 'bar',
            data: ${JSON.stringify(chartData)},
            options: ${JSON.stringify(chartOptions)}
            });
            </script>
        `;
};

module.exports = { getChartData, getChartOptions, getChartScript };