import assert from 'assert'
import Sinon from 'sinon'
import log from '@mds-core/mds-logger'
import * as metricsLogUtils from '../metrics-log-utils'
import { getProvider, getLastDayStatsResponse } from './utils'
import { MetricsSheetRow } from '../types'

const getFakeSpreadsheetInstance = () => {
  return {}
}

const getMockedSheet = () => {
  return {
    title: 'fake-sheet-title',
    addRow: Sinon.fake.returns('fake-add-row')
  }
}

const getFakeMetricsSheetRow = (index: number): MetricsSheetRow => {
  return {
    date: 'fake-date',
    name: `fake-name-${index}`,
    registered: 42,
    deployed: 42,
    validtrips: 'fake-validtrips',
    trips: 42,
    servicestart: 42,
    providerdropoff: 42,
    tripstart: 42,
    tripend: 42,
    tripenter: 42,
    tripleave: 42,
    telemetry: 42,
    telemetrysla: 42,
    tripstartsla: 42,
    tripendsla: 42
  }
}

const getFakeRows = (num: number): MetricsSheetRow[] => {
  const fakeRows = []
  for (let i = 0; i < num; i++) {
    fakeRows.push(getFakeMetricsSheetRow(i))
  }
  return fakeRows
}

describe('Metrics Log utils', () => {
  describe('mapProviderToPayload()', () => {
    it('Maps a provider to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      const result = metricsLogUtils.mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 42,
        providerdropoff: 42,
        tripstart: 42,
        tripend: 42,
        tripenter: 42,
        tripleave: 42,
        telemetry: 5,
        telemetrysla: 0.8,
        tripstartsla: 0,
        tripendsla: 0,
        available: 210,
        unavailable: 42,
        reserved: 42,
        trip: 84,
        removed: 126,
        inactive: 42,
        elsewhere: 42
      }
      assert.deepStrictEqual(result, expected)
    })

    it('Maps `lastDayStatsResponse` sans `event_counts_last_24h` to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      lastDayStatsResponse[provider.provider_id].event_counts_last_24h = undefined
      const result = metricsLogUtils.mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 0,
        providerdropoff: 0,
        tripstart: 0,
        tripend: 0,
        tripenter: 0,
        tripleave: 0,
        telemetry: 0,
        telemetrysla: 0,
        tripstartsla: 0,
        tripendsla: 0,
        available: 0,
        unavailable: 0,
        reserved: 0,
        trip: 0,
        removed: 0,
        inactive: 0,
        elsewhere: 0
      }
      assert.deepStrictEqual(result, expected)
    })

    it('Maps `lastDayStatsResponse` sans `late_telemetry_counts_last_24h` to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      lastDayStatsResponse[provider.provider_id].late_telemetry_counts_last_24h = undefined
      const result = metricsLogUtils.mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 42,
        providerdropoff: 42,
        tripstart: 42,
        tripend: 42,
        tripenter: 42,
        tripleave: 42,
        telemetry: 5,
        telemetrysla: 0,
        tripstartsla: 0,
        tripendsla: 0,
        available: 210,
        unavailable: 42,
        reserved: 42,
        trip: 84,
        removed: 126,
        inactive: 42,
        elsewhere: 42
      }
      assert.deepStrictEqual(result, expected)
    })

    it('Maps `lastDayStatsResponse` sans `late_event_counts_last_24h` to the correct payload', () => {
      const provider = getProvider()
      const lastDayStatsResponse = getLastDayStatsResponse(provider.provider_id)
      lastDayStatsResponse[provider.provider_id].late_event_counts_last_24h = undefined
      const result = metricsLogUtils.mapProviderToPayload(provider, lastDayStatsResponse)
      const expected = {
        date: result.date,
        name: 'fake-provider',
        registered: 42,
        deployed: 72,
        validtrips: 'tbd',
        trips: 1,
        servicestart: 42,
        providerdropoff: 42,
        tripstart: 42,
        tripend: 42,
        tripenter: 42,
        tripleave: 42,
        telemetry: 5,
        telemetrysla: 0.8,
        tripstartsla: 0,
        tripendsla: 0,
        available: 210,
        unavailable: 42,
        reserved: 42,
        trip: 84,
        removed: 126,
        inactive: 42,
        elsewhere: 42
      }
      assert.deepStrictEqual(result, expected)
    })
  })

  describe('appendSheet()', () => {
    it('Inserts rows into sheet', async () => {
      const getFakeDocInfo = Sinon.fake.resolves('fake-doc-info')
      Sinon.replace(metricsLogUtils, 'getDocInfo', getFakeDocInfo)
      const fakeSheet = getMockedSheet()
      const getFakeSheet = Sinon.fake.resolves(fakeSheet)
      Sinon.replace(metricsLogUtils, 'getSheet', getFakeSheet)
      const numFakeRows = 10
      const fakeRows = getFakeRows(numFakeRows)
      const fakeLogInfo = Sinon.fake.returns('fake-log-info')
      Sinon.replace(log, 'info', fakeLogInfo)
      const fakePromiseAll = Sinon.fake.returns(Promise.all)
      Sinon.replace(Promise, 'all', fakePromiseAll)
      await metricsLogUtils.appendSheet(fakeSheet.title, fakeRows)
      assert.strictEqual(fakeLogInfo.calledOnceWithExactly(`Wrote ${numFakeRows} rows.`), true)
      assert.strictEqual(fakePromiseAll.calledOnce, true)
      assert.strictEqual(fakeSheet.addRow.callCount, 10)
      Sinon.restore()
    })

    it('Identifies the incorrect sheet', async () => {
      const getFakeDocInfo = Sinon.fake.resolves('fake-doc-info')
      Sinon.replace(metricsLogUtils, 'getDocInfo', getFakeDocInfo)
      const fakeSheet = getMockedSheet()
      const getFakeSheet = Sinon.fake.resolves(fakeSheet)
      Sinon.replace(metricsLogUtils, 'getSheet', getFakeSheet)
      const numFakeRows = 10
      const fakeRows = getFakeRows(numFakeRows)
      const fakeLogInfo = Sinon.fake.returns('fake-log-info')
      Sinon.replace(log, 'info', fakeLogInfo)
      const fakePromiseAll = Sinon.fake.returns(Promise.all)
      Sinon.replace(Promise, 'all', fakePromiseAll)
      await metricsLogUtils.appendSheet('other-sheet-title', fakeRows)
      assert.strictEqual(fakeLogInfo.calledOnceWithExactly('Wrong sheet!'), true)
      assert.strictEqual(fakePromiseAll.callCount, 0)
      assert.strictEqual(fakeSheet.addRow.callCount, 0)
      Sinon.restore()
    })
  })

  it('Loads the doc info correctly', () => {
    const fakeSpreadsheetInstance = getFakeSpreadsheetInstance()
    Sinon.replace(metricsLogUtils, 'getSpreadsheetInstance', Sinon.fake.returns(fakeSpreadsheetInstance))
  })
})
