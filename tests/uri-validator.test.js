const assert = require('chai').assert
const expect = require('../index')

/* global describe, it */

describe('URI Validator', () => {
  it('should not raise an error if optional', (done) => {
    var tpl = expect.compile({ shortHand: '~uri', longForm: {uri: [false]} })
    expect.exec(tpl, {}).then((result) => {
      assert.equal(result.error, false, 'Optional fields raised an error.')
      assert.deepEqual(result.output, {}, 'Invalid output')
      done()
    }).catch(done)
  })
  it('should enforce regex', (done) => {
    var tpl = expect.compile({ str: 'uri' })
    expect.exec(tpl, {str: 'https://otree.co'}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      return expect.exec(tpl, {str: 'javascript:alert(\'xss\')'})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return done()
    }).catch(done)
  })
  it('should return default if optional and input is invalid', (done) => {
    var tpl = expect.compile({ str: '~uri:otree.co' })
    expect.exec(tpl, {str: ''}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {str: 'otree.co'}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should be undefined if default is not defined, field is optional and input is invalid', (done) => {
    var tpl = expect.compile({ str: '~uri' })
    expect.exec(tpl, {str: 'ftp://test.xyz'}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      return done()
    }).catch(done)
  })
})