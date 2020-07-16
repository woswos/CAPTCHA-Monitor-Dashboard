// The URL for the API endpoint
let api_url = '/api/relays/details'

const details = (async () => {
    let fingerprint_element = document.getElementById('details_fingerprint');
    let fingerprint = fingerprint_element.innerHTML;

    // Get data
    let response = await fetch(api_url + '/' + fingerprint);
    let api = await response.json();
    createText(api)
})();

function createText(api) {

    document.getElementById('details_nickname').innerHTML = api.results[0].nickname;
    document.getElementById('details_country').innerHTML = api.results[0].country;
    document.getElementById('details_last_updated').innerHTML = api.results[0].last_updated;


    if(api.results[0].captcha_probability != null){
        captcha_probability = (api.results[0].captcha_probability * 1.0).toFixed(2) + '%';
    }else{
        captcha_probability = 'N/A';
    }
    document.getElementById('details_captcha_probability').innerHTML = captcha_probability

    let text_mapping = {
        1: 'Yes',
        0: 'No'
    };
    document.getElementById('details_is_ipv4_exiting_allowed').innerHTML = text_mapping[api.results[0].is_ipv4_exiting_allowed];
    document.getElementById('details_is_ipv6_exiting_allowed').innerHTML = text_mapping[api.results[0].is_ipv6_exiting_allowed];

    let status_mapping = {
        'online': 'Online',
        'offline': 'Offline'
    };
    document.getElementById('details_status').innerHTML = status_mapping[api.results[0].status];

    document.getElementById('details_address').innerHTML = '<a href="https://metrics.torproject.org/rs.html#search/' +
        api.results[0].address + '" target="_blank">' +
        api.results[0].address + '</a>';

    document.getElementById('details_download_link').innerHTML = '<a href="/api/relays/details/' +
        api.results[0].fingerprint + '" target="_blank">' +
        '/api/relays/details/' + api.results[0].fingerprint +
        '</a>';

    let requests_json = JSON.parse(api.results[0].performed_tests);
    const tree = JsonView.createTree(requests_json);
    JsonView.render(tree, document.querySelector('#details_performed_tests'));
    JsonView.expandChildren(tree);

    if (api.results[0].status == 'online') {
        $('#first_row').css('border-top', '5px solid #28a745')
    } else {
        $('#first_row').css('border-top', '5px solid #dc3545')
    }

}
