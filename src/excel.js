var mysql = require('mysql');
const excelExport = require("./excel-export");
const el = require('./helpers')
const config = require('./config')

el('action-btn').addEventListener('click', () => {
    fetchData(rows => excelExport(rows));
}, false);

function fetchData(callback) {
    debugger;
    var connection = mysql.createConnection(config);

    // connect to mysql
    connection.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
    });
    let where = [];
    const initDate = el('init_date').value;
    const fimDate = el('fim_date').value;
    if (initDate) {
        where.push(`criado_em > "${initDate}"`);
    }
    if (fimDate) {
        where.push(`criado_em < "${fimDate}"`);
    }
    where = where.join(' AND ');
    $query = `SELECT * FROM cliente ${where && ' WHERE ' + where || ''} ;`;
    debugger;

    connection.query($query, function (err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        callback(rows);

    });

    connection.end();
}
