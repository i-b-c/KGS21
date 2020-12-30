const validatePswForm = () => {

    var errors = []

    if (Psw && !validatePsw("Psw")) {
        errors.push('Missing or invalid password')
    }

    if (PswRepeat && !validatePswRep("Psw", "PswRepeat")) {
        errors.push('Missing or invalid password repeat')
    }

    // console.log(errors)
    if (errors.length === 0) {
        SendNewPassword()
        console.log("valideerimine õnnestus saadan profiili Strapisse")
    }else {
        console.log(errors)
        displayError(errors)
    }
}

const SendNewPassword = async () => {
    console.log("lähtestan parooli")
    let code = location.search.split("=")[1]
    let psw = document.getElementById("Psw").value
    let pswRepeat = document.getElementById("PswRepeat").value

    let body = JSON.stringify({
        "code": code, // code contained in the reset link of step 3.
        "password": psw,
        "passwordConfirmation": pswRepeat
    })

    let requestOptions = {
        'method': 'POST',
        'body': body,
        'headers': {
            'Content-Type': 'application/json'
        }
    }

    console.log(requestOptions)
    let response = await (fetch('https://a.saal.ee/auth/reset-password', requestOptions))

    if (response.ok) {
        const data = await response.json()
        console.log(data)
        console.log("uus salasõna saadetud, mine sisse logima")
        localStorage.setItem("ACCESS_TOKEN", data.jwt)
        localStorage.setItem("USER_PROFILE", JSON.stringify(data.user))
        localStorage.setItem("initials", makeInitials(data.user))
        document.dispatchEvent(userProfileLoadedEvent)
        if (userProfile.blocked || !userProfile.confirmed) {
            accountStatus = false
        }
        validateToken()
    } else {
        var errorResponse = await response.json()
        var errors = []
        console.log("response: ", errorResponse)
        try {
            for (err of errorResponse.message) {
                for (message of err.messages) {
                    errors.push(message.message)
                }
            }
        } catch (err) {
            console.log(err)
        }

        console.log("errors: ", errors)
        displayError(errors)
    }
}