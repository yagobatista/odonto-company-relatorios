const excel = require('exceljs');
var app = require('electron').remote;
var dialog = app.dialog;

const excelExport = function ({ data, columns, type }) {
    var workbook = new excel.Workbook();

    var sheetName = 'Sheet1';
    var sheet = workbook.addWorksheet(sheetName);

    sheet.columns = columns;
    sheet.addRows(data);

    dialog.showSaveDialog((filePath) => {
        if (filePath.indexOf('.xlsx') === -1) {
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