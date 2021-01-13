const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const moment = require('moment-timezone')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const typesToInclude = ['program', 'tour', 'festival']

const assetsDir = path.join(rootDir, 'assets')
const calendarJsonPath = path.join(assetsDir, 'calendar_json.json')
const strapiDataDirPath = path.join(fetchDir, 'strapidata')
const strapiDataEventsPath = path.join(strapiDataDirPath, 'Event.yaml')

const STRAPIDATA_EVENTS = yaml.safeLoad(fs.readFileSync(strapiDataEventsPath, 'utf8'))
                            .filter(e => !e.hide_from_page && (typesToInclude.includes(e.type)))

const eventCalendar = {
  minDate: moment().subtract(2, 'months').set('date', 1),
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

  let performance_name_et = event.performance.name_et ? event.performance.name_et : (event.name_et ? event.name_et : (event.performance.X_headline_et || ''))
  let performance_name_en = event.performance.name_en ? event.performance.name_en : (event.name_en ? event.name_en : (event.performance.X_headline_en || ''))

  eventCalendar.events[event_date].push({
    eid: event.performance.remote_id,
    tag: [event.type === 'program' ? 'event' : event.type],
    controller: 'performance',
    name: {
      et: performance_name_et,
      en: performance_name_en
    },
    time: event_moment.tz('europe/tallinn').format('HH:mm'),
    location: event.location ? {
      et:  event.location.name_et,
      en: event.location.name_en
    } : {
      et: '',
      en: ''
    }
  })
}
eventCalendar.minDate = eventCalendar.minDate.format('YYYY-M-D')
eventCalendar.maxDate = eventCalendar.maxDate.format('YYYY-M-D')
fs.writeFileSync(calendarJsonPath, JSON.stringify(eventCalendar, null, 4), options = {})
