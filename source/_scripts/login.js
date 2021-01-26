var validToken = false
var accountStatus = true

// https://saal.netlify.app/login
// http://localhost:4000/login

// var userProfile
var userProfileLoadedEvent = new CustomEvent('userProfileLoaded')

// if(localStorage.getItem("USER_PROFILE")){
//     userProfile = JSON.parse(localStorage.getItem("USER_PROFILE"))
// }

// if(localStorage.getItem('ACCESS_TOKEN')){
//     validateToken()
// }

//laetud dokumendi elementi kirjutatakse tervitus, kui kasutaja on sisse logitus ( local storage-is on tervitus)
// document.addEventListener('DOMContentLoaded', function(e) {
//     if (localStorage.getItem('initials')) {
//         document.getElementById('user_initials').innerText = localStorage.getItem('initials')
//     }
// })

// document.addEventListener('userProfileLoaded', function(e) {
//     try{
//         document.getElementById('user_initials').innerText = localStorage.getItem('initials')
//     }
//     catch(err){
//         console.log("error userProfileLoaded evendis: ",err)
//     }
// })


function makeInitials(profile) {
    // makes intitals from userProfile based on name or email
    console.log("making initals for", profile)
    var initials = " "
    if (profile.firstName && profile.lastName) {
        return initials + profile.firstName[0] + profile.lastName[0] || initials + profile.firstName[0] || initials + profile.lastName[0]
    } else {
        var parts = profile.email.split("@")
        parts = parts[0].split(".")
        for (var i = 0; i < parts.length; ++i) {
            initials += parts[i][0]
        }
        return initials
    }
    document.getElementById('user_initials').innerText = localStorage.getItem('initials')
}


function validateToken(){
    var token = localStorage.getItem('ACCESS_TOKEN')
    try{
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        var parsedToken = JSON.parse(jsonPayload)
        var expDate = JSON.parse(jsonPayload).exp * 1000
        var now = new Date().getTime()
        // console.log("token: ", parsedToken)
        // console.log("token aegub: " + expDate)
        // console.log("praegu on: " + now)
        // console.log("tokeni kehtivuse lõpp", new Date(expDate));
        // console.log(now<expDate)
        // console.log(accountStatus);
        if(now < expDate && accountStatus){
            validToken = true
        }else{
            validToken = false
        }
    }
    catch(err){
        console.log(err)
        validToken = false
    }
    console.log("Token", validToken, "expDate", new Date(expDate))
}


function GetUserInfo() {
    console.log("getting user info from strapi")
    if(validToken){
        var requestOptions = {
            'method': 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
            },
            'maxRedirects': 20
        };
        fetch('https://a.saal.ee/users/me', requestOptions).then(function(response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function(data) {
            console.log("salvestan profiili local storage-isse")
            localStorage.setItem("USER_PROFILE", JSON.stringify(data))
            localStorage.setItem("initials", makeInitials(data))
            document.dispatchEvent(userProfileLoadedEvent)
        }).catch(function(error) {
            console.warn(error);
        });
    }else{
        console.log("Token väärtus on", validToken)
    }

}


function LogOut() {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("initials")
    localStorage.removeItem("USER_PROFILE")
    localStorage.removeItem("provider")
    location.reload()
}

function saveUrl(){
    localStorage.setItem('url', window.location.href)
}