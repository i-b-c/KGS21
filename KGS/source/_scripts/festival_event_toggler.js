// Toggles event "Today" text
function festivalEventsToggler() {
    var eventsElems = document.querySelectorAll('[type-name="event"]')
    var currentDate = new Date()

    var currentMontDate = currentDate.getFullYear() + '.' + currentDate.getMonth() + '.' + currentDate.getDate()

    for (var ix in eventsElems) {
        if (eventsElems.hasOwnProperty(ix)) {
            var element = eventsElems[ix]

            var eventId = element.getAttribute('id')
            var eventStart = element.getAttribute('start-time')
            var eventStartDate = null

            if (eventStart) {
                eventStartDate = new Date(eventStart)
                var eventMonthAndDate = eventStartDate.getFullYear() + '.' + eventStartDate.getMonth() + '.' + eventStartDate.getDate()
                var todayText = document.getElementById('today-' + eventId)
                if (eventMonthAndDate === currentMontDate) {
                    todayText.style.display = ''
                }
            }
        }
    }

}