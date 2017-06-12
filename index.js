const Sanitize = require('./sanitize')

const IS_OPTIONAL_CHAR = '~'
const IS_REQUIRED_CHAR = '*'

class APIExpect {
  constructor () {
    this.defaultOptional = false
    this.validators = Object.assign({}, Validators)
  }

  addValidator (name, validator) {
    this.validators[name] = validator
  }

  addValidators (obj) {
    for (var name in obj) {
      this.validators[name] = obj[name]
    }
  }

  compile (obj) {
    var tpl = {}

    for (var field in obj) {
      tpl[field] = this._compileParseField(field, obj[field])
    }

    return tpl
  }

  _compileParseField (field, val) {
    // Short-hand string based '~VALIDATOR:param...'
    if (typeof val === 'string') {
      let required
      if (this.defaultOptional) {
        required = val.charAt(0) === IS_REQUIRED_CHAR
        if (required) val = val.substring(1)
      } else {
        required = val.charAt(0) !== IS_OPTIONAL_CHAR
        if (!required) val = val.substring(1)
      }

      let parts = val.split(':')

      let validator = this.validators[parts[0]]
      if (!validator) throw new Error('Invalid validator name ' + parts[0])

      parts[0] = required
      return validator.apply(this, parts)

    // Short-hand array [...]
    } else if (Array.isArray(val)) {
      if (typeof val[0] !== 'boolean') val.unshift(!this.defaultOptional)
      val[1] = this._compileParseField(field, val[1])
      return this.validators.array.apply(this, val)

    // Object-form { 'VALIDATOR': [isRequired, param...] }
    } else if (typeof val === 'object') {
      let vname = Object.keys(val)[0]
      if (!vname) throw new Error('No validator found for field ' + field)

      let validator = this.validators[vname]
      if (!validator) throw new Error('Invalid validator name ' + vname)

      // Params should always be arrays, but can be skipped for the object validator
      let params = val[vname]
      if (!Array.isArray(params)) {
        if (vname === 'object') params = [!this.defaultOptional, params]
        else throw new Error('Parameters for field ' + field + ' must be an array.')
      }

      // First parameter is always 'isRequired'; insert the default if not included
      if (typeof params[0] !== 'boolean') params.unshift(!this.defaultOptional)

      // Recursive compiling for array (need 1 validator) and object (needs complete template)
      if (vname === 'array') params[1] = this._compileParseField(params[1])
      if (vname === 'object') params[1] = this.compile(params[1])

      return validator.apply(this, params)

    // Some other maddness
    } else {
      throw new Error('Invalid expect field ' + field + ': ' + val)
    }
  }

  exec (tpl, data, opts) {
    data = data || {}
    opts = opts || {}
    var promises = []

    // Compile list of promises from validators
    for (var field in tpl) {
      promises.push(tpl[field](data[field], field))
    }

    // Wait for all promises to complete, then return results
    return Promise.all(promises).then((results) => {
      var output = {}
      var error = false
      var messages = []
      var failedFields = []

      for (var i = 0; i < results.length; i++) {
        let result = results[i]
        if (result.e) {
          // IgnoreUndefined Mode (ignore errors from undefined fields)
          if (opts.ignoreUndefined && data[result.f] === undefined) {
            continue
          }
          error = true
          if (result.msgs) messages.push(...result.msgs)
          else messages.push(result.msg)
          failedFields.push(result.f)
        }

        if (result.v === undefined) continue
        if (result.fields) {
          for (var j = 0; j < result.fields.length; j++) {
            let newField = result.fields[j]
            if (result.v[newField] === undefined) continue
            output[newField] = result.v[newField]
          }
        } else {
          output[result.f] = result.v
        }
      }

      return { output, error, messages, failedFields }
    })
  }

  middleware (template, source, options) {
    options = options || {}
    var dest = options.inPlace ? source : options.destination || options.dest || 'data'
    source = source || 'body'

    template = options.skipCompile ? template : this.compile(template)

    var _this = this
    return (req, res, next) => {
      _this.exec(template, req[source] || {}, options)
        .then((result) => {
          // On validation error, return 400 status
          if (result.error) {
            return next({
              error: 'input-invalid',
              message: result.messages.join(' '),
              messages: result.messages,
              fields: result.failedFields,
              status: 400
            })
          }

          // Proceed to next middleware
          var rd = (req[dest] = req[dest] || {})
          for (var f in result.output) {
            rd[f] = result.output[f]
          }
          return next()
        })
        .catch((err) => {
          console.error(err)
          next(err)
        })
    }
  }
  body (template, options) { return this.middleware(template, 'body', options) }
  query (template, options) { return this.middleware(template, 'query', options) }
  params (template, options) { return this.middleware(template, 'params', options) }
}

var Validators = {}

Validators.object = function (req, tpl) {
  return (v, f) => {
    return this.exec(tpl, v).then((result) => {
      return { v: result.error ? null : result.output, e: req && result.error, f, msgs: result.messages }
    })
  }
}

Validators.array = function (req, validator, min, max) {
  min = min || 0
  max = max || Infinity

  return (v, f) => {
    if (!Array.isArray(v)) return { v: req ? null : [], e: req, f, msg: 'The ' + f + ' must be an array.' }
    if (v.length < min || v.length > max) return { v: req ? null : [], e: req, f, msg: 'The ' + f + ' must have between ' + min + ' and ' + max + ' values.' }

    var promises = []
    for (var i = 0; i < v.length; i++) {
      promises.push(validator(v[i], f))
    }

    return Promise.all(promises).then((results) => {
      var output = []
      var fields = null
      var error = false
      var messages = []

      // The validator must never switch between mulit-field and single-field results
      if (results[0].fields) {
        output = {}
        fields = results[0].fields
      }

      for (var i = 0; i < results.length; i++) {
        var result = results[i]
        if (result.e) {
          error = true
          messages.push(result.msg)
        }

        if (result.v === undefined) continue
        if (fields) {
          for (var j = 0; j < fields.length; j++) {
            let newField = fields[j]
            if (result.v[newField] === undefined) continue
            output[newField] = output[newField] || []
            output[newField].push(result.v[newField])
          }
        } else {
          output.push(result.v)
        }
      }

      error = req && error
      return { v: error ? [] : output, e: error, f, fields, msgs: messages }
    })
  }
}

const STRING_MIN_LENGTH = 1
const STRING_MAX_LENGTH = Infinity
Validators.string = function (req, min, max, def) {
  min = Number(min) || STRING_MIN_LENGTH
  max = Number(max) || STRING_MAX_LENGTH

  var msg = ' must be between ' + min + (max !== Infinity ? ' ' + max : '') + ' characters long.'

  return (v, f) => {
    v = Sanitize.plainText(v)
    var err = v.length < min || v.length > max

    return {
      v: !err ? v : def,
      e: req && err,
      f,
      msg: 'The ' + f + msg
    }
  }
}
Validators.plaintext = Validators.string
Validators.html = function (req, min, max, def) {
  min = Number(min) || STRING_MIN_LENGTH
  max = Number(max) || STRING_MAX_LENGTH

  return (v, f) => {
    v = Sanitize.html(v)
    var err = v.length < min || v.length > max

    return {
      v: !err ? v : def,
      e: req && err,
      f,
      msg: 'The ' + f + ' must be between ' + min + ' and ' + max + ' characters long.'
    }
  }
}

const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/
Validators.email = function (req, def) {
  return (v, f) => {
    v = String(v)
    var err = EMAIL_REGEX.exec(v) == null

    return {
      v: !err ? v : def,
      e: req && err,
      f,
      msg: 'The ' + f + ' must be between a valid email address.'
    }
  }
}

const URI_REGEX = /^(http:\/\/|https:\/\/)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_ \+.~#?&//=]*)$/g
Validators.uri = function (req, def) {
  return (v, f) => {
    v = String(v)
    var err = URI_REGEX.exec(v) == null

    return {
      v: !err ? v : def,
      e: req && err,
      f,
      msg: 'The ' + f + ' must be between a valid URI.'
    }
  }
}
Validators.url = Validators.uri

Validators.bool = function (req, def) {
  if (def === 'true') def = true
  if (def === 'false') def = false
  if (typeof def !== 'boolean') def = undefined

  return (v, f) => {
    var err = false
    if (typeof v !== 'boolean') {
      if (v === 'true') v = true
      else if (v === 'false') v = false
      else if (v === 0 || v === 1) v = Boolean(v)
      else err = true
    }

    return {
      v: !err ? v : def,
      e: req && err,
      f,
      msg: 'The ' + f + ' must be a valid boolean.'
    }
  }
}
Validators.boolean = Validators.bool

Validators.number = function (req, min, max, def) {
  min = Number(min)
  max = Number(max)
  def = Number(def)
  if (isNaN(min)) min = -Infinity
  if (isNaN(max)) max = Infinity
  if (isNaN(def)) def = undefined

  if (min >= max) throw new Error('Invalid number validator parameters. Min (' + min + ') must be smaller than max (' + max + ')')
  var msg = ' must be a number between ' + min + ' and ' + max + '.'

  return (v, f) => {
    v = Number(v)
    var err = isNaN(v) || (min != null && v < min) || (max != null && v > max)
    return {
      v: !err ? v : def,
      e: req && err,
      f,
      msg: 'The ' + f + msg
    }
  }
}

Validators.index = function (req, array, min, def) {
  if (!array) throw new Error('Array for index validator must be defined.')
  return Validators.number(req, min == null ? 0 : min, array.length - 1, def)
}

Validators.date = function (req, min, max, def) {
  if ((min != null && isNaN(min)) || (max != null && isNaN(max))) throw new Error('Invalid values for min and max in date validator.')

  var msg = ' must be a valid date'
  if (min) {
    msg += ' before ' + min.toString()
    min = min.getTime()
  }
  if (max) {
    msg += (min ? ' and' : '') + ' after ' + max.toString()
    max = max.getTime()
  }
  msg += '.'

  return (v, f) => {
    v = new Date(v)
    var err = isNaN(v.getTime()) || (min != null && v.getTime() < min) || (max != null && v.getTime() > max)
    return {
      v: !err ? v : def,
      e: req && err,
      f,
      msg: 'The ' + f + msg
    }
  }
}

module.exports = new APIExpect()
module.exports._class = APIExpect
