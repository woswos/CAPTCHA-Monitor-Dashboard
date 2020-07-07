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

function swap(json){
  var ret = {};
  for(var key in json){
    ret[json[key]] = key;
  }
  return ret;
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
    createGraph('country_by_is_captcha_found', api, 'pie')
})();

const continent = (async () => {
    // Get data
    let response = await fetch(api_url + '/is_captcha_found/continent');
    let api = await response.json();
    createGraph('continent_by_is_captcha_found', api, 'pie')
})();

// Expands the data received from the API
function createGraph(graph_name, api, plot_type) {
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
            createLinePlot(graph_name, x_axis_labels, internal_dataset);
            break;
        case 'pie':
            createPiePlot(graph_name, x_axis_labels, internal_dataset);
            break;
        default:
            createLinePlot(graph_name, x_axis_labels, internal_dataset);
    }

    // Remove the loading icon
    document.getElementById('loading-icon-' + graph_name).remove();
    //document.querySelectorAll('loading-icon').forEach(el => el.remove());
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
            maintainAspectRatio: false,
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
                        console.log(data.datasets)
                        console.log(tooltipItems)
                        console.log(x_axis_labels)
                        return x_axis_labels[tooltipItems.index] + ': ' + data.datasets[0].data[tooltipItems.index] + ' %';
                    }
                }
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.ClassicCyclic13'
                },
				datalabels: {
					backgroundColor: function(context) {
						return context.dataset.backgroundColor;
					},
					borderColor: 'white',
					borderRadius: 25,
					borderWidth: 2,
					color: 'white',
					display: function(context) {
						var dataset = context.dataset;
						var count = dataset.data.length;
						var value = dataset.data[context.dataIndex];
						return value > count * 1.5;
					},
					font: {
						weight: 'bold'
					},
                    formatter: function(value, context) {
                        if(elementId == 'country_by_is_captcha_found'){
                            return swap(isoCountries)[context.chart.data.labels[context.dataIndex]];
                        }else{
                            return swap(isoContinents)[context.chart.data.labels[context.dataIndex]];
                        }
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
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: false,
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
                position: 'bottom',
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
                datalabels: false
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

var isoContinents = {
    'AF' : 'Africa',
    'AN' : 'Antarctica',
    'AS' : 'Asia',
    'EU' : 'Europe',
    'NA' : 'North America',
    'OC' : 'Oceania',
    'SA' : 'South America'
}

var isoCountries = {
    'AF' : 'Afghanistan',
    'AX' : 'Aland Islands',
    'AL' : 'Albania',
    'DZ' : 'Algeria',
    'AS' : 'American Samoa',
    'AD' : 'Andorra',
    'AO' : 'Angola',
    'AI' : 'Anguilla',
    'AQ' : 'Antarctica',
    'AG' : 'Antigua And Barbuda',
    'AR' : 'Argentina',
    'AM' : 'Armenia',
    'AW' : 'Aruba',
    'AU' : 'Australia',
    'AT' : 'Austria',
    'AZ' : 'Azerbaijan',
    'BS' : 'Bahamas',
    'BH' : 'Bahrain',
    'BD' : 'Bangladesh',
    'BB' : 'Barbados',
    'BY' : 'Belarus',
    'BE' : 'Belgium',
    'BZ' : 'Belize',
    'BJ' : 'Benin',
    'BM' : 'Bermuda',
    'BT' : 'Bhutan',
    'BO' : 'Bolivia',
    'BA' : 'Bosnia And Herzegovina',
    'BW' : 'Botswana',
    'BV' : 'Bouvet Island',
    'BR' : 'Brazil',
    'IO' : 'British Indian Ocean Territory',
    'BN' : 'Brunei Darussalam',
    'BG' : 'Bulgaria',
    'BF' : 'Burkina Faso',
    'BI' : 'Burundi',
    'KH' : 'Cambodia',
    'CM' : 'Cameroon',
    'CA' : 'Canada',
    'CV' : 'Cape Verde',
    'KY' : 'Cayman Islands',
    'CF' : 'Central African Republic',
    'TD' : 'Chad',
    'CL' : 'Chile',
    'CN' : 'China',
    'CX' : 'Christmas Island',
    'CC' : 'Cocos (Keeling) Islands',
    'CO' : 'Colombia',
    'KM' : 'Comoros',
    'CG' : 'Congo',
    'CD' : 'Congo, Democratic Republic',
    'CK' : 'Cook Islands',
    'CR' : 'Costa Rica',
    'CI' : 'Cote D\'Ivoire',
    'HR' : 'Croatia',
    'CU' : 'Cuba',
    'CY' : 'Cyprus',
    'CZ' : 'Czech Republic',
    'DK' : 'Denmark',
    'DJ' : 'Djibouti',
    'DM' : 'Dominica',
    'DO' : 'Dominican Republic',
    'EC' : 'Ecuador',
    'EG' : 'Egypt',
    'SV' : 'El Salvador',
    'GQ' : 'Equatorial Guinea',
    'ER' : 'Eritrea',
    'EE' : 'Estonia',
    'ET' : 'Ethiopia',
    'FK' : 'Falkland Islands (Malvinas)',
    'FO' : 'Faroe Islands',
    'FJ' : 'Fiji',
    'FI' : 'Finland',
    'FR' : 'France',
    'GF' : 'French Guiana',
    'PF' : 'French Polynesia',
    'TF' : 'French Southern Territories',
    'GA' : 'Gabon',
    'GM' : 'Gambia',
    'GE' : 'Georgia',
    'DE' : 'Germany',
    'GH' : 'Ghana',
    'GI' : 'Gibraltar',
    'GR' : 'Greece',
    'GL' : 'Greenland',
    'GD' : 'Grenada',
    'GP' : 'Guadeloupe',
    'GU' : 'Guam',
    'GT' : 'Guatemala',
    'GG' : 'Guernsey',
    'GN' : 'Guinea',
    'GW' : 'Guinea-Bissau',
    'GY' : 'Guyana',
    'HT' : 'Haiti',
    'HM' : 'Heard Island & Mcdonald Islands',
    'VA' : 'Holy See (Vatican City State)',
    'HN' : 'Honduras',
    'HK' : 'Hong Kong',
    'HU' : 'Hungary',
    'IS' : 'Iceland',
    'IN' : 'India',
    'ID' : 'Indonesia',
    'IR' : 'Iran, Islamic Republic Of',
    'IQ' : 'Iraq',
    'IE' : 'Ireland',
    'IM' : 'Isle Of Man',
    'IL' : 'Israel',
    'IT' : 'Italy',
    'JM' : 'Jamaica',
    'JP' : 'Japan',
    'JE' : 'Jersey',
    'JO' : 'Jordan',
    'KZ' : 'Kazakhstan',
    'KE' : 'Kenya',
    'KI' : 'Kiribati',
    'KR' : 'Korea',
    'KW' : 'Kuwait',
    'KG' : 'Kyrgyzstan',
    'LA' : 'Lao People\'s Democratic Republic',
    'LV' : 'Latvia',
    'LB' : 'Lebanon',
    'LS' : 'Lesotho',
    'LR' : 'Liberia',
    'LY' : 'Libyan Arab Jamahiriya',
    'LI' : 'Liechtenstein',
    'LT' : 'Lithuania',
    'LU' : 'Luxembourg',
    'MO' : 'Macao',
    'MK' : 'Macedonia',
    'MG' : 'Madagascar',
    'MW' : 'Malawi',
    'MY' : 'Malaysia',
    'MV' : 'Maldives',
    'ML' : 'Mali',
    'MT' : 'Malta',
    'MH' : 'Marshall Islands',
    'MQ' : 'Martinique',
    'MR' : 'Mauritania',
    'MU' : 'Mauritius',
    'YT' : 'Mayotte',
    'MX' : 'Mexico',
    'FM' : 'Micronesia, Federated States Of',
    'MD' : 'Moldova',
    'MC' : 'Monaco',
    'MN' : 'Mongolia',
    'ME' : 'Montenegro',
    'MS' : 'Montserrat',
    'MA' : 'Morocco',
    'MZ' : 'Mozambique',
    'MM' : 'Myanmar',
    'NA' : 'Namibia',
    'NR' : 'Nauru',
    'NP' : 'Nepal',
    'NL' : 'Netherlands',
    'AN' : 'Netherlands Antilles',
    'NC' : 'New Caledonia',
    'NZ' : 'New Zealand',
    'NI' : 'Nicaragua',
    'NE' : 'Niger',
    'NG' : 'Nigeria',
    'NU' : 'Niue',
    'NF' : 'Norfolk Island',
    'MP' : 'Northern Mariana Islands',
    'NO' : 'Norway',
    'OM' : 'Oman',
    'PK' : 'Pakistan',
    'PW' : 'Palau',
    'PS' : 'Palestinian Territory, Occupied',
    'PA' : 'Panama',
    'PG' : 'Papua New Guinea',
    'PY' : 'Paraguay',
    'PE' : 'Peru',
    'PH' : 'Philippines',
    'PN' : 'Pitcairn',
    'PL' : 'Poland',
    'PT' : 'Portugal',
    'PR' : 'Puerto Rico',
    'QA' : 'Qatar',
    'RE' : 'Reunion',
    'RO' : 'Romania',
    'RU' : 'Russian Federation',
    'RW' : 'Rwanda',
    'BL' : 'Saint Barthelemy',
    'SH' : 'Saint Helena',
    'KN' : 'Saint Kitts And Nevis',
    'LC' : 'Saint Lucia',
    'MF' : 'Saint Martin',
    'PM' : 'Saint Pierre And Miquelon',
    'VC' : 'Saint Vincent And Grenadines',
    'WS' : 'Samoa',
    'SM' : 'San Marino',
    'ST' : 'Sao Tome And Principe',
    'SA' : 'Saudi Arabia',
    'SN' : 'Senegal',
    'RS' : 'Serbia',
    'SC' : 'Seychelles',
    'SL' : 'Sierra Leone',
    'SG' : 'Singapore',
    'SK' : 'Slovakia',
    'SI' : 'Slovenia',
    'SB' : 'Solomon Islands',
    'SO' : 'Somalia',
    'ZA' : 'South Africa',
    'GS' : 'South Georgia And Sandwich Isl.',
    'ES' : 'Spain',
    'LK' : 'Sri Lanka',
    'SD' : 'Sudan',
    'SR' : 'Suriname',
    'SJ' : 'Svalbard And Jan Mayen',
    'SZ' : 'Swaziland',
    'SE' : 'Sweden',
    'CH' : 'Switzerland',
    'SY' : 'Syrian Arab Republic',
    'TW' : 'Taiwan',
    'TJ' : 'Tajikistan',
    'TZ' : 'Tanzania',
    'TH' : 'Thailand',
    'TL' : 'Timor-Leste',
    'TG' : 'Togo',
    'TK' : 'Tokelau',
    'TO' : 'Tonga',
    'TT' : 'Trinidad And Tobago',
    'TN' : 'Tunisia',
    'TR' : 'Turkey',
    'TM' : 'Turkmenistan',
    'TC' : 'Turks And Caicos Islands',
    'TV' : 'Tuvalu',
    'UG' : 'Uganda',
    'UA' : 'Ukraine',
    'AE' : 'United Arab Emirates',
    'GB' : 'United Kingdom',
    'US' : 'United States',
    'UM' : 'United States Outlying Islands',
    'UY' : 'Uruguay',
    'UZ' : 'Uzbekistan',
    'VU' : 'Vanuatu',
    'VE' : 'Venezuela',
    'VN' : 'Viet Nam',
    'VG' : 'Virgin Islands, British',
    'VI' : 'Virgin Islands, U.S.',
    'WF' : 'Wallis And Futuna',
    'EH' : 'Western Sahara',
    'YE' : 'Yemen',
    'ZM' : 'Zambia',
    'ZW' : 'Zimbabwe'
};
