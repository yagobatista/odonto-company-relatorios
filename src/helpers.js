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
    where = where.join(' AND ');
    // where =  (where && ' WHERE ' + where) || '';
    return where;
}
module.exports = el;
module.exports = getWhereData;