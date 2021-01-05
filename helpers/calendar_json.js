const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const moment = require('moment-timezone')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const LANGUAGES = ['et', 'en']
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')

const assetsDir = path.join(rootDir, 'assets')
const calendarJsonPath = path.join(assetsDir, 'calendar_json.json')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_EVENTS = STRAPIDATA['Event'].filter(e => !e.hide_from_page)

const eventCalendar = {
  minDate: moment().subtract(1, 'months'),
  maxDate: moment(),
  events: {}
}
for (const event of STRAPIDATA_EVENTS) {
  if(!event.start_time) {
    continue
  }
  const event_moment = moment(event.start_time)
  if (moment(event_moment).isBefore(eventCalendar.minDate)) {
    continue
  }
  if (moment(event_moment).isAfter(eventCalendar.maxDate)) {
    eventCalendar.maxDate = event_moment
  }

  const event_date = event_moment.tz('europe/tallinn').format('YYYY-M-D')
  // console.log({'event.id': event.id, 'event.start_time': event.start_time, event_date})
  eventCalendar.events[event_date] = eventCalendar.events[event_date] || []
  eventCalendar.events[event_date].push({
    eid: event.id,
    tag: [event.type],
    controller: 'performance',
    name: {
      et: event.performance_name_et,
      en: event.performance_name_en
    },
    time: event_moment.tz('europe/tallinn').format('HH:mm'),
    location: {
      et: event.location_et,
      en: event.location_en
    }
  })
}
eventCalendar.minDate = eventCalendar.minDate.format('YYYY-M-D')
eventCalendar.maxDate = eventCalendar.maxDate.format('YYYY-M-D')
fs.writeFileSync(calendarJsonPath, JSON.stringify(eventCalendar, null, 4), options = {})
