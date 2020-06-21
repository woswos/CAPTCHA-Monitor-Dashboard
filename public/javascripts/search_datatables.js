// The URL for the API endpoint
let api_url = '/api/measurements'

const table_values = (async () => {

    //if((localStorage['results_summary'] == null) || (typeof(JSON.parse(localStorage['results_summary']).results) == "undefined")){
        // Get data
        let response = await fetch(api_url + '/1500');
        let api = await response.json();
        localStorage['results_summary'] = JSON.stringify(api);
        createTableRows(api);
    // }else{
    //     let api = JSON.parse(localStorage['results_summary']);
    //     createTableRows(api);
    // }

})();

function createTableRows(api) {
    var tableRef = document.getElementById('search_table').getElementsByTagName('tbody')[0];

    for (let i = 0; i < api.results.length; i++) {
        // Insert a row in the table at the last row
        let newRow = tableRef.insertRow();

        let newCell = newRow.insertCell(0);

        let id = api.results[i].id
        let link = '<a href="/measurements/details/' +
            id + '" target="_blank">' + id + '</a>';
        newText = document.createElement('a');
        newText.innerHTML = link;
        newCell.appendChild(newText);

        newCell = newRow.insertCell(1);
        newText = document.createTextNode(api.results[i].timestamp);
        newCell.appendChild(newText);

        newCell = newRow.insertCell(2);
        newText = document.createTextNode(api.results[i].method);
        newCell.appendChild(newText);

        newCell = newRow.insertCell(3);
        newText = document.createTextNode(api.results[i].tbb_security_level);
        newCell.appendChild(newText);

        newCell = newRow.insertCell(4);
        newText = document.createTextNode(api.results[i].url);
        newCell.appendChild(newText);

        newCell = newRow.insertCell(5);
        let exit_node = api.results[i].exit_node
        link = '<a href="https://metrics.torproject.org/rs.html#search/' +
            exit_node + '" target="_blank">' + exit_node + '</a>';
        newText = document.createElement('a');
        newText.innerHTML = link;
        newCell.appendChild(newText);

        newCell = newRow.insertCell(6);
        let is_captcha_found = '';
        if(api.results[i].is_captcha_found == 1){
            is_captcha_found = 'Yes';
        }else{
            is_captcha_found = 'No';
        }
        newText = document.createTextNode(is_captcha_found);
        newCell.appendChild(newText);
    }

    $(document).ready(function() {
        $('#search_table').DataTable();
    });

    // Remove the loading icon
    document.getElementById('loading_icon_summary_table').remove();
}
