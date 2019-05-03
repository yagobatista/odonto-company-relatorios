const { Workbook } = require('exceljs');
const excelExport = require('./excel-export');
var app = require('electron').remote;
var dialog = app.dialog;


module.exports = function excelImport() {
    const filePath = ["C:\DB\dentista.xlsx"];
    dialog.showOpenDialog(filePath => {
        const workbook = new Workbook();

        workbook.xlsx.readFile(filePath[0])
            .then(file => {
                const sheet = file.worksheets[0];
                const firstRow = sheet.getRow(11);
                let dentista = firstRow.values[3];
                sheet.spliceRows(1, 11);
                const data = [];
                sheet.eachRow((row, index) => {
                    const values = row.values;
                    if (values[2] === 'CONCLUÍDOS:') {
                        let i = index;
                        let auxDentista;
                        do {
                            i++;
                            auxDentista = sheet.getRow(i).values[3];
                        } while (!auxDentista);
                        dentista = auxDentista;
                    }
                    if (values[2] && values[2] !== 'CONCLUÍDOS:' && isNaN(values[2])) {
                        let posicionamento = 0;
                        if (values[6]) {
                            posicionamento = -1;
                        }
                        data.push({
                            dentista,
                            nome: values[2],
                            nundoc: values[7 + posicionamento],
                            proced: values[8 + posicionamento],
                            servico: values[9 + posicionamento],
                            dente: values[12],
                            valor: values[14 + posicionamento],
                            concluido: values[15 + posicionamento],
                        });
                    }
                });	
                excelExport({
                    data,
                    columns: [
                        { key: "dentista", header: "Dentista" },
                        { key: "nome", header: "OME" },
                        { key: "nundoc", header: "NUM DOC" },
                        { key: "proced", header: "PROCED" },
                        { key: "servico", header: "PRODUTO / SERVIÇO" },
                        { key: "dente", header: "DENTE" },
                        { key: "valor", header: "VALOR" },
                        { key: "concluido", header: "CONCLUÍDO'" },
                    ],
                })

            })
            .catch(error => alert(`Erro ao tentar salvar o arquivo.\n${error}`));
    });
}