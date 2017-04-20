function drawBar(div, url, options) {
    options = options || { label: 'Chưa có tiêu đề' };
    $.getJSON(url, displayData);
    var labels = [], datas = [];
    function displayData(response) {
        console.log(response);
        for (var i = 0; i < response.length; i++) {
            labels[i] = response[i].Label, datas[i] = response[i].Data;
        }
        var myChart = new Chart(div, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: options.label,
                    data: datas,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
}