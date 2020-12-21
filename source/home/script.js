let eventsElems = document.querySelectorAll('[type-name="event"]')
let currentDate = new Date()
let currentMontDate = `${currentDate.getMonth()}.${currentDate.getDate()}`
let nextThreeDays = new Date()
// let pastTwoDays = new Date()

// pastTwoDays.setDate(pastTwoDays.getDate() - 2)
nextThreeDays.setDate(nextThreeDays.getDate() + 3)
nextThreeDays.setHours(23, 59, 99);

for (eventElem of eventsElems) {
    let eventId = eventElem.getAttribute('id')
    let eventStart = eventElem.getAttribute('start-time')
    let eventPrem = eventElem.getAttribute('premiere-time')
    let eventStartDate = null
    // let eventPremDate = new Date(eventStart)

    if (eventStart) {
        eventStartDate = new Date(eventStart)
        let eventMonthAndDate = `${eventStartDate.getMonth()}.${eventStartDate.getDate()}`
        let todayText = document.getElementById(`today-${eventId}`)
        if (eventMonthAndDate === currentMontDate) {
            console.log('⛔️', eventId, eventStart, eventPrem);
            todayText.style.display = ''
        }
    }

    if (eventStartDate && eventStartDate >= currentDate && eventStartDate <= nextThreeDays) {
        eventElem.style.display = ''
        console.log(currentDate, ' - ', eventStartDate, ' - ', nextThreeDays)
    }
}