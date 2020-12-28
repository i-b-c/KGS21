let eventsElems = document.querySelectorAll('[type-name="event"]')
let currentDate = new Date()
let currentMontDate = `${currentDate.getMonth()}.${currentDate.getDate()}`

let limitCount = 3
let counter = 0
for (eventElem of eventsElems) {
    let eventId = eventElem.getAttribute('id')
    let eventStart = eventElem.getAttribute('start-time')
    let eventStartDate = null
    // let eventPremDate = new Date(eventStart)

    if (eventStart) {
        eventStartDate = new Date(eventStart)
        let eventMonthAndDate = `${eventStartDate.getMonth()}.${eventStartDate.getDate()}`
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