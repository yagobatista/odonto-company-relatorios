const { Workbook } = require('exceljs');
const excelExport = require('./excel-export');
const { queries, fetchData } = require('./queries');
var app = require('electron').remote;
var dialog = app.dialog;
const ignoredColumnValues = ['LISTA - CONCLUÍDOS', 'PERÍODO:', 'EMPRESA:', 'NOME', 'CONCLUÍDOS:', 'SUB TOTAL:', 'TOTAL:', 'MANUTENÇÃO - PROCEDIMENTO - DETALHADO'];


module.exports = function excelImport({ data, type, columns, button }) {
    dialog.showOpenDialog(filePath => {
        const workbook = new Workbook();
        const currentQuery = queries[type];
        workbook.xlsx.readFile(filePath[0])
            .then(file => {
                const sheet = file.worksheets[0];
                let dentista = '';
                const data = [];
                sheet.eachRow(row => {
                    const rowValues = row.values;
                    if (type === 'financeiro_spc') {
                        data.push(rowValues[1])
                    } else {
                        if (!isNaN(rowValues[2])) {
                            dentista = rowValues[3];
                        }
                        if (rowValues[2] && ignoredColumnValues.indexOf(rowValues[2]) === -1 && isNaN(rowValues[2])) {
                            const newRow = [];
                            rowValues.forEach(column => newRow.push(column));
                            const posicionamento = newRow.length === 7 ? false : -1;
                            data.push(currentQuery.estrutura(newRow, posicionamento, dentista));
                        }
                    }
                });
                if (type === 'financeiro_spc') {
                    fetchData({callback(rows){
                        const clientesQuePagaram = [];
                        data.forEach(value =>{
                            const result = rows.data.find(item => item.documento === value);
                            if (!result) {
                                debugger;
                                clientesQuePagaram.push(result);
                            }
                        })
                        button.disabled = false;
                        debugger;
                    }, type})
                } else {
                    excelExport({
                        data,
                        columns: currentQuery.columns,
                    });
                }

            })
            .catch(error => alert(`Erro ao tentar salvar o arquivo.\n${error}`));
    });
}
