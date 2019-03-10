const excel = require('exceljs');
const moment = require('moment');

function excelExport(data) {
    //Creating New Workbook 
    var workbook = new excel.Workbook();

    //Creating Sheet for that particular WorkBook
    var sheetName = 'Sheet1';
    var sheet = workbook.addWorksheet(sheetName);

    //Header must be in below format
    sheet.columns = [{
        key: "nome",
        header: 'Nome'
    }, {
        key: "criado_em",
        header: "Data"
    }];

    sheet.addRows(data);

    //Finally creating XLSX file
    var fileName = `relatorios-${moment().format('DD-MM-YYYY:H:m:s')}.xlsx`;
    workbook.xlsx.writeFile(fileName);

}

module.exports = excelExport;