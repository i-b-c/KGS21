
if(validToken){
    showUserInfo()
    document.getElementById("logged-in-box").style.display = "block"
    document.getElementById("not-logged-in-box").style.display = "none"
}else {
    console.log("pole sisse loginud")
}


document.addEventListener('userProfileLoaded', function(e) {
    console.log("listening to userProfile loaded event in login ")
    try{
        showUserInfo()
    }
    catch(err){
        console.log("error userProfileLoaded evendis: ",err)
    }
})


function loginWithProvider(loginProvider) {
    LogOut()
    localStorage.setItem("provider", loginProvider)
    window.location.replace('https://a.saal.ee/connect/' + loginProvider + '/')
}

async function GetCallback(providerToCall) {
    var requestOptions = {
        method: 'GET',
    }
    const response = await fetch('https://a.saal.ee/auth/' + providerToCall + '/callback' + location.search, requestOptions)
    // fetch('https://a.saal.ee/auth/' + providerToCall + '/callback' + location.search, requestOptions).then(function(response) {
    if (response.ok) {
        const data = await response.json()
        localStorage.setItem("ACCESS_TOKEN", data.jwt)
        localStorage.setItem("USER_PROFILE", JSON.stringify(data.user))
        localStorage.removeItem("provider")
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
                for (messageId of err.messages) {
                    errors.push(messageId.id)
                }
            }
        } catch (err) {
            console.log(err)
        }

        try{
        errors.push(errorResponse.message.detail)
        }catch(err){
            console.log(err)

        }

        console.log("errors: ", errors)
        displayError(errors)
    }
}

const LoginWithEmail = async() => {
    console.log("login sisse emaili ja salasõnaga")
    let email = document.getElementById("logEmail").value
    let psw = document.getElementById("logPsw").value

    let body = JSON.stringify({
        "identifier": email,
        "password": psw
    })
    console.log("saadan body: ", body)

    let requestOptions = {
            'method': 'POST',
            'body': body,
            'headers': {
                'Content-Type': 'application/json'
            }
    }

    console.log(requestOptions)

    let response = await (await fetch('https://a.saal.ee/auth/local', requestOptions))

    if (response.status === 200) {
        console.log("status 200 response is: ", response)
    } else {
        console.log("status not 200 response is: ", response)
    }

    if (response.ok) {
        const data = await response.json()
        localStorage.setItem("ACCESS_TOKEN", data.jwt)
        localStorage.setItem("USER_PROFILE", JSON.stringify(data.user))
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

        try{
        errors.push(errorResponse.message.detail)
        }catch(err){
            console.log(err)

        }

        console.log("errors: ", errors)
        displayError(errors)
    }

}

const RegisterWithEmail = async () => {
    console.log("login sisse emaili ja salasõnaga")
    let email = document.getElementById("regEmail").value
    let psw = document.getElementById("regPsw").value

    let body = JSON.stringify({
        "username": email,
        "email": email,
        "password": psw
    })
    console.log("saadan body: ", body)

    let requestOptions = {
        'method': 'POST',
        'body': body,
        'headers': {
            'Content-Type': 'application/json'
        }
    }

    console.log(requestOptions)


    //siit ei saa erroreid kätte nagu postmanis

    let response = await (fetch('https://a.saal.ee/auth/local/register', requestOptions))

    if (response.statuscode !== 200) {
        const data = await response.json()
    } else {
        let errorResponse = await response.json()
        let errors = []
        console.log("response ", errorResponse)

        try {
            for (err of errorResponse.message) {
                for (messageId of err.messages) {
                    errors.push(messageId.id)
                }
            }
        } catch (err) {
            console.log(err)

        }
        try {
            errors.push(errorResponse.message.detail)
        } catch (err) {
            console.log(err)

        }
        console.log("errors: ", errors)
        displayError(errors)
    }

}


function displayError(errArray){
    for (err of errArray){
        console.log("display", err)
        switch(err){
        case "Key (username)=(tapferm@gmail.com) already exists.":
            document.getElementById("userExists").style.display = "block"
        break
        case "Identifier or password invalid.":
            document.getElementById("invalidPsw").style.display = "block"
            console.log("error oli: ", err)
        break
        case undefined:
            console.log("defineerimata: ", err)
        break
        default:
            document.getElementById("loginError").innerText = errArray
            document.getElementById("loginError").style.display = "block"
        }
    }
}

//Auth.advanced.allow_register => Register action is actualy not available.
//Auth.form.error.email.taken => Email is already taken.
if (localStorage.getItem("provider")) {
    GetCallback(localStorage.getItem("provider"))
}

function showUserInfo() {
    try {
        console.log("showing user info")
        userProfile = JSON.parse(localStorage.getItem("USER_PROFILE"))
        email.innerHTML = userProfile.email
        if (userProfile.firstName) firstName.innerHTML = userProfile.firstName
        if (userProfile.lastName) lastName.innerHTML = userProfile.lastName
        if (userProfile.phoneNumber) phoneNr.innerHTML = userProfile.phoneNumber
    } catch (err) {
        console.log(err)
    }
    document.getElementById("logged-in-box").style.display = "block"
    document.getElementById("not-logged-in-box").style.display = "none"
}

