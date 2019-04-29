const excelExport = require("./excel-export");
const getWhereData = require('./helpers');
const config = require('./config')
const firebird = require("node-firebird");
const getQueries = require('./queries')


document.querySelectorAll('.action-btn').forEach(element => {
    element.addEventListener('click', e => fetchData(rows => excelExport(rows), e.currentTarget.dataset.relatorio), false);
});

function fetchData(callback, type) {
    firebird.attach(config, function (err, db) {
        if (err)
            throw err;

        let query = type;
        const queries = getQueries(type);
        if (type === 'CLINICO' || type === 'ORTO') {
            query = 'inadimplencia';
        }
        const consulta = queries[query];
        db.query(consulta.query, function (err, result) {
            if (err)
                throw alert('Ocorreu um erro durante a geração do relatório')

            const data = result.map(row => consulta.estrutura(row));
            if (data.length) {
                callback({ data, columns: consulta.columns });
            } else {
                alert('Nenhum resultado foi encontrado');
            }
            db.detach();
        });

    });

}

