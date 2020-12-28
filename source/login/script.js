
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


function displayError(errArray){
    for (err of errArray){
        console.log(err)
        switch(err){
        case "Key (username)=(tapferm@gmail.com) already exists.":
            document.getElementById("userExists").style.display = "block"
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

