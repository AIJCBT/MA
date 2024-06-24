//CHART SCRIPT FROM https://www.chartjs.org/docs/latest/getting-started/-->
// Create a bar chart using Chart.js
const getChartData = (avwomen, avmen) => {
    const chartData = {
        labels: ['Men', 'Women'],
        datasets: [{
            label: ['Calories Men', 'Calories Women'],
            data: [avwomen, avmen],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }]
    };
    console.log(avmen, avwomen, "done")
    return chartData;
};
const getChartOptions = () => {
    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };
    console.log("getchartoptions done")
    return chartOptions;
};

const getChartScript = (chartData, chartOptions) => { console.log("get chart script is being done")
    return `<script>
const ctx = document.getElementById('myChart');
const profileChart = new Chart(ctx, {
    type: 'bar',
    data: ${JSON.stringify(chartData)},
    options: ${JSON.stringify(chartOptions)}
});
</script>`};

module.exports = { getChartData, getChartOptions, getChartScript };
