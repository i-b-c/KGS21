
function validateEmail(element_id) {
    //kirjuta elementi help div alati sama id + Help
    var help = document.getElementById(element_id+ "Help")
    var email = document.getElementById(element_id).value
    var emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (email === ""){
        help.classList.remove("valid")
        help.classList.add("invalid")
        return false
    }

    if (!emailRe.test(String(email).toLowerCase())) {
        help.classList.remove("valid")
        help.classList.add("invalid")
        return false
    }
    help.classList.remove("invalid")
    help.classList.add("valid")
    return true

}

function validatePsw(element_id) {
    //kirjuta elementi help div alati sama id + Help
    var help = document.getElementById(element_id+ "Help")
    var psw = document.getElementById(element_id).value
    var pswdRe = /^.{8,}$/

    if (psw === "") {
        help.classList.remove("valid")
        help.classList.add("invalid")
        return false
    }

    if (!pswdRe.test(String(psw))) {
        help.classList.remove("valid")
        help.classList.add("invalid")
        return false
    }
    help.classList.remove("invalid")
    help.classList.add("valid")
    return true
}

function validatePswRep(psw1_id, psw2_id) {
    var help = document.getElementById(psw2_id+ "Help")

    var psw1 = document.getElementById(psw1_id)
    var psw2= document.getElementById(psw2_id)
    if (psw2.value === "") {
        help.classList.remove("valid")
        help.classList.add("invalid")
        return false
    }

    if (psw1.value !== psw2.value) {
        help.classList.remove("valid")
        help.classList.add("invalid")
        return false
    }
    help.classList.remove("invalid")
    help.classList.add("valid")
    return true

}
//andmed pole kohustuslikud, kui mõni väli jääb tühjaks ei valideerita
//kui pärast tühjaks kustutad ja salvestad kirjutad straüis tühja väärtusega üle

function validateFirstName(element_id) {
    var help = document.getElementById(element_id+ "Help")
    var firstName = document.getElementById(element_id).value
    if (firstName !== ""){
        if (firstName.length < 2 || !isNaN(firstName)) {
            help.classList.remove("valid")
            help.classList.add("invalid")
            return false
        }
    }
    help.classList.remove("invalid")
    help.classList.add("valid")
    return true
}

function validateLastName(element_id) {
    var help = document.getElementById(element_id+ "Help")
    var lastName = document.getElementById(element_id).value
    if(lastName !== ""){
        if (lastName.length < 2 || !isNaN(lastName)) {
            help.classList.remove("valid")
            help.classList.add("invalid")
            return false
        }
    }

    help.classList.remove("invalid")
    help.classList.add("valid")
    return true
}


function validatePhoneNr(element_id) {
    var help = document.getElementById(element_id+ "Help")
    var phoneNr = document.getElementById(element_id).value

    // because of https://bit.ly/37WS3X5
    var phoneRe = /^\+?([0-9]\x20?){7,15}$/
    if (phoneNr !== "") {
        if (!phoneRe.test(String(phoneNr))) {
            help.classList.remove("valid")
            help.classList.add("invalid")
            return false
        }
    }

    help.classList.remove("invalid")
    help.classList.add("valid")
    return true


}

