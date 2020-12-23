
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
    document.getElementById("loginError").innerText = errArray
    document.getElementById("loginError").style.display = "block"
}

//Auth.advanced.allow_register => Register action is actualy not available.
//Auth.form.error.email.taken => Email is already taken.
if (localStorage.getItem("provider")) {
    GetCallback(localStorage.getItem("provider"))
}

