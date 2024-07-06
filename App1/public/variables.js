//CHART SCRIPT FROM https://www.chartjs.org/docs/latest/getting-started/-->
// Create a bar chart using Chart.js
const getChartData = (avwomen, avmen) => {
    const chartData = {
        labels: ['Men', 'Women'],
        datasets: [{
            label: ['Calories'],
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
    return chartOptions;
};

const getChartScript = (chartData, chartOptions, avmen, avwomen, totmen, totwomen, varmen, varwomen) => { console.log("get chart Script")
    return `<script>
            const ctx = document.getElementById('myChart');
            const profileChart = new Chart(ctx, {
            type: 'bar',
            data: ${JSON.stringify(chartData)},
            options: ${JSON.stringify(chartOptions)}
            });
            document.getElementById('ratio').innerHTML = '${(avwomen/avmen).toFixed(4)*100}%'
            document.getElementById('totmen').innerHTML = ${totmen}
            document.getElementById('totwomen').innerHTML = ${totwomen}
            document.getElementById('varmen').innerHTML = ${varmen}
            document.getElementById('varwomen').innerHTML = ${varwomen}
            </script>
        `
};

module.exports = { getChartData, getChartOptions, getChartScript };
