function el(selector) {
    return document.getElementById(selector);
}
function getWhereData(dataColumn = 'A.DATA') {
    let where = [];
    const initDate = el('init_date').value.replace(/-/g, '.');
    const fimDate = el('fim_date').value.replace(/-/g, '.');
    if (initDate) {
        where.push(`${dataColumn} > '${initDate}'`);
    }
    if (fimDate) {
        where.push(`${dataColumn} < '${fimDate}'`);
    }
    if (!initDate || !fimDate) {
        document.querySelectorAll('.action-btn').forEach(element => {
            element.disabled = false;
        });
        throw alert('Por favor, digite datas válidas!')
    }
    where = where.join(' AND ');
    // where =  (where && ' WHERE ' + where) || '';
    return where;
}
function getWhereQtdNaoPagas() {
    const qtdParcelas = el('qtd_parcelas');
    if (!qtdParcelas.value) {
        document.querySelectorAll('.action-btn').forEach(element => {
            element.disabled = false;
        });
        throw alert('Por favor, digite uma quantidade de parcelas válida!')
    }
    return `NAO_PAGAS = ${qtdParcelas.value}` || ''
}
module.exports = {
    getWhereData,
    getWhereQtdNaoPagas,
    el,
};