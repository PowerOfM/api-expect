const assert = require('chai').assert
const expect = require('../index')

/* global describe, it */

describe('Number Validator', () => {
  it('should not raise an error if optional', (done) => {
    var tpl = expect.compile({ shortHand: '~number', longForm: {number: [false]} })
    expect.exec(tpl, {}).then((result) => {
      assert.equal(result.error, false, 'Optional fields raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      done()
    }).catch(done)
  })
  it('should enforce validation', (done) => {
    var tpl = expect.compile({ val: 'number:-53:193' })
    expect.exec(tpl, {val: '0'}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: 0}, 'Invalid output')
      return expect.exec(tpl, {val: 193})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: 193}, 'Invalid output')
      return expect.exec(tpl, {val: '-53'})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: -53}, 'Invalid output')
      return expect.exec(tpl, {val: -54})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return expect.exec(tpl, {val: '194'})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return expect.exec(tpl, {val: 'asdf'})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return done()
    }).catch(done)
  })
  it('should return default if optional and input is invalid', (done) => {
    var tpl = expect.compile({ val: '~number:1:10:1' })
    expect.exec(tpl, { val: 0 }).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {val: 1}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should be undefined if default is not defined, field is optional and input is invalid', (done) => {
    var tpl = expect.compile({ val: '~number:5:10' })
    expect.exec(tpl, {val: 1}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      return done()
    }).catch(done)
  })
})