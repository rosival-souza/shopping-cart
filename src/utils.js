/* eslint-disable */
function formatMoneyBRL(n, c, d, t) {

    var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d === undefined ? "," : d,
        t = t === undefined ? "." : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}
  /* eslint-enable */

  const queryfy = obj => {
    // Make sure we don't alter integers.
    if (typeof obj === 'number') {
      return obj
    }
  
    if (Array.isArray(obj)) {
      const props = obj.map(value => `${queryfy(value)}`).join(',')
      return `[${props}]`
    }
  
    if (typeof obj === 'object') {
      const props = Object.keys(obj)
        .map(key => `${key}:${queryfy(obj[key])}`)
        .join(',')
      return `{${props}}`
    }
  
    return JSON.stringify(obj)
  }

const utils = {
    formatMoneyBRL,
    queryfy
}
export default utils