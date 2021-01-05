let providerToRemove

if (validToken) {
    fillUserForm()
} else {
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
        if (userProfile.provider.includes('google')) google.style.display = ''
        if (userProfile.provider.includes('facebook')) facebook.style.display = ''
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

    if (response.status === 200) {
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
    // if(!validateFirstName("firstName") || !validateLastName("lastName") || !validatePhoneNr("phoneNr")){
    //     errors.push('No data to send')
    // }

    if (!validateFirstName("firstName")) {
        errors.push('Missing firstname')
    }

    if (!validateLastName("lastName")) {
        errors.push('Missing lastname')
    }

    // // if (!validateBDay("dob")) {
    // //     errors.push('Missing or invalid date of birth')
    // // }

    // // if (!validateDate("dob")) {
    // //     errors.push('Missing or invalid date of birth wrong format')
    // // }

    if (!validatePhoneNr("phoneNr")) {
        errors.push('Missing phonenumber')
    }

    // console.log(errors)
    if (errors.length === 0) {
        sendUserProfile()
        console.log("valideerimine õnnestus saadan profiili Strapisse")
    } else {
        console.log(errors)
    }
}

window.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        // console.log("ENTER")
        validateForm()
    }
})

displayRemoveBtn = button => {
    button.style.display = 'none'
    const removeBtnId = 'remove_' + button.id
    document.getElementById(removeBtnId).style.display = ''
}


displayProviderBtn = button => {
    button.style.display = 'none'
    const providerBtnId = button.id.split('_')[1]
    document.getElementById(providerBtnId).style.display = ''
}

redirectToProvider = (button, provider) => {
    authProviders.style.display = 'none'
    providerToRemove = ''
    providerToRemove = provider
    console.log('redirectToProvider')
    console.log(button);
    console.log(provider);
    confirmDialog.innerHTML = confirmDialog.innerHTML + ` '${provider.toUpperCase()}'`
    removeProviderWarning.style.display = ''
    // if(provider === 'facebook') window.open('https://www.facebook.com/index.php?next=https%3A%2F%2Fwww.facebook.com%2Fsettings%3Ftab%3Dapplications%26ref%3Dsettings')
    // if(provider === 'facebook') window.open('https://www.facebook.com/settings?tab=applications&ref=settings')
}

openProvider = (provider) => {
    console.log('displayFBOptions')
    console.log(provider)
    confirmDialog.style.display = 'none'
    if (provider === 'Facebook')
        window.open('https://www.facebook.com/login.php?next=https%3A%2F%2Fwww.facebook.com%2Fsettings%3Ftab%3Dapplications%26ref%3Dsettings', '_blank')
    if (provider === 'Google')
        window.open('https://myaccount.google.com/permissions', '_blank')
    doneAtProvider.innerHTML = doneAtProvider.innerHTML + ` '${provider.toUpperCase()}'`
    doneAtProvider.style.display = ''
}

showAdvancedSettings = () => {
    showAdvancedStgBtn.style.display = 'none'
    hideAdvancedStgBtn.style.display = ''
    advanced_settings.style.display = ''
}

hideAdvancedSettings = () => {
    hideAdvancedStgBtn.style.display = 'none'
    showAdvancedStgBtn.style.display = ''
    advanced_settings.style.display = 'none'
}

deleteAccount = () => {

    const token = localStorage.getItem('ACCESS_TOKEN')

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`https://a.saal.ee/users/me`, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));

}



