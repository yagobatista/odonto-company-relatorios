const excelExport = require("./excel-export");
const el = require('./helpers')
const config = require('./config')
var firebird  = require("node-firebird");

el('action-btn').addEventListener('click', () => {
    fetchData(rows => excelExport(rows));
}, false);

function fetchData(callback) {
    firebird.attach(config, function (err, db) {
        if (err)
            throw err;

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
        where =  (where && ' WHERE ' + where) || '';
        const query = `SELECT FIRST(100) * FROM AGENDA ${where} ;`;
        db.query(query, function (err, result) {
            const rows = result.map(row => ({
                documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
                DATA: row.DATA,
            }));
            callback(rows);
            db.detach();
        });
    });

}