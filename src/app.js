const excelExport = require('./excel-export');
const excelImport = require('./excel-import');
const { fetchData } = require('./queries')


document.querySelectorAll('.action-btn').forEach(element => {
    element.addEventListener('click', e => {
        const button = e.currentTarget;
        const dataset = button.dataset;
        const type = dataset.relatorio;
        button.disabled = true;
        if (type === 'financeiro') {
            excelImport({ type: `${type}_${dataset.type}`, button });
        } else {
            fetchData({callback: excelExport, type, button});
        }
    }, false);
});


