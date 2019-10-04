let service_areas = require('./service-areas.js')
let turf_main = require('@turf/helpers')
let turf = require('@turf/boolean-point-in-polygon')

const log = require('loglevel')

let district_areas = {}
for (let index in service_areas['features']) {
  let district_uuid =
    service_areas['features'][index]['properties']['dist_uuid']
  let area = service_areas['features'][index]['geometry']['coordinates']
  // still servicing
  district_areas[district_uuid] = service_areas['features'][index] // turf_main.polygon(area[0]));
}

let findServiceAreas = function(lng, lat) {
  let areas = []
  let turf_pt = turf_main.point([lng, lat])
  for (let key in district_areas) {
    if (turf.default(turf_pt, district_areas[key])) {
      areas.push({ id: key, type: 'district' })
    }
  }
  return areas
}

let moved = function(first_data, second_data) {
  let limit = 0.00001 // arbitrary amount
  let lat_diff = Math.abs(first_data.latitude - second_data.latitude)
  let lng_diff = Math.abs(first_data.longitude - second_data.longitude)
  return lng_diff > limit || lat_diff > limit // very computational efficient basic check (better than sqrts & trig)
}

// Helper funtion to calculate distance between two points given latitudes and longitudes
// Unit is default miles but can be expressed in kilometers given the value 'K'
function gpsDistance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0
  } else {
    let radlat1 = (Math.PI * lat1) / 180
    let radlat2 = (Math.PI * lat2) / 180
    let theta = lon1 - lon2
    let radtheta = (Math.PI * theta) / 180
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    if (dist > 1) {
      dist = 1
    }
    dist = Math.acos(dist)
    dist = (dist * 180) / Math.PI
    dist = dist * 60 * 1.1515
    if (unit === 'K') {
      dist = dist * 1.609344
    }
    return dist
  }
}

let calcTotalDist = function(telemetry, start_gps) {
  let temp_x = start_gps.lat
  let temp_y = start_gps.lng
  let distance = 0
  for (let n in telemetry) {
    for (let m in telemetry[n]) {
      let curr_ping = telemetry[n][m]
      distance += gpsDistance(
        curr_ping.latitude,
        curr_ping.longitude,
        temp_x,
        temp_y
      )
      temp_x = curr_ping.latitude
      temp_y = curr_ping.longitude
    }
  }
  return distance
}

module.exports = {
  findServiceAreas,
  moved,
  calcTotalDist
}