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
                fone_1: row.FONE_1,
                fone_2: row.FONE_2,
                parcelas_nao_pagas: row.NAO_PAGAS,
            }),
            columns: [
                { key: "documento", header: "documento" },
                { key: "data", header: "data" },
                { key: "nome", header: "Nome" },
                { key: "fone_1", header: "Fone 1" },
                { key: "fone_2", header: "Fone 2" },
                { key: "parcelas_nao_pagas", header: "Quantidades de parcelas não pagas" },
                { key: "agendamentos", header: "Quantidades de agendamentos feitos" }
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
    };
}

module.exports = getQueries;
