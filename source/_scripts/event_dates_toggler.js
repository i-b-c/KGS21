function performanceEventToggler(timing) {
    var eventElement = document.querySelectorAll('[event_type="' + timing + '"]')
    var futureEventCount = 0
    var currentTime = new Date()

    for( var event in eventElement){
        if (eventElement.hasOwnProperty(event)) {

            var eventEnd = eventElement.getAttribute('end-time') || null
            var evendEndDate = eventEnd ? new Date(eventEnd) : null
            var eventStatus = eventElement.getAttribute('sales-status') || null
            var eventStart = eventElement[event].getAttribute('start-time')
            var eventStartTime = eventStart ? new Date(eventStart) : null

            if (timing === 'future_events'){
                console.log(eventEnd, evendEndDate,eventStatus);
                if (eventStartTime && currentTime <= eventStartTime) {
                    futureEventCount++
                } else if (evendEndDate && evendEndDate >= currentTime && eventStatus === 'online') {
                    futureEventCount++
                } else if (eventStartTime && currentTime >= eventStartTime){
                    eventElement[event].style.display='none'
                }
            }

            if ( timing === 'past_events'){
                console.log('past', evendEndDate, currentTime, eventStatus);
                if (evendEndDate && evendEndDate >= currentTime && eventStatus === 'online') {
                    eventElement[event].style.display='none'
                } else if (eventStartTime && currentTime <= eventStartTime){
                    eventElement[event].style.display='none'
                }

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
