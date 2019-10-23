/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import express from 'express'

import { pathsFor } from '@mds-core/mds-utils'
import { checkAccess, ApiRequest, ApiResponse } from '@mds-core/mds-api-server'
import { getProviderMetrics } from '../metrics-log-utils'

async function mdsTestingShimMiddleware(req: ApiRequest, res: ApiResponse, next: Function) {
  if (!process.env.IS_TEST || !req.path.includes('/test')) {
    return res.status(401).send('Unauthorized, not test env')
  }
}

function api(app: express.Express): express.Express {
  app.use(mdsTestingShimMiddleware)
  app.get(pathsFor('/test/fire_metrics_sheet'), checkAccess(() => true), async (req, res) => {
    console.log('fire it!')
    const providerMetrics = await getProviderMetrics(0)
    return res.status(200).send(providerMetrics)
  })
  return app
}

export { mdsTestingShimMiddleware, api }
