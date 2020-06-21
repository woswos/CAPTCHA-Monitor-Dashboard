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

    document.getElementById('details_method').innerHTML = api.results[0].method;

    document.getElementById('details_tbb_security_level').innerHTML = api.results[0].tbb_security_level;

    let url = api.results[0].url
    let url_exp = ''
    if(url.indexOf('captcha.wtf') !== -1){
        url_exp = ' (IPv4 only domain)'
    }else{
        url_exp = ' (IPv6 only domain)'
    }
    var link = '<a href="' + url + '" target="_blank">' + url + '</a>' + url_exp;
    document.getElementById('details_url').innerHTML = link;

    let exit_node = api.results[0].exit_node
    link = '<a href="https://metrics.torproject.org/rs.html#search/' +
        exit_node + '" target="_blank">' + exit_node + '</a>';
    document.getElementById('details_exit_node').innerHTML = link;

    document.getElementById('details_captcha_sign').innerHTML = api.results[0].captcha_sign;

    let captcha_result = ''
    if(api.results[0].is_captcha_found == 1){
        captcha_result = 'Yes';
    }else{
        captcha_result = 'No';
    }
    document.getElementById('details_is_captcha_found').innerHTML = captcha_result;

    document.getElementById('details_timestamp').innerHTML = api.results[0].timestamp + ' UTC';

    let request_headers = JSON.parse(api.results[0].request_headers);
    request_headers = JSON.stringify(request_headers, undefined, 4)
    document.getElementById('details_request_headers').textContent = request_headers;

    let response_headers = JSON.parse(api.results[0].response_headers);
    response_headers = JSON.stringify(response_headers, undefined, 4)
    document.getElementById('details_response_headers').textContent = response_headers;

    document.getElementById('details_html_data').textContent = api.results[0].html_data;

}
