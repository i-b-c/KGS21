
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
//andmed pole kohustuslikud, kui mõni väli jääb tühjaks ei valideerita
//kui pärast tühjaks kustutad ja salvestad kirjutad straüis tühja väärtusega üle

function validateFirstName(element_id) {
    var firstName = document.getElementById(element_id).value
    if (firstName !== ""){
        if (firstName.length < 2 || !isNaN(firstName)) {
            firstNameHelp.classList.remove("valid")
            firstNameHelp.classList.add("invalid")
            return false
        }
    }
    firstNameHelp.classList.remove("invalid")
    firstNameHelp.classList.add("valid")
    return true
}

function validateLastName(element_id) {
    var lastName = document.getElementById(element_id).value
    if(lastName !== ""){
        if (lastName.length < 2 || !isNaN(lastName)) {
            lastNameHelp.classList.remove("valid")
            lastNameHelp.classList.add("invalid")
            return false
        }
    }

    lastNameHelp.classList.remove("invalid")
    lastNameHelp.classList.add("valid")
    return true
}


function validatePhoneNr(element_id) {
    var phoneNr = document.getElementById(element_id).value

    // because of https://bit.ly/37WS3X5
    var phoneRe = /^\+?([0-9]\x20?){7,15}$/
    if (phoneNr !== "") {
        if (!phoneRe.test(String(phoneNr))) {
            phoneNrHelp.classList.remove("valid")
            phoneNrHelp.classList.add("invalid")
            return false
        }
    }

    phoneNrHelp.classList.remove("invalid")
    phoneNrHelp.classList.add("valid")
    return true


}

