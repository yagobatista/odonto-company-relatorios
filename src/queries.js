const Database = require('node-firebird');
const config = require('./config');
const {
    getWhereData,
    getWhereQtdNaoPagas
} = require('./helpers');
const date = new Date();
const today = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

const queries = {
    inadimplencia_clinico: {
        query: (where) => `SELECT * FROM (
                        SELECT E.CGC_CPF AS CNPJ_CPF, E.NOME, COUNT(*) AS NAO_PAGAS
                        FROM CRD111 C INNER JOIN EMD101 E ON C.CGC_CPF = E.CGC_CPF
                        WHERE NOT EXISTS (SELECT * FROM BXD111 WHERE BXD111.DOCUMENTO = C.DOCUMENTO AND BXD111.CGC_CPF = C.CGC_CPF)GROUP BY E.CGC_CPF, E.NOME 
                    ) where ${getWhereQtdNaoPagas()}`,
        estrutura: (row) => ({
            documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
            nome: row.NOME.toString(),
            cobrancas_nao_pagas: row.NAO_PAGAS,
        }),
        columns: [{
                key: "documento",
                header: "documento"
            },
            {
                key: "nome",
                header: "Nome"
            },
            {
                key: "cobrancas_nao_pagas",
                header: "Quantidades de cobranças não pagas"
            },
        ],
    },
    inadimplencia_orto: {
        query: (where) => `SELECT * FROM (
                        SELECT COUNT(*) AS NAO_PAGAS, CNPJ_CPF, NOME FROM MAN101 A
                            inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                        WHERE DATA_LANC < '${today}' AND DATA_PAGO IS NULL GROUP BY CNPJ_CPF, NOME) 
                    WHERE ${getWhereQtdNaoPagas()}`,
        estrutura: (row) => ({
            documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
            nome: row.NOME.toString(),
            cobrancas_nao_pagas: row.NAO_PAGAS,
        }),
        columns: [{
                key: "documento",
                header: "documento"
            },
            {
                key: "nome",
                header: "Nome"
            },
            {
                key: "cobrancas_nao_pagas",
                header: "Quantidades de cobranças não pagas"
            },
        ],
    },
    relatorio_caixa: {
        query: (where) => `SELECT * FROM (
SELECT CAIXA.LANCTO, CAIXA.DATA, PESSOAS.NOME, VENDAS.CGC_CPF CPF,
'TIPO ' || TIPOS.CODIGO || ': ' || TIPOS.NOME TIPO, CAIXA.VALOR
FROM CXD555 CAIXA INNER JOIN CED003 VENDAS ON CAIXA.DOCUMENTO=VENDAS.DOCUMENTO
INNER JOIN EMD101 PESSOAS ON VENDAS.CGC_CPF=PESSOAS.CGC_CPF
INNER JOIN CRD013 TIPOS ON CAIXA.TIPO=TIPOS.CODIGO
WHERE ${getWhereData('CAIXA.DATA')}
AND CAIXA.TIPO IN(10, 11, 12, 13)
UNION ALL
SELECT CAIXA.LANCTO, CAIXA.DATA, PESSOAS.NOME, MANUTENCAO.CNPJ_CPF CPF,
'TIPO ' || TIPOS.CODIGO || ': ' || TIPOS.NOME TIPO, CAIXA.VALOR
FROM CXD555 CAIXA INNER JOIN MAN111 MANUTENCAO ON CAIXA.DOCUMENTO=MANUTENCAO.LANCTO
INNER JOIN EMD101 PESSOAS ON MANUTENCAO.CNPJ_CPF=PESSOAS.CGC_CPF
INNER JOIN CRD013 TIPOS ON CAIXA.TIPO=TIPOS.CODIGO
WHERE ${getWhereData('CAIXA.DATA')} AND CAIXA.TIPO in (50, 51, 52, 54)
UNION ALL
SELECT CAIXA.LANCTO, CAIXA.DATA, PESSOAS.NOME, MANUTENCAO.CNPJ_CPF CPF,
'TIPO ' || TIPOS.CODIGO || ': ' || TIPOS.NOME TIPO, CAIXA.VALOR
FROM CXD555 CAIXA INNER JOIN MAN111 MANUTENCAO ON CAIXA.DOCUMENTO=MANUTENCAO.LANCTO
INNER JOIN CRD013 TIPOS ON CAIXA.TIPO=TIPOS.CODIGO
INNER JOIN EMD101 PESSOAS ON MANUTENCAO.CNPJ_CPF=PESSOAS.CGC_CPF
WHERE ${getWhereData('CAIXA.DATA')} AND CAIXA.TIPO=53
UNION ALL
SELECT CAIXA.LANCTO, CAIXA.DATA, PESSOAS.NOME, MANUTENCAO.CGC_CPF CPF,
'TIPO ' || TIPOS.CODIGO || ': ' || TIPOS.NOME TIPO, CAIXA.VALOR
FROM CXD555 CAIXA INNER JOIN CRD111 MANUTENCAO
ON TRIM(SUBSTRING(CAIXA.HISTORICO FROM POSITION('-' IN CAIXA.HISTORICO) + 1 FOR POSITION('-', CAIXA.HISTORICO, 6) - POSITION('-' IN CAIXA.HISTORICO) - 1))=MANUTENCAO.DOCUMENTO
INNER JOIN CRD013 TIPOS ON CAIXA.TIPO=TIPOS.CODIGO
INNER JOIN EMD101 PESSOAS ON MANUTENCAO.CGC_CPF=PESSOAS.CGC_CPF
WHERE ${getWhereData('CAIXA.DATA')} AND CAIXA.TIPO in (84, 85, 86, 88)
UNION ALL
SELECT CAIXA.LANCTO, CAIXA.DATA, PESSOAS.NOME, PESSOAS.CGC_CPF CPF,
'TIPO ' || TIPOS.CODIGO || ': ' || TIPOS.NOME TIPO, CAIXA.VALOR
FROM CXD555 CAIXA INNER JOIN CRD013 TIPOS ON CAIXA.TIPO=TIPOS.CODIGO
INNER JOIN EMD101 PESSOAS ON TRIM(SUBSTRING(CAIXA.HISTORICO FROM POSITION('-', CAIXA.HISTORICO, 6) + 1 FOR 16))=PESSOAS.CGC_CPF
WHERE ${getWhereData('DATA')} AND CAIXA.TIPO=87
)
order BY TIPO, DATA;`,
        estrutura: (row) => ({
            documento: row.CPF && row.CPF.toString(),
            nome: row.NOME.toString(),
            lacamento: row.LANCTO.toString(),
            data: row.DATA && row.DATA.toLocaleDateString('pt-br'),
            tipo: row.TIPO.toString(),
            valor: row.VALOR.toString()
        }),
        columns: [{
                key: "documento",
                header: "documento"
            },
            {
                key: "nome",
                header: "Nome"
            },
            {
                key: "lacamento",
                header: "Lançamento"
            },
            {
                key: "data",
                header: "Data"
            },
            {
                key: "tipo",
                header: "Tipo"
            },
            {
                key: "valor",
                header: "Valor"
            },
        ],
    },
    orto_relatorio_caixa: {
        query: (where) => `SELECT * FROM (
SELECT CAIXA.LANCTO, CAIXA.DATA, PESSOAS.NOME, PESSOAS.CGC_CPF CPF,
'TIPO ' || TIPOS.CODIGO || ': ' || TIPOS.NOME TIPO, CAIXA.VALOR
FROM CXD555 CAIXA INNER JOIN CRD013 TIPOS ON CAIXA.TIPO=TIPOS.CODIGO
INNER JOIN EMD101 PESSOAS ON TRIM(SUBSTRING(CAIXA.HISTORICO FROM POSITION('-', CAIXA.HISTORICO, 6) + 1 FOR 16))=PESSOAS.CGC_CPF
WHERE ${getWhereData('CAIXA.DATA')} AND CAIXA.TIPO=54
UNION ALL
SELECT CAIXA.LANCTO, CAIXA.DATA, PESSOAS.NOME, MANUTENCAO.CGC_CPF CPF,
'TIPO ' || TIPOS.CODIGO || ': ' || TIPOS.NOME TIPO, CAIXA.VALOR
FROM CXD555 CAIXA INNER JOIN CRD111 MANUTENCAO
ON TRIM(SUBSTRING(CAIXA.HISTORICO FROM POSITION('-' IN CAIXA.HISTORICO) + 1 FOR POSITION('-', CAIXA.HISTORICO, 6) - POSITION('-' IN CAIXA.HISTORICO) - 1))=MANUTENCAO.DOCUMENTO
INNER JOIN CRD013 TIPOS ON CAIXA.TIPO=TIPOS.CODIGO
INNER JOIN EMD101 PESSOAS ON MANUTENCAO.CGC_CPF=PESSOAS.CGC_CPF
WHERE ${getWhereData('CAIXA.DATA')} AND CAIXA.TIPO IN (51, 52, 53, 55)
)
ORDER BY TIPO, DATA;`,
        estrutura: (row) => ({
            documento: row.CPF && row.CPF.toString(),
            nome: row.NOME.toString(),
            lacamento: row.LANCTO.toString(),
            data: row.DATA && row.DATA.toLocaleDateString('pt-br'),
            tipo: row.TIPO.toString(),
            valor: row.VALOR.toString()
        }),
        columns: [{
                key: "documento",
                header: "documento"
            },
            {
                key: "nome",
                header: "Nome"
            },
            {
                key: "lacamento",
                header: "Lançamento"
            },
            {
                key: "data",
                header: "Data"
            },
            {
                key: "tipo",
                header: "Tipo"
            },
            {
                key: "valor",
                header: "Valor"
            },
        ],
    },
    agendamentos: {
        query: (where) => `select E.CGC_CPF as cpf,  E.NOME as NOME, E.DT_CADASTRO, COUNT(E.CGC_CPF) AS agendamentos from agenda A 
                        inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                    WHERE ${getWhereData('E.DT_CADASTRO')} GROUP BY E.CGC_CPF, E.NOME, E.DT_CADASTRO`,
        estrutura: (row) => ({
            documento: row.CPF && row.CPF.toString(),
            data: row.DT_CADASTRO && row.DT_CADASTRO.toLocaleDateString('pt-br'),
            nome: row.NOME.toString(),
            agendamentos: row.AGENDAMENTOS,
        }),
        columns: [{
                key: "documento",
                header: "documento"
            },
            {
                key: "data",
                header: "data"
            },
            {
                key: "nome",
                header: "Nome"
            },
            {
                key: "agendamentos",
                header: "Quantidades de agendamentos feitos"
            }
        ],
    },
    vendas: {
        query: (where) => `select DISTINCT * from (
                        select V.NOME as vendedor_nome, E.DT_CADASTRO, C.CGC_CPF, E.NOME from VENDED V inner join EMD101 E
                            on V.CODIGO = E.COD_VENDEDOR inner join CRD111 C on C.CGC_CPF = E.CGC_CPF where ${getWhereData('E.DT_CADASTRO')}
                     )`,
        estrutura: (row) => ({
            documento: row.CGC_CPF.toString(),
            data_venda: row.DT_CADASTRO && row.DT_CADASTRO.toLocaleDateString('pt-br'),
            nome: row.NOME.toString(),
            vendedor_nome: row.VENDEDOR_NOME.toString(),
        }),
        columns: [{
                key: "documento",
                header: "documento"
            },
            {
                key: "data_venda",
                header: "data"
            },
            {
                key: "nome",
                header: "Nome cliente"
            },
            {
                key: "vendedor_nome",
                header: "Nome vendedor"
            },
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
        columns: [{
                key: "dentista",
                header: "Dentista"
            },
            {
                key: "nome",
                header: "NOME"
            },
            {
                key: "nundoc",
                header: "NUM DOC"
            },
            {
                key: "proced",
                header: "PROCED"
            },
            {
                key: "servico",
                header: "PRODUTO / SERVIÇO"
            },
            {
                key: "dente",
                header: "DENTE"
            },
            {
                key: "valor",
                header: "VALOR"
            },
            {
                key: "concluido",
                header: "CONCLUÍDO'"
            },
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
        columns: [{
                key: 'nome',
                header: 'NOME'
            },
            {
                key: 'nundoc',
                header: 'NUM'
            },
            {
                key: 'proced',
                header: 'PROCEDIMENTO'
            },
            {
                key: 'tipo',
                header: 'TIPO'
            },
            {
                key: 'resp',
                header: 'RESPONSAVEL'
            },
            {
                key: 'lanc',
                header: 'LANCTO'
            },
            {
                key: 'rec_ret',
                header: 'REC/RET'
            },
        ],
    },
    financeiro_spc: {
        query: (where) => `SELECT * FROM 
                        (SELECT CNPJ_CPF, NOME, COUNT(*) AS NAO_PAGAS FROM MAN101 A
                            inner join EMD101 E on A.CNPJ_CPF = E.CGC_CPF
                        WHERE DATA_LANC < '${today}' AND DATA_PAGO IS NULL GROUP BY CNPJ_CPF, NOME
                        UNION
                        SELECT E.CGC_CPF AS CNPJ_CPF, E.NOME, COUNT(*) AS NAO_PAGAS
                        FROM CRD111 C INNER JOIN EMD101 E ON C.CGC_CPF = E.CGC_CPF
                        WHERE NOT EXISTS (SELECT * FROM BXD111 WHERE BXD111.DOCUMENTO = C.DOCUMENTO AND BXD111.CGC_CPF = C.CGC_CPF)GROUP BY E.CGC_CPF, E.NOME)
                        ${where};`,
        estrutura: (row) => ({
            documento: row.CNPJ_CPF && row.CNPJ_CPF.toString(),
        }),
        columns: [{
            key: "documento",
            header: "documento"
        }, ],
    },

};



const fetchData = function ({
    callback,
    type,
    where,
    button,
    connection_name,
}) {
    let banco = config[connection_name];
    Database.attach(banco, function (err, db) {
        if (err)
            throw alert(err);
 
        const consulta = queries[type];
        db.query(consulta.query(where), function (err, result) {
            if (button) {
                button.disabled = false;
            }
            if (err)
                throw alert(`Ocorreu um erro durante a geração do relatório;\n${err}`)

            const data = result.map(row => consulta.estrutura(row));
            if (data.length) {
                callback({
                    data,
                    columns: consulta.columns,
                    type
                });
            } else {
                alert('Nenhum resultado foi encontrado');
            }
            db.detach();
        });

    });

};

module.exports = {
    fetchData,
    queries
};