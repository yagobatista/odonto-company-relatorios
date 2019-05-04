const Database = require('node-firebird');
const config = require('./config');
const excelExport = require('./excel-export');
const excelImport = require('./excel-import');
const getQueries = require('./queries')


document.querySelectorAll('.action-btn').forEach(element => {
    element.addEventListener('click', e => {
        e.currentTarget.disabled = true;
        if (e.currentTarget.dataset.relatorio === 'financeiro') {
            excelImport(e.currentTarget.dataset.type);
        } else {
            fetchData(rows => excelExport(rows), e.currentTarget.dataset.relatorio);
        }
        e.currentTarget.disabled = false;
    }, false);
});

function fetchData(callback, type) {
    let banco = type === 'contrato' ? config.contratos : config.clinica;
    Database.attach(banco, function (err, db) {
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

