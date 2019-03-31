const excel = require('exceljs');
var app = require('electron').remote; 
var dialog = app.dialog;

function excelExport(data) {
    var workbook = new excel.Workbook();

    var sheetName = 'Sheet1';
    var sheet = workbook.addWorksheet(sheetName);

    sheet.columns = [ 
        {
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
        }, {
            key: "fone_1",
            header: "Fone 1"
        }, {
            key: "fone_2",
            header: "Fone 2"
        }, {
            key: "parcelas_nao_pagas",
            header: "Quantidades de parcelas não pagas"
        }
    ];
    sheet.addRows(data);

    dialog.showSaveDialog((filePath) => {
        // var fileName = `relatorios-${moment().format('DD-MM-YYYY-H-m-s')}.xlsx`;
        if ('.xlsx'.indexOf(filePath) === -1) {
            filePath += '.xlsx';
        }
        const file = filePath.split('\\');
        const fileName = file[file.length -1];
        workbook.xlsx.writeFile(filePath)
        .then(()=> alert(`Arquivo ${fileName} salvo com sucesso.`))
        .catch(error => alert(`Erro ao tentar salvar o arquivo.\n${error}`));
    });
}

module.exports = excelExport;