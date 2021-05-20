let providerToRemove

if(validToken){
    fillUserForm()
}else {
    window.open(`${location.origin}/${langpath}login`, '_self')
    saveUrl()
}

function fillUserForm() {
    try {
        console.log("filling user form")
        let profile = JSON.parse(localStorage.getItem("USER_PROFILE"))
        email.innerHTML = profile.email
        if (profile.firstName) firstName.value = profile.firstName
        if (profile.lastName) lastName.value = profile.lastName
        if (profile.phoneNumber) phoneNr.value = profile.phoneNumber
        if (profile.provider.includes('local')) password.style.display = ''
        if (profile.provider.includes('google')) google.style.display = ''
        if (profile.provider.includes('facebook')) facebook.style.display = ''
    } catch (err) {
        console.log(err)
    }
}

async function sendUserProfile() {
    console.log("sending user profile")

    let userToSend = JSON.stringify({
        "firstName": `${firstName.value}`,
        "lastName": `${lastName.value}`,
        "phoneNumber": `${phoneNr.value}`,
    })
    // console.log("kasutaja profiil mida saadan ", userToSend);
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
    }else {
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
    if (userProfile.provider.includes('local')) resetPswdBtn.style.display = ''
    if (!userProfile.provider.includes('local')) addPswdBtn.style.display = ''

}

hideAdvancedSettings = () => {
    hideAdvancedStgBtn.style.display = 'none'
    showAdvancedStgBtn.style.display = ''
    advanced_settings.style.display = 'none'

}

const SendPswResetLink = async () => {
    console.log("lähtestan parooli")
    let email = userProfile.email

    let body = JSON.stringify({
        "email": email
    })

    let requestOptions = {
        'method': 'POST',
        'body': body,
        'headers': {
            'Content-Type': 'application/json'
        }
    }

    console.log(requestOptions)
    let response = await (fetch('https://a.saal.ee/auth/forgot-password', requestOptions))

    if (response.ok) {
        const data = await response.json()
        console.log(data)
        console.log("email saadetud")
        document.getElementById("resetLinkSent").style.display = "block"
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

deleteAccount = async () => {

    if (cnfrmDelEmail.value !== userProfile.email) return

    const token = localStorage.getItem('ACCESS_TOKEN')

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow'
    };

    const response = await fetch(`https://a.saal.ee/users/me`, requestOptions)

    if (response.ok) {
        localStorage.clear()
        window.open(document.location.origin)
    }

}





