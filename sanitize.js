const XSS = require('xss')

var xssPlainText = new XSS.FilterXSS({ whiteList: [], stripIgnoreTag: true, stripIgnoreTagBody: ['script'] })
var xssHTML = new XSS.FilterXSS({ whiteList: ['p', 'ul', 'li', 'b', 'strong', 'i'], stripIgnoreTag: true, stripIgnoreTagBody: ['script'] })

class Sanitize {
  static html (input) {
    return xssHTML.process(input)
  }
  static plainText (input) {
    return xssPlainText.process(input)
  }
}

module.exports = Sanitize
