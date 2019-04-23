const excelExport = require("./excel-export");
const el = require('./helpers')
const config = require('./config')
var firebird  = require("node-firebird");

document.querySelectorAll('.action-btn').forEach(element => {
    element.addEventListener('click', e => {
        let type = 'CLINICO';
        if (e.currentTarget.dataset.relatorio === 'inandi-orto') {
            type = 'ORTO'
        }
        fetchData(rows => excelExport(rows), type);
    }, false); 
});

function fetchData(callback, type) {
    firebird.attach(config, function (err, db) {
        if (err)
            throw err;

        let where = [];
        const initDate = el('init_date').value.replace(/-/g, '.');
        const fimDate = el('fim_date').value.replace(/-/g, '.');
        if (initDate) {
            where.push(`A.DATA > '${initDate}'`);
        }
        if (fimDate) {
            where.push(`A.DATA < '${fimDate}'`);
        }
        where = where.join(' AND ');
        where =  (where && ' WHERE ' + where) || '';
        let query = `select A.CNPJ_CPF , NOME, DATA, DATA_PAGO, DATA_LANC, MAX(M.DATA_PAGO), COUNT(A.DATA) from agenda A inner join MAN101 M on A.CNPJ_CPF = M.CNPJ_CPF and A.DATA = M.DATA_LANC  ${where} GROUP BY A.CNPJ_CPF ;`;
        // query = `select COUNT(M.DATA_PAGO) AS NUM_PAGO, A.CNPJ_CPF, M.DATA_PAGO from agenda A left join MAN101 M on A.CNPJ_CPF = M.CNPJ_CPF and A.DATA = M.DATA_LANC  WHERE A.DATA > '2018.09.01' AND A.DATA < '2018.10.01' AND M.DATA_PAGO IS NULL GROUP BY A.CNPJ_CPF;`;
        query = `select DISTINCT * from agenda A inner join (
            SELECT COUNT(*) AS NAO_PAGAS, CNPJ_CPF FROM MAN101 WHERE DATA_PAGO IS NULL GROUP BY CNPJ_CPF
        ) M on A.CNPJ_CPF = M.CNPJ_CPF WHERE A.DEPARTAMENTO = '${type}' AND A.DATA > '2018.09.01' AND A.DATA < '2018.10.01'`;
        db.query(query, function (err, result) {
            if (err)
                throw alert('Ocorreu um erro durante a geração do relatório')
                
            const rows = result.map(row => ({
                documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
                data: row.DATA,
                nome: row.NOME.toString(),
                fone_1: row.FONE_1,
                fone_2: row.FONE_2,
                parcelas_nao_pagas: row.NAO_PAGAS,
            }));
            if (rows.length) {
                callback(rows);
            } else {
                alert('Nenhum resultado foi encontrado');
            }
            db.detach();
        });
    });

}