let eventsElems = document.querySelectorAll('[type-name="event"]')
let currentDate = new Date()
let currentMonthDate = `${currentDate.getMonth()}.${currentDate.getDate()}`
let monthPrevious = new Date(currentDate.getFullYear(), currentDate.getMonth()-1)
let monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth())
let monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth()+1)
let yearMonthText = document.getElementById(`year-month`)
let previousMonthBtn = document.getElementById(`previous-month`)
let previousMonthBtn2 = document.getElementById(`previous-month2`)
let nextMonthBtn = document.getElementById(`next-month`)
let nextMonthBtn2 = document.getElementById(`next-month2`)
let lang = document.getElementById(`lang`).getAttribute('lang-is')
let eventsTimesArray = []
let maxDate = null;
let minDate = null;
let hiddenCats = []

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

function toggleEvents(remoteId = null, catBtnClass = null) {
    let createArray = false

    if (!eventsTimesArray.length) {
        createArray = true
    }

    for (eventElem of eventsElems) {
        let eventId = eventElem.getAttribute('id')
        let eventStart = eventElem.getAttribute('start-time')
        let eventPrem = eventElem.getAttribute('premiere-time')
        let eventCats = eventElem.getAttribute('performance-categories')
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
                todayText.style.display = ''
            }

        }

        if (eventStartDate && eventStartDate > monthStart && eventStartDate < monthEnd) {

            if (remoteId && catBtnClass && eventCats) {
                eventCats = JSON.parse(eventCats)
                if (eventCats.every(r => hiddenCats.includes(r))) {
                    eventElem.style.display = 'none'
                } else {
                    eventElem.style.display = ''
                }
            } else {
                eventElem.style.display = ''
            }

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
        previousMonthBtn.innerHTML = previousMonthBtn2.innerHTML = `&larr; ${monthPrevious.getFullYear()} ${monthPrevious.toLocaleString(lang, { month: 'long' })}`
        previousMonthBtn.style.display = previousMonthBtn2.style.display = ''
    } else {
        previousMonthBtn.style.display = previousMonthBtn2.style.display = 'none'
    }


    if (eventsTimesArray.length && monthEnd.getTime() <= maxDate) {
        nextMonthBtn.innerHTML = nextMonthBtn2.innerHTML = `${monthEnd.getFullYear()} ${monthEnd.toLocaleString(lang, { month: 'long' })} &rarr;`
        nextMonthBtn.style.display = nextMonthBtn2.style.display = ''
    } else {
        nextMonthBtn.style.display = nextMonthBtn2.style.display = 'none'
    }


    yearMonthText.innerHTML = `${monthStart.toLocaleString('default', { month: 'long' })} ${monthStart.getFullYear()} `
}

function toggleCat(remoteId) {
    let catBtn = document.getElementById(remoteId)
    let catBtnClass = catBtn.className

    if(catBtnClass === 'icon-checkmark') {
        catBtnClass = catBtn.className = 'icon-checkmark2'
        hiddenCats.push(`${remoteId}`)
    } else {
        catBtnClass = catBtn.className = 'icon-checkmark'
        hiddenCats = hiddenCats.filter(c => c !== `${remoteId}`)
    }

    toggleEvents(remoteId, catBtnClass)

}

toggleMonth()