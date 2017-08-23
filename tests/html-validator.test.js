const assert = require('chai').assert
const expect = require('../index')

/* global describe, it */

describe('HTML Validator', () => {
  it('should not raise an error if optional', (done) => {
    var tpl = expect.compile({ shortHand: '~html', longForm: {html: [false]} })
    expect.exec(tpl, {}).then((result) => {
      assert.equal(result.error, false, 'Optional fields raised an error.')
      assert.deepEqual(result.output, {}, 'Invalid output')
      done()
    }).catch(done)
  })
  it('should enforce limits', (done) => {
    var tpl = expect.compile({ str: 'html:5:6' })
    expect.exec(tpl, {str: '12345'}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      return expect.exec(tpl, {str: '123456'})
    }).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      return expect.exec(tpl, {str: '1234'})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return expect.exec(tpl, {str: '1234567'})
    }).then((result) => {
      assert.equal(result.error, true, 'Invalid input did not raise an error')
      return done()
    }).catch(done)
  })
  it('should return default if optional and input is invalid', (done) => {
    var tpl = expect.compile({ str: '~html:2:3:<b>a<b/>' })
    expect.exec(tpl, {str: '<span>toolong</span>'}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {str: '<b>a<b/>'}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should be undefined if default is not defined, field is optional and input is invalid', (done) => {
    var tpl = expect.compile({ str: '~html:2:3' })
    expect.exec(tpl, {str: 'adfgeawrt'}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should santize dangerous html strings', (done) => {
    var tpl = expect.compile({ str: 'html' })
    expect.exec(tpl, {str: '<div onclick="alert(\'xss\')">yo</div><script>alert(\'xss\')</script>'}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {str: '<div>yo</div>'}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should not santize allow html tags in strings', (done) => {
    var tpl = expect.compile({ str: 'html' })
    expect.exec(tpl, {str: '<div onclick="alert(\'xss\')"><b>yo</b></div><ul><li>A</li><li>B</li></ul>'}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {str: '<div><b>yo</b></div><ul><li>A</li><li>B</li></ul>'}, 'Invalid output')
      return done()
    }).catch(done)
  })
})
