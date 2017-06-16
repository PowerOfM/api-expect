const assert = require('chai').assert
const expect = require('../index')

/* global describe, it */

describe('Boolean Validator', () => {
  it('should not raise an error if optional', (done) => {
    var tpl = expect.compile({ shortHand: '~bool', longForm: {boolean: [false]} })
    expect.exec(tpl, {}).then((result) => {
      assert.equal(result.error, false, 'Optional fields raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      done()
    }).catch(done)
  })
  it('should enforce validation', (done) => {
    var tpl = expect.compile({ val: 'bool' })
    expect.exec(tpl, {val: true}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: true}, 'Invalid output')
      return expect.exec(tpl, {val: false})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      return expect.exec(tpl, {val: 'true'})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: true}, 'Invalid output')
      return expect.exec(tpl, {val: 'false'})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: false}, 'Invalid output')
      return expect.exec(tpl, {val: 1})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: true}, 'Invalid output')
      return expect.exec(tpl, {val: 0})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: false}, 'Invalid output')
      return expect.exec(tpl, {val: 'asdf'})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return done()
    }).catch(done)
  })
  it('should return default if optional and input is invalid', (done) => {
    var tpl = expect.compile({ val: '~bool:true' })
    expect.exec(tpl, {}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {val: true}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should be undefined if default is not defined, field is optional and input is invalid', (done) => {
    var tpl = expect.compile({ val: '~bool' })
    expect.exec(tpl, {val: '[object]'}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      return done()
    }).catch(done)
  })
})