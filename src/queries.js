const Database = require('node-firebird');
const config = require('./config');
const { getWhereData, getWhereQtdNaoPagas } = require('./helpers');
const date = new Date();
const today = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

const queries = {
    inadimplencia: {
        query: () => `SELECT * FROM (
                        SELECT COUNT(*) AS NAO_PAGAS, CNPJ_CPF, NOME FROM MAN101 A
                            inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                        WHERE DATA_LANC < '${today}' AND DATA_PAGO IS NULL GROUP BY CNPJ_CPF, NOME
                    ) where ${getWhereQtdNaoPagas()}`,
        estrutura: (row) => ({
            documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
            nome: row.NOME.toString(),
            parcelas_nao_pagas: row.NAO_PAGAS,
        }),
        columns: [
            { key: "documento", header: "documento" },
            { key: "nome", header: "Nome" },
            { key: "parcelas_nao_pagas", header: "Quantidades de parcelas não pagas" },
        ],
    },
    agendamentos: {
        query: () => `select E.CGC_CPF as cpf,  E.NOME as NOME, E.DT_CADASTRO, COUNT(E.CGC_CPF) AS agendamentos from agenda A 
                        inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                    WHERE ${getWhereData('E.DT_CADASTRO')} GROUP BY E.CGC_CPF, E.NOME, E.DT_CADASTRO`,
        estrutura: (row) => ({
            documento: row.CPF && row.CPF.toString(),
            data: row.DT_CADASTRO && row.DT_CADASTRO.toLocaleDateString('pt-br'),
            nome: row.NOME.toString(),
            agendamentos: row.AGENDAMENTOS,
        }),
        columns: [
            { key: "documento", header: "documento" },
            { key: "data", header: "data" },
            { key: "nome", header: "Nome" },
            { key: "agendamentos", header: "Quantidades de agendamentos feitos" }
        ],
    },
    vendas: {
        query: () => `select DISTINCT * from (
                        select V.NOME as vendedor_nome, E.DT_CADASTRO, C.CGC_CPF, E.NOME from VENDED V inner join EMD101 E
                            on V.CODIGO = E.COD_VENDEDOR inner join CRD111 C on C.CGC_CPF = E.CGC_CPF where ${getWhereData('E.DT_CADASTRO')}
                     )`,
        estrutura: (row) => ({
            documento: row.CGC_CPF.toString(),
            data_venda: row.DT_CADASTRO && row.DT_CADASTRO.toLocaleDateString('pt-br'),
            nome: row.NOME.toString(),
            vendedor_nome: row.VENDEDOR_NOME.toString(),
        }),
        columns: [
            { key: "documento", header: "documento" },
            { key: "data_venda", header: "data" },
            { key: "nome", header: "Nome cliente" },
            { key: "valor", header: "Valor venda" },
            { key: "vendedor_nome", header: "Nome vendedor" },
        ],
    },
    financeiro_clinico: {
        estrutura: (row, posicionamento, dentista) => ({
            dentista,
            nome: row[0],
            nundoc: row[1],
            proced: row[2],
            servico: row[3],
            dente: row[4],
            valor: row[5],
            concluido: row[6] && row[6].toLocaleDateString && row[6].toLocaleDateString('pt-br') || 'Não cadastrada',
        }),
        columns: [
            { key: "dentista", header: "Dentista" },
            { key: "nome", header: "NOME" },
            { key: "nundoc", header: "NUM DOC" },
            { key: "proced", header: "PROCED" },
            { key: "servico", header: "PRODUTO / SERVIÇO" },
            { key: "dente", header: "DENTE" },
            { key: "valor", header: "VALOR" },
            { key: "concluido", header: "CONCLUÍDO'" },
        ],
    },
    financeiro_orto: {
        estrutura: (row, posicionamento, dentista) => ({
            nome: row[0],
            nundoc: posicionamento ? '' : row[1],
            proced: row[2 + posicionamento],
            tipo: row[3 + posicionamento],
            resp: row[4 + posicionamento],
            lanc: row[5 + posicionamento] && row[5 + posicionamento].toLocaleDateString && row[5 + posicionamento].toLocaleDateString('pt-br') || 'Não cadastrada',
            rec_ret: row[6 + posicionamento],
        }),
        columns: [
            { key: 'nome', header: 'NOME' },
            { key: 'nundoc', header: 'NUM' },
            { key: 'proced', header: 'PROCEDIMENTO' },
            { key: 'tipo', header: 'TIPO' },
            { key: 'resp', header: 'RESPONSAVEL' },
            { key: 'lanc', header: 'LANCTO' },
            { key: 'rec_ret', header: 'REC/RET' },
        ],
    },
    financeiro_spc: {
        query: () => `SELECT * FROM (
                        SELECT COUNT(*) AS NAO_PAGAS, CNPJ_CPF, NOME FROM MAN101 A
                            inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                        WHERE DATA_LANC < '${today}' AND DATA_PAGO IS NULL GROUP BY CNPJ_CPF, NOME) 
                    WHERE NAO_PAGAS = 0;`,
        estrutura: (row) => ({
            documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
            nome: row.NOME.toString(),
            parcelas_nao_pagas: row.NAO_PAGAS,
        }),
        columns: [
            { key: "documento", header: "documento" },
            { key: "nome", header: "Nome" },
            { key: "parcelas_nao_pagas", header: "Quantidades de parcelas não pagas" },
        ],
    },

};



const fetchData = function (callback, type, where = 'WHERE') {
    let banco = type === 'contrato' ? config.contratos : config.clinica;
    Database.attach(banco, function (err, db) {
        if (err)
            throw alert(err);

        const consulta = queries[type];
        db.query(consulta.query().replace('WHERE', where), function (err, result) {
            if (err)
                throw alert(`Ocorreu um erro durante a geração do relatório;\n${err}`)

            const data = result.map(row => consulta.estrutura(row));
            if (data.length) {
                callback({ data, columns: consulta.columns, type });
            } else {
                alert('Nenhum resultado foi encontrado');
            }
            db.detach();
        });

    });

};

module.exports = { fetchData, queries };
