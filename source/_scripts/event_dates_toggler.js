function performanceEventToggler(timing) {
    var eventElement = document.querySelectorAll('[event_type="' + timing + '"]')
    var futureEventCount = 0
    var currentTime = new Date()

    for( var event in eventElement){

        if ( timing === 'future_events'){

            if (eventElement.hasOwnProperty(event) && currentTime >= new Date(eventElement[event].getAttribute('start_time'))){
                eventElement[event].style.display='none'
            } else if (eventElement.hasOwnProperty(event) && currentTime <= new Date(eventElement[event].getAttribute('start_time'))) {
                futureEventCount++
            }

        }

        if ( timing === 'past_events'){

            if (eventElement.hasOwnProperty(event) && currentTime <= new Date(eventElement[event].getAttribute('start_time'))){

                eventElement[event].style.display='none'
            }

        }

    }

    if (futureEventCount > 0) {
        var br = document.createElement("br");
        var futureEventsEl = document.querySelector('.coming')
        futureEventsEl.appendChild(br);
        futureEventsEl.appendChild(br.cloneNode(true));
    }

}
