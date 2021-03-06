// The URL for the API endpoint
let api_url = '/api/measurements/details'

const details = (async () => {
    let id_element = document.getElementById('details_id');
    let id = id_element.innerHTML;

    // Get data
    let response = await fetch(api_url + '/' + id);
    let api = await response.json();
    createText(api)
})();

function createText(api) {

    document.getElementById('details_captcha_sign').innerHTML = api.results[0].captcha_sign;
    document.getElementById('details_html_data').textContent = api.results[0].html_data;
    document.getElementById('details_browser_version').innerHTML = api.results[0].browser_version;
    document.getElementById('details_captchamonitor_version').innerHTML = api.results[0].captchamonitor_version;
    //document.getElementById('details_expected_hash').innerHTML = api.results[0].expected_hash;

    let method_mapping = {'tor_browser': 'Tor Browser',
        'firefox': 'Firefox',
        'chromium': 'Chromium',
        'firefox_over_tor':'Firefox over Tor',
        'chromium_over_tor':'Chromium over Tor',
        'curl':'cURL',
        'brave':'Brave',
        'brave_over_tor':'Brave\'s Tor Window',
        'curl': 'cURL',
        'curl_over_tor': 'cURL over Tor',
        'requests': 'Python\'s requests library',
        'requests_over_tor': 'Python\'s requests library over Tor',
        };

    document.getElementById('details_method').innerHTML = method_mapping[api.results[0].method];

    let text_mapping = {
        1: 'Yes',
        0: 'No'
    };
    document.getElementById('details_is_captcha_found').innerHTML = text_mapping[api.results[0].is_captcha_found];
    document.getElementById('details_is_data_modified').innerHTML = text_mapping[api.results[0].is_data_modified];

    let security_level_mapping = {
        'low': 'Standard',
        'medium': 'Safer',
        'high': 'Safest',
        '': 'N/A'
    };
    document.getElementById('details_tbb_security_level').innerHTML = security_level_mapping[api.results[0].tbb_security_level];


    let url = api.results[0].url
    let url_exp = ''
    if (url.indexOf('captcha.wtf') !== -1) {
        url_exp = ' (IPv4 only domain)'
    } else {
        url_exp = ' (IPv6 only domain)'
    }
    var link = '<a href="' + url + '" target="_blank">' + url + '</a>' + url_exp;
    document.getElementById('details_url').innerHTML = link;


    document.getElementById('details_exit_node').innerHTML = '<a href="https://metrics.torproject.org/rs.html#search/' +
        api.results[0].exit_node + '" target="_blank">' +
        api.results[0].exit_node + '</a>';

    document.getElementById('details_timestamp').innerHTML = api.results[0].timestamp + ' UTC';

    document.getElementById('details_download_link').innerHTML = '<a href="/api/measurements/details/' +
        api.results[0].id + '" target="_blank">' +
        '/api/measurements/details/' + api.results[0].id +
        '</a>';

    let requests_json = JSON.parse(api.results[0].requests);
    const tree = JsonView.createTree(requests_json);
    JsonView.render(tree, document.querySelector('#details_requests'));
    JsonView.expandChildren(tree);

    test_1 = (api.results[0].is_data_modified == 1)
    test_2 = (api.results[0].is_captcha_found == 1)
    if(test_1 && test_2){
        $('#first_row').css('border-top', '5px solid #dc3545')
    } else if(test_1 || test_2){
        $('#first_row').css('border-top', '5px solid #fd7e14')
    } else {
        $('#first_row').css('border-top', '5px solid #28a745')
    }

}
