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
                        const newRow = [];
                        rowValues.forEach(column => newRow.push(column));
                        const posicionamento = newRow.length === 7 ? false : -1;
                        data.push(currentQuery.estrutura(newRow, posicionamento, dentista));
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