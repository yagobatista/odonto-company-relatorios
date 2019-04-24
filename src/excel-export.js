const excel = require('exceljs');
var app = require('electron').remote;
var dialog = app.dialog;

const excelExport = function (rows) {
    var workbook = new excel.Workbook();

    var sheetName = 'Sheet1';
    var sheet = workbook.addWorksheet(sheetName);

    sheet.columns = rows.columns;
    sheet.addRows(rows.data);

    dialog.showSaveDialog((filePath) => {
        // var fileName = `relatorios-${moment().format('DD-MM-YYYY-H-m-s')}.xlsx`;
        if ('.xlsx'.indexOf(filePath) === -1) {
            filePath += '.xlsx';
        }
        const file = filePath.split('\\');
        const fileName = file[file.length - 1];
        workbook.xlsx.writeFile(filePath)
            .then(() => alert(`Arquivo ${fileName} salvo com sucesso.`))
            .catch(error => alert(`Erro ao tentar salvar o arquivo.\n${error}`));
    });
}

module.exports = excelExport;