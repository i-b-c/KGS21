toggleEvents('program')
toggleEvents('tour')
toggleEvents('residency')

function toggleEvents(type) {
    let eventsElems = document.querySelectorAll(`[type-name="${type}"]`)
    let currentDate = new Date()

    let currentMontDate = `${currentDate.getFullYear()}.${currentDate.getMonth()}.${currentDate.getDate()}`

    let limitCount = 3
    let counter = 0
    for (eventElem of eventsElems) {
        let eventId = eventElem.getAttribute('id')
        let eventStart = eventElem.getAttribute('start-time')
        let eventEnd = eventElem.getAttribute('end-time')
        let eventStartDate = null


        if (type === 'residency') {

            eventEndDate = new Date(eventEnd)

            if (counter < limitCount && eventEndDate && eventEndDate >= currentDate) {
                counter++
                eventElem.style.display = ''
            }

        } else {

            if (eventStart) {
                eventStartDate = new Date(eventStart)
                let eventMonthAndDate = `${eventStartDate.getFullYear()}.${eventStartDate.getMonth()}.${eventStartDate.getDate()}`
                let todayText = document.getElementById(`today-${eventId}`)
                if (eventMonthAndDate === currentMontDate) {
                    todayText.style.display = ''
                }
            }

            if (counter < limitCount && eventStartDate && eventStartDate >= currentDate) {
                counter++
                eventElem.style.display = ''
            }

        }

    }
}
