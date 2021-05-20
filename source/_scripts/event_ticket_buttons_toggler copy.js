function toggleEventButtons() {
    var eventElement = document.querySelectorAll('[type-name="ticket-button"]')
    var currentTime = new Date()

    for(var event in eventElement){

        if (eventElement.hasOwnProperty(event) && eventElement[event].getAttribute('event-sales-status') === 'online' && eventElement[event].getAttribute('event-end')
            && currentTime <= new Date(eventElement[event].getAttribute('event-end'))) {
            eventElement[event].style.display = ''
        } else
        if (eventElement.hasOwnProperty(event) && currentTime <= new Date(eventElement[event].getAttribute('event-start'))){
            eventElement[event].style.display = ''
        }

    }
}
