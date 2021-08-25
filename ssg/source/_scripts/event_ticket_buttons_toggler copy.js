function toggleEventButtons() {
    var eventElement = document.querySelectorAll('[type-name="ticket-button"]')
    var currentTime = new Date()

    for (var event in eventElement) {
        if (eventElement.hasOwnProperty(event)) {
            var eventEndTime = new Date(eventElement[event].getAttribute('event-end'))
            var eventStartTime = new Date(eventElement[event].getAttribute('event-start'))
            if (eventElement[event].getAttribute('event-sales-status') === 'online' && eventEndTime
                && currentTime <= eventEndTime) {
                eventElement[event].style.display = ''
            } else if (eventEndTime && currentTime <= eventEndTime) {
                eventElement[event].style.display = ''
            } else if (eventStartTime && currentTime <= eventStartTime) {
                eventElement[event].style.display = ''
            }
        }
    }
}
