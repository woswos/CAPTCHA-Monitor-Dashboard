// The URL for the API endpoint
let api_url = '/api/graphs'

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

function random_rgba() {
    var o = Math.round,
        r = Math.random,
        s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + r().toFixed(1) + ')';
}

// The structure for holding the datasets for the graphs
// Each dataset represents a line/bar on the graph
function dataset(label, borderColor, data, fill = false, lineTension = 0.3) {
    this.label = label;
    this.borderColor = borderColor;
    this.data = data;
    this.fill = fill;
    this.lineTension = lineTension;
    this.pointRadius = 4;
    this.pointHoverRadius = 6;
    this.backgroundColor = borderColor;
    //this.borderDash = [10,5];
}

// Fetch the graph data from the API
const tbb_security_levels = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/tbb_security_levels');
    let api = await response.json();
    createGraph('tbb_security_levels_by_is_captcha_found', api, 'line')
})();

const tbb_versions = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/tbb_versions');
    let api = await response.json();
    createGraph('tbb_versions_by_is_captcha_found', api, 'line')
})();

const web_browser_type = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/web_browser_type');
    let api = await response.json();
    createGraph('web_browser_type_by_is_captcha_found', api, 'line')
})();

const http_vs_https = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/http_vs_https');
    let api = await response.json();
    createGraph('http_vs_https_by_is_captcha_found', api, 'line')
})();

const ip_versions = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/ip_versions');
    let api = await response.json();
    createGraph('ip_versions_by_is_captcha_found', api, 'line')
})();

const single_vs_multiple_http_reqs = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/single_vs_multiple_http_reqs');
    let api = await response.json();
    createGraph('single_vs_multiple_http_reqs_by_is_captcha_found', api, 'line')
})();

const country = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/country');
    let api = await response.json();
    createGraph('country_by_is_captcha_found', api, 'pie', 'right')
})();

const continent = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/continent');
    let api = await response.json();
    createGraph('continent_by_is_captcha_found', api, 'pie')
})();

// Expands the data received from the API
function createGraph(graph_name, api, plot_type, legend_position = 'bottom') {
    // Get labels of the x axis
    let x_axis_labels = api.results.labels;

    let i = 0;
    // Get the nth color in the dictionary
    // console.log(Object.values(colors[i])[0])
    let internal_dataset = []
    if (plot_type == 'line') {
        for (const [key, value] of Object.entries(api.results.data)) {
            try {
                internal_dataset.push(new dataset(key, Object.values(colors[i])[0], value))

            } catch (error) {
                // Produce new colors since we ran out of predefined colors
                internal_dataset.push(new dataset(key, random_rgba(), value))

            }

            i++;
        }
    } else if (plot_type == 'pie') {
        let background_color = []
        for (const [key, value] of Object.entries(api.results.data)) {
            internal_dataset.push(value)
        }

        internal_dataset = [{
            data: internal_dataset
        }]
    }

    // Graph name needs to be the same as the html id
    switch (plot_type) {
        case 'line':
            createLinePlot(graph_name, x_axis_labels, internal_dataset, legend_position);
            break;
        case 'pie':
            createPiePlot(graph_name, x_axis_labels, internal_dataset, legend_position);
            break;
        default:
            createLinePlot(graph_name, x_axis_labels, internal_dataset, legend_position);
    }

    // Remove the loading icon
    document.getElementById('loading-icon-' + graph_name).remove();
    //document.querySelectorAll('loading-icon').forEach(el => el.remove());
}

// Finally places all variables into the chartjs code
function createPiePlot(elementId, x_axis_labels, datasets, legend_position) {
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
            maintainAspectRatio: false,
            animation: {
                animateRotate: false
            },
            legend: {
                display: true,
                position: legend_position,
                labels: {
                    usePointStyle: true,
                    boxWidth: 5,
                    fontSize: 15
                }
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) {
                        return x_axis_labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + ' CAPTCHAs';
                    }
                }
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.ClassicCyclic13'
                },
                labels: {
                    render: function (args) {
                        return isoCodes[args.label] + ' ' + args.percentage + '%';
                    },
                    fontColor: '#fff',
                    overlap: false,
                    fontSize: 15,
                    fontStyle: 'bold'
                },
            }
        }
    });

    return chart;
}

// Finally places all variables into the chartjs code
function createLinePlot(elementId, x_axis_labels, datasets, legend_position) {
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
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: true,
                        minRotation: 30,
                        fontSize: 15,
                        minor: {
                            fontSize: 15
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        fontSize: 15,
                        minor: {
                            fontSize: 15
                        },
                        beginAtZero : true,
                        callback : function(value, index, values){
                            yAxesticks = values;
                            return value;
                        }
                    }
                }]
            },
            legend: {
                display: true,
                position: legend_position,
                labels: {
                    usePointStyle: true,
                    boxWidth: 5,
                    fontSize: 15
                }
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) {
                        return data.datasets[tooltipItems.datasetIndex].label + ': ' + tooltipItems.yLabel + '%';
                    }
                }
            },
            plugins: {
                colorschemes: false,
                labels: false
            },
            onClick: function(evt) {
                // var element = chart.getElementAtEvent(evt);
                // if (element.length > 0) {
                //     var ind = element[0]._index;
                //     if (confirm('Do you want to remove this point?')) {
                //         data.datasets[0].data.splice(ind, 1);
                //         data.labels.splice(ind, 1);
                //         chart.update(data);
                //     }
                // }

                // var firstPoint = chart.getElementAtEvent(evt)[0];

                // if (firstPoint) {
                //     var label = x_axis_labels[firstPoint._index];
                //     var value = datasets[firstPoint._datasetIndex].data[firstPoint._index];
                //     console.log(elementId, label, value);
                // }
            }
        }
    });

    // If the max y value exceeds 100, limit it to 100
    if(yAxesticks[0] > 100){
        chart.options.scales.yAxes[0].ticks.max = 100
        chart.update()
    }

    return chart;
}

// var isoContinents = {
//
// }

var isoCodes = {
    'Africa' : 'AF',
    'Antarctica' : 'AN',
    'Asia' : 'AS',
    'Europe' : 'EU',
    'North America' : 'NA',
    'Oceania' : 'OC',
    'South America' : 'SA',

    'Afghanistan' : 'AF',
    'Aland Islands' : 'AX',
    'Albania' : 'AL',
    'Algeria' : 'DZ',
    'American Samoa' : 'AS',
    'Andorra' : 'AD',
    'Angola' : 'AO',
    'Anguilla' : 'AI',
    'Antarctica' : 'AQ',
    'Antigua And Barbuda' : 'AG',
    'Argentina' : 'AR',
    'Armenia' : 'AM',
    'Aruba' : 'AW',
    'Australia' : 'AU',
    'Austria' : 'AT',
    'Azerbaijan' : 'AZ',
    'Bahamas' : 'BS',
    'Bahrain' : 'BH',
    'Bangladesh' : 'BD',
    'Barbados' : 'BB',
    'Belarus' : 'BY',
    'Belgium' : 'BE',
    'Belize' : 'BZ',
    'Benin' : 'BJ',
    'Bermuda' : 'BM',
    'Bhutan' : 'BT',
    'Bolivia' : 'BO',
    'Bosnia And Herzegovina' : 'BA',
    'Botswana' : 'BW',
    'Bouvet Island' : 'BV',
    'Brazil' : 'BR',
    'British Indian Ocean Territory' : 'IO',
    'Brunei Darussalam' : 'BN',
    'Bulgaria' : 'BG',
    'Burkina Faso' : 'BF',
    'Burundi' : 'BI',
    'Cambodia' : 'KH',
    'Cameroon' : 'CM',
    'Canada' : 'CA',
    'Cape Verde' : 'CV',
    'Cayman Islands' : 'KY',
    'Central African Republic' : 'CF',
    'Chad' : 'TD',
    'Chile' : 'CL',
    'China' : 'CN',
    'Christmas Island' : 'CX',
    'Cocos (Keeling) Islands' : 'CC',
    'Colombia' : 'CO',
    'Comoros' : 'KM',
    'Congo' : 'CG',
    'Congo, Democratic Republic' : 'CD',
    'Cook Islands' : 'CK',
    'Costa Rica' : 'CR',
    'Cote D\'Ivoire' : 'CI',
    'Croatia' : 'HR',
    'Cuba' : 'CU',
    'Cyprus' : 'CY',
    'Czech Republic' : 'CZ',
    'Denmark' : 'DK',
    'Djibouti' : 'DJ',
    'Dominica' : 'DM',
    'Dominican Republic' : 'DO',
    'Ecuador' : 'EC',
    'Egypt' : 'EG',
    'El Salvador' : 'SV',
    'Equatorial Guinea' : 'GQ',
    'Eritrea' : 'ER',
    'Estonia' : 'EE',
    'Ethiopia' : 'ET',
    'Falkland Islands (Malvinas)' : 'FK',
    'Faroe Islands' : 'FO',
    'Fiji' : 'FJ',
    'Finland' : 'FI',
    'France' : 'FR',
    'French Guiana' : 'GF',
    'French Polynesia' : 'PF',
    'French Southern Territories' : 'TF',
    'Gabon' : 'GA',
    'Gambia' : 'GM',
    'Georgia' : 'GE',
    'Germany' : 'DE',
    'Ghana' : 'GH',
    'Gibraltar' : 'GI',
    'Greece' : 'GR',
    'Greenland' : 'GL',
    'Grenada' : 'GD',
    'Guadeloupe' : 'GP',
    'Guam' : 'GU',
    'Guatemala' : 'GT',
    'Guernsey' : 'GG',
    'Guinea' : 'GN',
    'Guinea-Bissau' : 'GW',
    'Guyana' : 'GY',
    'Haiti' : 'HT',
    'Heard Island & Mcdonald Islands' : 'HM',
    'Holy See (Vatican City State)' : 'VA',
    'Honduras' : 'HN',
    'Hong Kong' : 'HK',
    'Hungary' : 'HU',
    'Iceland' : 'IS',
    'India' : 'IN',
    'Indonesia' : 'ID',
    'Iran, Islamic Republic Of' : 'IR',
    'Iraq' : 'IQ',
    'Ireland' : 'IE',
    'Isle Of Man' : 'IM',
    'Israel' : 'IL',
    'Italy' : 'IT',
    'Jamaica' : 'JM',
    'Japan' : 'JP',
    'Jersey' : 'JE',
    'Jordan' : 'JO',
    'Kazakhstan' : 'KZ',
    'Kenya' : 'KE',
    'Kiribati' : 'KI',
    'Korea' : 'KR',
    'Kuwait' : 'KW',
    'Kyrgyzstan' : 'KG',
    'Lao People\'s Democratic Republic' : 'LA',
    'Latvia' : 'LV',
    'Lebanon' : 'LB',
    'Lesotho' : 'LS',
    'Liberia' : 'LR',
    'Libyan Arab Jamahiriya' : 'LY',
    'Liechtenstein' : 'LI',
    'Lithuania' : 'LT',
    'Luxembourg' : 'LU',
    'Macao' : 'MO',
    'Macedonia' : 'MK',
    'Madagascar' : 'MG',
    'Malawi' : 'MW',
    'Malaysia' : 'MY',
    'Maldives' : 'MV',
    'Mali' : 'ML',
    'Malta' : 'MT',
    'Marshall Islands' : 'MH',
    'Martinique' : 'MQ',
    'Mauritania' : 'MR',
    'Mauritius' : 'MU',
    'Mayotte' : 'YT',
    'Mexico' : 'MX',
    'Micronesia, Federated States Of' : 'FM',
    'Moldova' : 'MD',
    'Monaco' : 'MC',
    'Mongolia' : 'MN',
    'Montenegro' : 'ME',
    'Montserrat' : 'MS',
    'Morocco' : 'MA',
    'Mozambique' : 'MZ',
    'Myanmar' : 'MM',
    'Namibia' : 'NA',
    'Nauru' : 'NR',
    'Nepal' : 'NP',
    'Netherlands' : 'NL',
    'Netherlands Antilles' : 'AN',
    'New Caledonia' : 'NC',
    'New Zealand' : 'NZ',
    'Nicaragua' : 'NI',
    'Niger' : 'NE',
    'Nigeria' : 'NG',
    'Niue' : 'NU',
    'Norfolk Island' : 'NF',
    'Northern Mariana Islands' : 'MP',
    'Norway' : 'NO',
    'Oman' : 'OM',
    'Pakistan' : 'PK',
    'Palau' : 'PW',
    'Palestinian Territory, Occupied' : 'PS',
    'Panama' : 'PA',
    'Papua New Guinea' : 'PG',
    'Paraguay' : 'PY',
    'Peru' : 'PE',
    'Philippines' : 'PH',
    'Pitcairn' : 'PN',
    'Poland' : 'PL',
    'Portugal' : 'PT',
    'Puerto Rico' : 'PR',
    'Qatar' : 'QA',
    'Reunion' : 'RE',
    'Romania' : 'RO',
    'Russian Federation' : 'RU',
    'Rwanda' : 'RW',
    'Saint Barthelemy' : 'BL',
    'Saint Helena' : 'SH',
    'Saint Kitts And Nevis' : 'KN',
    'Saint Lucia' : 'LC',
    'Saint Martin' : 'MF',
    'Saint Pierre And Miquelon' : 'PM',
    'Saint Vincent And Grenadines' : 'VC',
    'Samoa' : 'WS',
    'San Marino' : 'SM',
    'Sao Tome And Principe' : 'ST',
    'Saudi Arabia' : 'SA',
    'Senegal' : 'SN',
    'Serbia' : 'RS',
    'Seychelles' : 'SC',
    'Sierra Leone' : 'SL',
    'Singapore' : 'SG',
    'Slovakia' : 'SK',
    'Slovenia' : 'SI',
    'Solomon Islands' : 'SB',
    'Somalia' : 'SO',
    'South Africa' : 'ZA',
    'South Georgia And Sandwich Isl.' : 'GS',
    'Spain' : 'ES',
    'Sri Lanka' : 'LK',
    'Sudan' : 'SD',
    'Suriname' : 'SR',
    'Svalbard And Jan Mayen' : 'SJ',
    'Swaziland' : 'SZ',
    'Sweden' : 'SE',
    'Switzerland' : 'CH',
    'Syrian Arab Republic' : 'SY',
    'Taiwan' : 'TW',
    'Tajikistan' : 'TJ',
    'Tanzania' : 'TZ',
    'Thailand' : 'TH',
    'Timor-Leste' : 'TL',
    'Togo' : 'TG',
    'Tokelau' : 'TK',
    'Tonga' : 'TO',
    'Trinidad And Tobago' : 'TT',
    'Tunisia' : 'TN',
    'Turkey' : 'TR',
    'Turkmenistan' : 'TM',
    'Turks And Caicos Islands' : 'TC',
    'Tuvalu' : 'TV',
    'Uganda' : 'UG',
    'Ukraine' : 'UA',
    'United Arab Emirates' : 'AE',
    'United Kingdom' : 'GB',
    'United States' : 'US',
    'United States Outlying Islands' : 'UM',
    'Uruguay' : 'UY',
    'Uzbekistan' : 'UZ',
    'Vanuatu' : 'VU',
    'Venezuela' : 'VE',
    'Viet Nam' : 'VN',
    'Virgin Islands, British' : 'VG',
    'Virgin Islands, U.S.' : 'VI',
    'Wallis And Futuna' : 'WF',
    'Western Sahara' : 'EH',
    'Yemen' : 'YE',
    'Zambia' : 'ZM',
    'Zimbabwe' : 'ZW'
};
