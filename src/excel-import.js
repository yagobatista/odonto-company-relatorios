const { Workbook } = require('exceljs');
const excelExport = require('./excel-export');
const getQueries = require('./queries');
var app = require('electron').remote;
var dialog = app.dialog;
const ignoredColumnValues = ['LISTA - CONCLUÍDOS', 'PERÍODO:', 'EMPRESA:', 'NOME', 'CONCLUÍDOS:', 'SUB TOTAL:', 'TOTAL:', 'MANUTENÇÃO - PROCEDIMENTO - DETALHADO'];


module.exports = function excelImport(type) {
    dialog.showOpenDialog(filePath => {
        const workbook = new Workbook();
        const exportQueries = getQueries();
        const currentQuery = exportQueries[`financeiro_${type}`];
        workbook.xlsx.readFile(filePath[0])
            .then(file => {
                const sheet = file.worksheets[0];
                let dentista = '';
                const data = [];
                sheet.eachRow(row => {
                    const rowValues = row.values;
                    if (!isNaN(rowValues[2])) {
                        dentista = rowValues[3];
                    }
                    if (rowValues[2] && ignoredColumnValues.indexOf(rowValues[2]) === -1 && isNaN(rowValues[2])) {
                        let posicionamento = 0;
                        if ((rowValues[6] && type === 'clinico') || (rowValues[10] && type === 'orto')) {
                            posicionamento = -1;
                        }
                        data.push(currentQuery.estrutura(rowValues, posicionamento, dentista));
                    }
                });
                excelExport({
                    data,
                    columns: currentQuery.columns,
                })

            })
            .catch(error => alert(`Erro ao tentar salvar o arquivo.\n${error}`));
    });
}