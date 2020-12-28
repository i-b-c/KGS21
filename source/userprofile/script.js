if(validToken){
    fillUserForm()
}else {
    window.open(`${location.origin}/${langpath}login`, '_self')
    saveUrl()
}

function fillUserForm() {
    try {
        console.log("filling user form")
        userProfile = JSON.parse(localStorage.getItem("USER_PROFILE"))
        email.innerHTML = userProfile.email
        if (userProfile.firstName) firstName.value = userProfile.firstName
        if (userProfile.lastName) lastName.value = userProfile.lastName
        if (userProfile.phoneNumber) phoneNr.value = userProfile.phoneNumber
    } catch (err) {
        console.log(err)
    }
}

async function sendUserProfile() {
    console.log("sending user profile")

    let userToSend = JSON.stringify({
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
    })

    console.log("kasutaja profiil mida saadan ", userToSend);

    let requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
                'Content-Type': "application/json"
            },
            body: userToSend,
        };

    let response = await (await fetch('https://a.saal.ee/users/me/', requestOptions))

    if (response.status === 200){
        console.log(response)
        document.getElementById('profileSent').style.display = 'block'
        if (localStorage.getItem('url')) {
            window.open(localStorage.getItem('url'), '_self')
            localStorage.removeItem('url')
        }
        GetUserInfo()
    } else {
        document.getElementById('profileNotSent').style.display = 'block'
    }

        // fetch(`https://a.saal.ee/users/updateme/${userProfile.id}`, requestOptions)
        //     .then(response => response.text())
        //     .then(result => {
        //         console.log(result)
        //         GetUserInfo()
        //         location.reload()
        //     })
        //     .catch(error => console.log('error', error));
}



function validateForm() {

    var errors = []

    if (document.getElementById('profileSent')) {
        document.getElementById('profileSent').style.display = 'none'
    }
    // kui pole lisatud endmeid pole mõtet saata
    if(!validateFirstName("firstName") || !validateLastName("lastName") || !validatePhoneNr("phoneNr")){
        errors.push('No data to send')
    }

    // if (!validateFirstName("firstName")) {
    //     errors.push('Missing firstname')
    // }

    // if (!validateLastName("lastName")) {
    //     errors.push('Missing lastname')
    // }

    // // if (!validateBDay("dob")) {
    // //     errors.push('Missing or invalid date of birth')
    // // }

    // // if (!validateDate("dob")) {
    // //     errors.push('Missing or invalid date of birth wrong format')
    // // }

    // if (!validatePhoneNr("phoneNr")) {
    //     errors.push('Missing phonenumber')
    // }

    // console.log(errors)
    if (errors.length === 0) {
        sendUserProfile()
        console.log("valideerimine õnnestus saadan profiili Strapisse")
    }
}

window.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        // console.log("ENTER")
        validateForm()
    }
})



