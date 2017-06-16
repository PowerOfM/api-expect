const assert = require('chai').assert
const expect = require('../index')

/* global describe, it */

describe('Index Validator', () => {
  const INDEX = ['a', 'b', 'c']
  it('should not raise an error if optional', (done) => {
    var tpl = expect.compile({ val: {index: [false, INDEX]} })
    expect.exec(tpl, {}).then((result) => {
      assert.equal(result.error, false, 'Optional fields raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      done()
    }).catch(done)
  })
  it('should enforce validation', (done) => {
    var tpl = expect.compile({ val: {index: [INDEX, 1]} })
    expect.exec(tpl, {val: 1}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: 1}, 'Invalid output')
      return expect.exec(tpl, {val: '2'})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {val: 2}, 'Invalid output')
      return expect.exec(tpl, {val: '0'})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return expect.exec(tpl, {val: 3})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return done()
    }).catch(done)
  })
  it('should return default if optional and input is invalid', (done) => {
    var tpl = expect.compile({ val: {index: [false, INDEX, 1, 1]} })
    expect.exec(tpl, { val: 0 }).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {val: 1}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should be undefined if default is not defined, field is optional and input is invalid', (done) => {
    var tpl = expect.compile({ val: {index: [false, INDEX, 1]} })
    expect.exec(tpl, {val: 5}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      return done()
    }).catch(done)
  })
})