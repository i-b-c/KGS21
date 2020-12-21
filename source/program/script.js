let eventsElems = document.querySelectorAll('[type-name="event"]')
let currentDate = new Date()
let currentMonthDate = `${currentDate.getMonth()}.${currentDate.getDate()}`
let monthPrevious = new Date(currentDate.getFullYear(), currentDate.getMonth()-1)
let monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth())
let monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth()+1)
let yearMonthText = document.getElementById(`year-month`)
let previousMonthBtn = document.getElementById(`previous-month`)
let nextMonthBtn = document.getElementById(`next-month`)
let lang = document.getElementById(`lang`).getAttribute('lang-is')
let eventsTimesArray = []
let maxDate = null;
let minDate = null;

let lastMonth = eventsElems

function toggleMonth(upDown = '') {
    if (upDown === '+') {
        monthPrevious.setMonth(monthPrevious.getMonth()+1)
        monthStart.setMonth(monthStart.getMonth()+1)
        monthEnd.setMonth(monthEnd.getMonth()+1)
    } else if (upDown === '-') {
        monthPrevious.setMonth(monthPrevious.getMonth()-1)
        monthStart.setMonth(monthStart.getMonth()-1)
        monthEnd.setMonth(monthEnd.getMonth()-1)
    }

    toggleEvents()
}

function toggleEvents() {
    let createArray = false

    if (!eventsTimesArray.length) {
        createArray = true
    }

    for (eventElem of eventsElems) {
        let eventId = eventElem.getAttribute('id')
        let eventStart = eventElem.getAttribute('start-time')
        let eventPrem = eventElem.getAttribute('premiere-time')
        let eventStartDate = null

        // let eventPremDate = new Date(eventStart)

        if (eventStart) {
            eventStartDate = new Date(eventStart)

            let eventMonthAndDate = `${eventStartDate.getMonth()}.${eventStartDate.getDate()}`

            if (createArray) {
                eventsTimesArray.push(eventStartDate.getTime())
            }

            let todayText = document.getElementById(`today-${eventId}`)
            if (eventMonthAndDate === currentMonthDate) {
                // console.log('⛔️', eventId, eventStart, eventPrem);
                todayText.style.display = ''
            }

        }

        if (eventStartDate && eventStartDate > monthStart && eventStartDate < monthEnd) {
            eventElem.style.display = ''
        } else {
            eventElem.style.display = 'none'
        }
    }

    setYearMonthTextAndBtns()
}

function setYearMonthTextAndBtns() {

    if (!maxDate || !minDate) {
        maxDate = Math.max(...eventsTimesArray);
        minDate = Math.min(...eventsTimesArray);
    }

    if (eventsTimesArray.length && monthPrevious.getTime() >= minDate) {
        previousMonthBtn.innerHTML = `&larr; ${monthPrevious.getFullYear()} ${monthPrevious.toLocaleString(lang, { month: 'long' })}`
        previousMonthBtn.style.display = ''
    } else {
        previousMonthBtn.style.display = 'none'
    }


    if (eventsTimesArray.length && monthEnd.getTime() <= maxDate) {
        nextMonthBtn.innerHTML = `${monthEnd.getFullYear()} ${monthEnd.toLocaleString(lang, { month: 'long' })} &rarr;`
        nextMonthBtn.style.display = ''
    } else {
        nextMonthBtn.style.display = 'none'
    }


    yearMonthText.innerHTML = `${monthStart.toLocaleString('default', { month: 'long' })} ${monthStart.getFullYear()} `
}

toggleMonth()