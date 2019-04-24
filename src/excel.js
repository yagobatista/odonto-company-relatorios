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
        if (type === 'vendedores') {
            db.query('select * from VENDED', function (err, result) {
                if (err)
                    throw alert('Ocorreu um erro durante a geração do relatório')

                const vendedores = [];
                result.forEach(vendedor => { vendedores[vendedor.CODIGO] = vendedor.NOME.toString() });
                if (vendedores.length) {
                    db.query(`select * from CRD111 C inner join EMD101 E on C.CGC_CPF = E.CGC_CPF where ${getWhereData('E.DT_CADASTRO')}`, function (err, result) {
                        if (err)
                            throw alert('Ocorreu um erro durante a geração do relatório')

                        const data = result.map(function (row) {
                            return {
                                ...row,
                                vendedor_nome: this[row.RESPONSAVEL.toString()],
                            }
                        }.bind(this));
                        if (data.length) {
                            const columns = [
                                { key: "documento", header: "documento" },
                                { key: "data", header: "data" },
                                { key: "nome", header: "Nome" },
                                { key: "agendamentos", header: "Quantidades de agendamentos feitos" }
                            ];
                            callback({ data, columns });
                        } else {
                            alert('Nenhum resultado foi encontrado');
                        }
                    }.bind(vendedores));
                } else {
                    alert('Nenhum resultado foi encontrado');
                }
                db.detach();
            });
        } else {
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
        }
    });

}

