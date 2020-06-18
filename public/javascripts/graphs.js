// The URL for the API endpoint
let api_url = 'graphs'

// Colors to be used in the graphs
// The order of the colors is important
let colors = [{
        "blue": "rgba(54, 162, 235, 1)"
    },
    {
        "orange": "rgba(255, 159, 64, 1)"
    },
    {
        "red": "rgba(255, 99, 132, 1)"
    }
]

// The structure for holding the datasets for the graphs
// Each dataset represents a line/bar on the graph
function dataset(label, borderColor, data, fill = false, lineTension = 0.3) {
    this.label = label;
    this.borderColor = borderColor;
    this.data = data;
    this.fill = fill;
    this.lineTension = lineTension;
    //this.borderDash = [10,5];
}

// Fetch the graph data from the API
const graphs = (async () => {
    // Get data
    let response = await fetch(api_url);
    let api = await response.json();

    createGraph('tbb_security_levels', api, 'line')
    createGraph('http_vs_https', api)
    createGraph('single_vs_multiple_http_reqs', api, 'line')
    createGraph('ip_versions', api, 'line')

    createGraph('physical_location', api, 'pie')
})();

// Expands the data received from the API
function createGraph(graph_name, api, plot_type) {
    // Get labels of the x axis
    let x_axis_labels = api.results[graph_name].labels;

    let i = 0;
    // Get the nth color in the dictionary
    // console.log(Object.values(colors[i])[0])
    let internal_dataset = []
    for (const [key, value] of Object.entries(api.results[graph_name].data)) {
        internal_dataset.push(new dataset(key, Object.values(colors[i])[0], value))
        i++;
    }

    // Graph name needs to be the same as the html id
    switch (plot_type) {
        case 'line':
            createLinePlot(graph_name, x_axis_labels, internal_dataset);
            break;
        case 'pie':
            createPiePlot(graph_name, x_axis_labels, internal_dataset);
            break;
        default:
            createLinePlot(graph_name, x_axis_labels, internal_dataset);
    }

    // Remove the loading icon
    document.querySelectorAll(".loading-icon").forEach(el => el.remove());
}

// Finally places all variables into the chartjs code
function createPiePlot(elementId, x_axis_labels, datasets) {
    let ctx = document.getElementById(elementId).getContext('2d');
    let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'doughnut',

        // The data for our dataset
        data: {
            labels: x_axis_labels,
            datasets: datasets
        },

        // Configuration options go here
        options: {
            animation: {
                animateRotate: false
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 5
                }
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) {
                        return data.datasets[0].data[tooltipItems.index] + '%';
                    }
                }
            }
        }
    });

    return chart;
}

// Finally places all variables into the chartjs code
function createLinePlot(elementId, x_axis_labels, datasets) {
    let ctx = document.getElementById(elementId).getContext('2d');
    let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: x_axis_labels,
            datasets: datasets
        },

        // Configuration options go here
        options: {
            //responsive: true,
            //maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: false
                    }
                }]
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 5
                }
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) {
                        return data.datasets[0].data[tooltipItems.index] + '%';
                    }
                }
            }
        }
    });

    return chart;
}
