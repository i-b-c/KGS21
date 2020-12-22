// function allStorage() {
//     var values = [],
//         keys = Object.keys(localStorage),
//         i = keys.length;
//     while (i--) {
//         values.push(localStorage.getItem(keys[i]));
//     }
//     console.log("Localstorage ", values)
// }

// document.onload = allStorage()

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


// näidis funktsioon kasutaja DATA tõmbamiseks strapist

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


if(localStorage.getItem("USER_PROFILE")){
    fillUserForm()
}


function fillUserForm() {
    email.innerHTML = userProfile.email
    if (userProfile.firstName) firstName.value = userProfile.firstName
    if (userProfile.lastName) lastName.value = userProfile.lastName
    if (userProfile.phoneNumber) phoneNr.value = userProfile.phoneNumber
    // if (userProfile.birthdate) dob.value = userProfile.birthdate
}


async function sendUserProfile() {

    let userToSend = {
        // "username": "tapferm@tlu.ee",
        // "email": "tapferm@tlu.ee",
        // "provider": "google",
        // "confirmed": true,
        // "blocked": null,
        //SELLE SAATMINE TULEB BLOKEERIDA BACKIS
        // "role": {
        //     "id": 3,
        //     "name": "Kasutaja",
        //     "description": "Test ",
        //     "type": "kaustaja"
        // },
        // "created_at": "2020-12-14T13:02:27.465Z",
        // "updated_at": "2020-12-15T14:14:16.995Z",
        "firstName": `${firstName.value}`,
        "lastName": `${lastName.value}`,
        // "person": null,
        "phoneNumber": `${phoneNr.value}`,
        // "favorite_performances": []
    }
    userToSend = JSON.stringify(userToSend)

    console.log("kasutaja profiil mida saadan ", userToSend);

    let requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
                'Content-Type': "application/json"
            },
            body: userToSend,
        };

        fetch(`https://a.saal.ee/users/updateme/${userProfile.id}`, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));


    // let response = await (await fetch(`https://api.poff.ee/profile`, {
    //     method: 'PUT',
    //     headers: {
    //         Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN')
    //     },
    //     body: JSON.stringify(userToSend)
    // })).json()



    // if (response.status) {
    //     document.getElementById('profileSent').style.display = 'block'
    //     if (localStorage.getItem('url')) {
    //         window.open(localStorage.getItem('url'), '_self')
    //         localStorage.removeItem('url')
    //     }

    // }

}



function validateForm() {

    var errors = []

    if (document.getElementById('profileSent')) {
        document.getElementById('profileSent').style.display = 'none'
    }

    if (!validateFirstName("firstName")) {
        errors.push('Missing firstname')
    }

    if (!validateLastName("lastName")) {
        errors.push('Missing lastname')
    }

    // if (!validateBDay("dob")) {
    //     errors.push('Missing or invalid date of birth')
    // }

    // if (!validateDate("dob")) {
    //     errors.push('Missing or invalid date of birth wrong format')
    // }

    if (!validatePhoneNr("phoneNr")) {
        errors.push('Missing phonenumber')
    }

    // console.log(errors)
    if (errors.length === 0) {
        sendUserProfile()
        console.log("profiil Strapisse")
    }
}

window.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        // console.log("ENTER")
        validateForm()
    }
})



