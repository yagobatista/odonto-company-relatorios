const getWhereData = require('./helpers');

const getQueries = function (type) {
    return {
        inadimplencia: {
            query: `select DISTINCT * from agenda A inner join (
                            SELECT COUNT(*) AS NAO_PAGAS, CNPJ_CPF FROM MAN101 WHERE DATA_PAGO IS NULL GROUP BY CNPJ_CPF
                        ) M on A.CNPJ_CPF = M.CNPJ_CPF WHERE A.DEPARTAMENTO = '${type}' AND ${getWhereData()}`,
            estrutura: (row) => ({
                documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
                data: row.DATA,
                nome: row.NOME.toString(),
                fone_1: row.FONE_1 || '',
                fone_2: row.FONE_2 || '',
                parcelas_nao_pagas: row.NAO_PAGAS,
            }),
            columns: [
                { key: "documento", header: "documento" },
                { key: "data", header: "data" },
                { key: "nome", header: "Nome" },
                { key: "fone_1", header: "Fone 1" },
                { key: "fone_2", header: "Fone 2" },
                { key: "parcelas_nao_pagas", header: "Quantidades de parcelas não pagas" },
            ],
        },
        agendamentos: {
            query: `select E.CGC_CPF as cpf,  E.NOME as NOME, E.DT_CADASTRO, COUNT(E.CGC_CPF) AS agendamentos from agenda A inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                                        WHERE ${getWhereData('E.DT_CADASTRO')} GROUP BY E.CGC_CPF, E.NOME, E.DT_CADASTRO`,
            estrutura: (row) => ({
                documento: row.CPF && row.CPF.toString(),
                data: row.DT_CADASTRO,
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
            query: `select V.NOME as vendedor_nome, C.CGC_CPF, E.NOME, C.VALOR_VENDA from VENDED V inner join EMD101 E on V.CODIGO = E.COD_VENDEDOR inner join CRD111 C on C.CGC_CPF = E.CGC_CPF where ${getWhereData('E.DT_CADASTRO')}`,
            estrutura: (row) => ({
                documento: row.CGC_CPF.toString(),
                nome: row.NOME.toString(),
                valor: row.VALOR_VENDA.toFixed(2),
                vendedor_nome: row.VENDEDOR_NOME.toString(),
            }),
            columns: [
                { key: "documento", header: "documento" },
                { key: "data", header: "data" },
                { key: "nome", header: "Nome cliente" },
                { key: "valor", header: "Valor venda" },
                { key: "vendedor_nome", header: "Nome vendedor" },
            ],
        },

    };
}

module.exports = getQueries;
