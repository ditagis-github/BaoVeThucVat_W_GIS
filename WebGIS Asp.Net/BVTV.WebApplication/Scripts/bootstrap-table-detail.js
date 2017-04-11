function GetColumnNames(tableId) {
    var result = [];

    $('#' + tableId).find('thead').first().find('th').each(function (index, el) {
        if (index > 0) {
            var text = $(el).find('div')[0].innerText;
            if (text !== undefined && text !== '')
                result[index - 1] = text;
            else
                result[index - 1] = index + '';
        }
    });
    return result;
}
function detailFormatter(index, row) {
    var html = [];
    var columns = GetColumnNames('table');
    $.each(row, function (key, value) {
        if (!isNaN(key))
            html.push('<p><b>' + columns[key] + ':</b> ' + value + '</p>');
    });
    return html.join('');
}