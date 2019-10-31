import requestPromise from 'request-promise'
import assert from 'assert'
import { getAuthToken } from '../../../tests/get-auth-token'
import { gitHash, gitBranch, nodeVersion, packageVersion, isIsoDate } from '../../../tests/environment'

describe('Agency options', function() {
  it('successfully initializes', async function() {
    const res = await requestPromise({
      url: 'http://localhost/agency',
      auth: {
        bearer: getAuthToken('', {
          scope: "admin:all test:all"
        }, '')
      },
      method: 'OPTIONS',
      json: true,
      resolveWithFullResponse: true
    })
    console.log(res.body)
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
    assert.strictEqual(res.headers['server'], 'istio-envoy')
    assert.strictEqual(res.body.name, "@container-images/mds-agency")
    assert.strictEqual(res.body.version, packageVersion('mds-agency'))
    assert.strictEqual(isIsoDate(res.body.build.date), true)
    assert.strictEqual(res.body.build.branch, gitBranch())
    assert.strictEqual(res.body.build.commit, gitHash())
    assert.strictEqual(`v${res.body.node}`, nodeVersion())
    assert.strictEqual(res.body.status, "Running")
  })
})