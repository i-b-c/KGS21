function performanceEventToggler(timing) {
    var eventElement = document.querySelectorAll('[event_type="' + timing + '"]')

    var currentTime = new Date()

    console.log(timing);

    for( var event in eventElement){

        if ( timing === 'future_events'){

            if (eventElement.hasOwnProperty(event) && currentTime >= new Date(eventElement[event].getAttribute('start_time'))){

                eventElement[event].style.display='none'
            }
        }

        if ( timing === 'past_events'){

            if (eventElement.hasOwnProperty(event) && currentTime <= new Date(eventElement[event].getAttribute('start_time'))){

                eventElement[event].style.display='none'
            }
        }

    }
}