const excelExport = require("./excel-export");
const el = require('./helpers')
const config = require('./config')
var fb  = require("firebird");

el('action-btn').addEventListener('click', () => {
    fetchData(rows => excelExport(rows));
}, false);

function fetchData(callback) {
    sys = require("sys"); 
    var con = fb.createConnection();
    con.connectSync('config.database',config.user, config.password,'');
    debugger;
    var res = con.querySync("select * from ESPECIALIDADES");
    firebird.attach(config, function (err, db) {
        if (err)
            throw err;

        // db = DATABASE
        db.query('SELECT * FROM VENDED', function (err, result) {
            // IMPORTANT: close the connection
            db.detach();
        });
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