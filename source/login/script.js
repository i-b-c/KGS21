var userProfile

function allStorage() {
    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;
    while (i--) {
        values.push(localStorage.getItem(keys[i]));
    }
    console.log("Localstorage ", values)
}

document.onload = allStorage()

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
        userProfile = data
        let token = data.jwt
        localStorage.setItem("ACCESS_TOKEN", token)
        localStorage.removeItem("provider")
        // document.dispatchEvent(userProfileLoadedEvent)
        console.log(userProfile);
        if (userProfile.user.blocked || !userProfile.user.confirmed) {
            accountStatus = false
        }
    } else {
        var errorResponse = await response.json()
        var errors = []
        console.log("response: ", errorResponse)
        for (err of errorResponse.message) {
            for (messageId of err.messages) {
                errors.push(messageId.id)
            }
        }

        console.log("errors: ", errors)
    }

}

//Auth.advanced.allow_register => Register action is actualy not available.
//Auth.form.error.email.taken => Email is already taken.

if (localStorage.getItem("provider")) {
    GetCallback(localStorage.getItem("provider"))
}


// näidis funktsioon kasutaja data tõmbamiseks strapist


// DELETE /users/:id --> Delete existing user

// PUT /users/:id  --> Update an existing user
//minu id on 40
async function saveUserInfo(userId) {
    if (validToken) {
        let userInfo =
            JSON.stringify({
                "firstName": document.getElementById('firstName'),
                "lastName": document.getElementById('lastName')
            });

        let requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
            },
            body: userInfo,
        };

        fetch("https://a.saal.ee/users/" + userId, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));


    } else {
        console.log("oled sisse logimata")
    }
}