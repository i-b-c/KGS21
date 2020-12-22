let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let eventsElems = document.querySelectorAll('[type-name="event"]')
let currentDate = new Date()
let currentMonthDate = `${currentDate.getFullYear()}.${currentDate.getMonth()}.${currentDate.getDate()}`
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

if (urlParams.getAll.length) {
    if(urlParams.get('m')) {
        let urlDateString = urlParams.get('m').split('.')
        currentDate = new Date(urlDateString[0], urlDateString[1]-1)
        monthPrevious = new Date(currentDate.getFullYear(), currentDate.getMonth()-1)
        monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth())
        monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth()+1)
        toggleMonth()
    }
    if(urlParams.get('c')) {
        let UrlCatsString = urlParams.get('c').split(',')
        for (cat of UrlCatsString) {
            toggleCat(cat)
        }
    }
}

function setUrlParams() {
    let urlParameters = ''
    urlParameters = `?m=${monthStart.getFullYear()}.${monthStart.getMonth()+1}`

    if (hiddenCats.length) {
        let hideCats = hiddenCats.join(',')
        urlParameters = urlParameters + `&c=${hideCats}`
    }

    let page = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    if (urlParameters.length) {
        window.history.pushState('', '', `${page}${urlParameters}`);
    } else {
        window.history.pushState('', document.title, page);
    }
}

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
        let eventCats = eventElem.getAttribute('performance-categories')
        let eventStartDate = null

        // let eventPremDate = new Date(eventStart)

        if (eventStart) {
            eventStartDate = new Date(eventStart)

            let eventMonthAndDate = `${eventStartDate.getFullYear()}.${eventStartDate.getMonth()}.${eventStartDate.getDate()}`

            if (createArray) {
                eventsTimesArray.push(eventStartDate.getTime())
            }

            let todayText = document.getElementById(`today-${eventId}`)
            if (eventMonthAndDate === currentMonthDate) {
                todayText.style.display = ''
            }

        }

        if (eventStartDate && eventStartDate > monthStart && eventStartDate < monthEnd) {

            if (eventCats) {
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

    if (eventsTimesArray.length && monthStart.getTime() >= minDate) {
        previousMonthBtn.innerHTML = previousMonthBtn2.innerHTML = `&larr; ${monthStart.getFullYear()} ${monthStart.toLocaleString(lang, { month: 'long' })}`
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


    setUrlParams()
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

    toggleEvents()

}

toggleMonth()