
function validateEmail(element_id) {
    // console.log('emailv')
    var email = document.getElementById(element_id)
    var emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRe.test(String(email.value).toLowerCase())) {
        emailHelp.classList.remove("valid")
        emailHelp.classList.add("invalid")
        return false
    }
    else {
        emailHelp.classList.remove("invalid")
        emailHelp.classList.add("valid")
        return true
    }
}

function validatePsw(element_id) {
    var psw = document.getElementById(element_id)
    if (psw.value === "") {
        pswHelp.classList.remove("valid")
        pswHelp.classList.add("invalid")
        return false
    }

    var pswdRe = /^.{8,}$/

    if (!pswdRe.test(String(psw.value))) {
        pswHelp.classList.remove("valid")
        pswHelp.classList.add("invalid")
        return true
    }
    else {
        pswHelp.classList.remove("invalid")
        pswHelp.classList.add("valid")

        return true
    }
}

function validatePswRep(psw1_id, psw2_id) {
    var psw1 = document.getElementById(psw1_id)
    var psw2= document.getElementById(psw2_id)
    if (psw2.value === "") {
        psw2Help.classList.remove("valid")
        psw2Help.classList.add("invalid")
        return false
    }

    if (psw1.value !== psw2.value) {
        psw2Help.classList.remove("valid")
        psw2Help.classList.add("invalid")
        return false
    } else {
        psw2Help.classList.remove("invalid")
        psw2Help.classList.add("valid")
        return true
    }
}

function validateFirstName(element_id) {
    var firstName = document.getElementById(element_id)
    if (firstName.value == "" || firstName.value.length < 2 || !isNaN(firstName.value)) {
        firstNameHelp.classList.remove("valid")
        firstNameHelp.classList.add("invalid")
        return false
    }
    firstNameHelp.classList.remove("invalid")
    firstNameHelp.classList.add("valid")
    return true
}

function validateLastName(element_id) {
    var lastName = document.getElementById(element_id)
    if (lastName.value === "" || lastName.value.length < 2 || !isNaN(lastName.value)) {
        lastNameHelp.classList.remove("valid")
        lastNameHelp.classList.add("invalid")
        return false
    }
    lastNameHelp.classList.remove("invalid")
    lastNameHelp.classList.add("valid")
    return true
}


function validateBDay(element_id) {
    var dob = document.getElementById(element_id)
    if (dob.value === "") {
        dobHelp.classList.remove("valid")
        dobHelp.classList.add("invalid")
        return false
    }

    var userAge = getAge(dob.value)
    if (userAge > 12 && userAge < 116) {
        dobHelp.classList.remove("invalid")
        dobHelp.classList.add("valid")
        return true
    } else {
        dobHelp.classList.remove("valid")
        dobHelp.classList.add("invalid")
        return false
    }
}

function validateDate(element_id) {
    // console.log('validateDate ', element_id);

    var date = document.getElementById(element_id)
    var dateRe = new RegExp(
        '^(' +
        '([0-9]{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01]))' + // 1977-11-23
        '|((0[1-9]|1[012])[- \\/.](0[1-9]|[12][0-9]|3[01])[- \\/.](19|20)[0-9][0-9])' + // 11-19-2004 11/19/2004 11.19.2004
        '|((0[1-9]|[12][0-9]|3[01])[- \\/.](0[1-9]|1[012])[- \\/.](19|20)[0-9][0-9])'+  // 19-11-2004 ...
        ')$'
        )
    if (date.value === "") {
        dateHelp.classList.remove("valid")
        dateHelp.classList.add("invalid")
        return false
    }
    if (!dateRe.test(String(date.value) )) {
        dateHelp.classList.remove("valid")
        dateHelp.classList.add("invalid")
        return true
    }
    else {
        dateHelp.classList.remove("invalid")
        dateHelp.classList.add("valid")
        return true
    }
}

function validatePhoneNr(element_id) {
    var phoneNr = document.getElementById(element_id)
    if (phoneNr.value === "") {

        phoneNrHelp.classList.remove("valid")
        phoneNrHelp.classList.add("invalid")
        return false
    }

    // because of https://bit.ly/37WS3X5
    var phoneRe = /^\+?([0-9]\x20?){7,15}$/

    if (!phoneRe.test(String(phoneNr.value))) {
        phoneNrHelp.classList.remove("valid")
        phoneNrHelp.classList.add("invalid")
        return true
    }
    else {
        phoneNrHelp.classList.remove("invalid")
        phoneNrHelp.classList.add("valid")
        return true
    }

}

