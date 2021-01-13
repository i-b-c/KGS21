function toggleEventButtons() {
    var eventElement = document.querySelectorAll('[type-name="ticket-button"]')
    var currentTime = new Date()

    for(var event in eventElement){

        if (eventElement.hasOwnProperty(event) && currentTime <= new Date(eventElement[event].getAttribute('event-start'))){
            eventElement[event].style.display=''
        }

    }
}
