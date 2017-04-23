var colors = ['#FF5733', '#FFDB33', '#BDFF33', '#3EFF33', '#33FFA8', '#33AFFF', '#8E33FF', '#FF7833','#F033FF', '#FF338E', '#FF3366']

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
                    backgroundColor: colors,
                    borderColor: colors,
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
function drawPie(div, url, options) {
    options = options || { label: 'Chưa có tiêu đề' };
    $.getJSON(url, displayData);
    var labels = [], datas = [];
    function displayData(response) {
        var backgroundColors = [];
        for (var i = 0; i < response.length; i++) {
            labels[i] = response[i].Label, datas[i] = response[i].Data;
            //backgroundColors.push(getRandomColor());
        }
        var data = {
            labels: labels,
            datasets: [
                {
                    label: options.label,
                    data: datas,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors
                }]
        };

        // For a pie chart
        var myPieChart = new Chart(div, {
            type: 'pie',
            data: data,
            options: {
                animation: {
                    animateScale: true
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            //get the concerned dataset
                            var dataset = data.datasets[tooltipItem.datasetIndex];
                            //calculate the total of this data set
                            var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
                                return previousValue + currentValue;
                            });
                            //get the current items value
                            var currentValue = dataset.data[tooltipItem.index];
                            //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
                            var precentage = Math.floor(((currentValue / total) * 100) + 0.5);

                            return data.labels[tooltipItem.index] + ': ' + precentage + "%";
                        }
                    }
                }
            }
        });
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}