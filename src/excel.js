const excelExport = require("./excel-export");
const el = require('./helpers')
const config = require('./config')
const firebird = require("node-firebird");

document.querySelectorAll('.action-btn').forEach(element => {
    element.addEventListener('click', e => fetchData(rows => excelExport(rows), e.currentTarget.dataset.relatorio), false);
});

function fetchData(callback, type) {
    firebird.attach(config, function (err, db) {
        if (err)
            throw err;

        let where = [];
        const initDate = el('init_date').value.replace(/-/g, '.');
        const fimDate = el('fim_date').value.replace(/-/g, '.');
        let dataColumn = 'A.DATA';
        if (type === 'agendamentos') {
            dataColumn = 'E.DT_CADASTRO';
        }
        if (initDate) {
            where.push(`${dataColumn} > '${initDate}'`);
        }
        if (fimDate) {
            where.push(`${dataColumn} < '${fimDate}'`);
        }
        where = where.join(' AND ');
        // where =  (where && ' WHERE ' + where) || '';
        // let query = {`select A.CNPJ_CPF , NOME, DATA, DATA_PAGO, DATA_LANC, MAX(M.DATA_PAGO), COUNT(A.DATA) from agenda A inner join MAN101 M on A.CNPJ_CPF = M.CNPJ_CPF and A.DATA = M.DATA_LANC  ${where} GROUP BY A.CNPJ_CPF ;`;
        // query = `select COUNT(M.DATA_PAGO) AS NUM_PAGO, A.CNPJ_CPF, M.DATA_PAGO from agenda A left join MAN101 M on A.CNPJ_CPF = M.CNPJ_CPF and A.DATA = M.DATA_LANC  WHERE A.DATA > '2018.09.01' AND A.DATA < '2018.10.01' AND M.DATA_PAGO IS NULL GROUP BY A.CNPJ_CPF;`;}
        let query = type;
        const queries = {
            inadimplencia: {
                query: `select DISTINCT * from agenda A inner join (
                                SELECT COUNT(*) AS NAO_PAGAS, CNPJ_CPF FROM MAN101 WHERE DATA_PAGO IS NULL GROUP BY CNPJ_CPF
                            ) M on A.CNPJ_CPF = M.CNPJ_CPF WHERE A.DEPARTAMENTO = '${type}' AND ${where}`,
                estrutura: (row) => ({
                    documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
                    data: row.DATA,
                    nome: row.NOME.toString(),
                    fone_1: row.FONE_1,
                    fone_2: row.FONE_2,
                    parcelas_nao_pagas: row.NAO_PAGAS,
                })
            },
            agendamentos: {
                query: `select E.CGC_CPF as cpf,  E.NOME as NOME, E.DT_CADASTRO, COUNT(E.CGC_CPF) AS agendamentos from agenda A inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                                        WHERE ${where} GROUP BY E.CGC_CPF, E.NOME, E.DT_CADASTRO`,
                estrutura: (row) => ({
                    documento: row.CPF && row.CPF.toString(),
                    data: row.DT_CADASTRO,
                    nome: row.NOME.toString(),
                    agendamentos: row.AGENDAMENTOS,

                })
            }
        };
        if (type === 'CLINICO' || type === 'ORTO') {
            query = 'inadimplencia';
        }
        const consulta = queries[query];
        db.query(consulta.query, function (err, result) {
            if (err)
                throw alert('Ocorreu um erro durante a geração do relatório')

            const rows = result.map(row => consulta.estrutura(row));
            if (rows.length) {
                callback(rows);
            } else {
                alert('Nenhum resultado foi encontrado');
            }
            db.detach();
        });
    });

}