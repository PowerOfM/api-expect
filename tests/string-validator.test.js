const assert = require('chai').assert
const expect = require('../index')

/* global describe, it */

describe('String Validator', () => {
  it('should not raise an error if optional', (done) => {
    var tpl = expect.compile({ shortHand: '~string', longForm: {string: [false]} })
    expect.exec(tpl, {}).then((result) => {
      assert.equal(result.error, false, 'Optional fields raised an error.')
      assert.deepEqual(result.output, {}, 'Invalid output')
      done()
    }).catch(done)
  })
  it('should enforce limits', (done) => {
    var tpl = expect.compile({ str: 'string:5:6' })
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
    var tpl = expect.compile({ str: '~string:2:3:ab' })
    expect.exec(tpl, {str: ''}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {str: 'ab'}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should be undefined if default is not defined, field is optional and input is invalid', (done) => {
    var tpl = expect.compile({ str: '~string:2:3' })
    expect.exec(tpl, {str: 'adfgeawrt'}).then((result) => {
      assert.equal(result.error, false, 'Optional field raised an error')
      assert.deepEqual(result.output, {}, 'Invalid output')
      return done()
    }).catch(done)
  })
  it('should santize strings', (done) => {
    var tpl = expect.compile({ str: 'string' })
    expect.exec(tpl, {str: '<div onclick="alert(\'xss\')">yo</div><script>alert(\'xss\')</script>'}).then((result) => {
      assert.equal(result.error, false, 'Valid input raised an error')
      assert.deepEqual(result.output, {str: '&lt;div onclick=&quot;alert(&#39;xss&#39;)&quot;&gt;yo&lt;&#x2F;div&gt;&lt;script&gt;alert(&#39;xss&#39;)&lt;&#x2F;script&gt;'}, 'Invalid output')
      return done()
    }).catch(done)
  })
})
