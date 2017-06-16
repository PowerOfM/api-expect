const assert = require('chai').assert
const expect = require('../index')

/* global describe, it */

describe('APIExpect Core', () => {
  it('should compile and execute short-hand templates', (done) => {
    var tpl = expect.compile({
      string: 'string',
      email: 'email',
      url: 'url',
      number: 'number'
    })

    var data = { string: 'String', email: 'e@mail.com', url: 'http://google.ca', number: 5 }
    expect.exec(tpl, data)
      .then((result) => {
        assertPasses(result, data)
        done()
      })
      .catch(done)
  })

  it('should compile and execute short-hand array templates', (done) => {
    var tpl = expect.compile({
      array: ['string']
    })

    var data = { array: ['hello', 'world'] }
    expect.exec(tpl, data)
      .then((result) => {
        assertPasses(result, data)
        done()
      })
      .catch(done)
  })

  it('should compile and execute long-form templates', (done) => {
    var tpl = expect.compile({
      string: {string: []},
      index: {index: [['A', 'B', 'C'], 0]},
      nested: {object: [{
        one: 'string',
        two: 'number'
      }]}
    })

    var data = { string: 's', index: 1, nested: { one: 'time', two: 4 } }
    expect.exec(tpl, data)
      .then((result) => {
        assertPasses(result, data)
        done()
      })
      .catch(done)
  })

  it('should compile and execute simple-form object templates', (done) => {
    var tpl = expect.compile({
      nestedSimple: {object: {
        three: 'string',
        four: 'number'
      }}
    })

    var data = { nestedSimple: { three: 'trees', four: 144 } }
    expect.exec(tpl, data)
      .then((result) => {
        assertPasses(result, data)
        done()
      })
      .catch(done)
  })

  function assertPasses (result, data) {
    assert.equal(result.error, false, 'Execution failed')
    assert.deepEqual(result.output, data, 'Output data does not match input')
    assert.equal(result.messages, 0, 'Execution has error messages')
  }
})
