// Document when ready, fetch chart data.
$(function () {
    fetch('/getChartData', {
        method: 'put',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'overall'
        })
    }).then(res => {
        if (res.ok) return res.json();
    }).then(response => {
        new Chart($("#insights-chart-line"), {
            type: 'line',
            data: {
                labels: response.lineGraph.dates,
                datasets: [{
                    data: response.lineGraph.revenue,
                    label: "Revenue",
                    borderColor: "#02c39a",
                    fill: false
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Overall revenue by dollar ($CAD)'
                }
            }
        });

        new Chart($("#insights-chart-pie"), {
            type: 'pie',
            data: {
              labels: response.pieGraph.categories,
              datasets: [{
                backgroundColor: ["#02c39a", "#3e95cd", "#8e5ea2", "#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
                data: response.pieGraph.values
              }]
            },
            options: {
              title: {
                display: true,
                text: 'Number of sales by category'
              }
            }
        });    
    })
});