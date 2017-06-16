const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
}

// Source: https://github.com/janl/mustache.js/blob/ba510eb3549e5c7e673fd262e87f2a8027e03237/mustache.js#L47-L60
module.exports = function escapeHtml (string) {
  return (string && String(string).replace(/[&<>"'/]/g, s => entityMap[s])) || ''
}
