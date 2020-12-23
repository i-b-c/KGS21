var validToken = false
var accountStatus = true
var userProfile
var userProfileLoadedEvent = new CustomEvent('userProfileLoaded')

if(localStorage.getItem("USER_PROFILE")){
    userProfile = JSON.parse(localStorage.getItem("USER_PROFILE"))
}

//laetud dokumendi elementi kirjutatakse tervitus, kui kasutaja on sisse logitus ( local storage-is on tervitus)
document.addEventListener('DOMContentLoaded', function(e) {
    if (localStorage.getItem('initials')) {
        document.getElementById('user_initials').innerText = localStorage.getItem('initials')
    }
})

document.addEventListener('userProfileLoaded', function(e) {
    console.log("user profile loaded event triggered")
    userProfile = JSON.parse(localStorage.getItem("USER_PROFILE"))
    console.log('User profile is loaded', userProfile)
    makeUserMenuMessage()

})


document.addEventListener('storage', function(e) {
    if(e.key === 'initials') {
       console.log("kasutaja initsiaalid muutusid")
    }
    if(e.key === 'USER_PROFILE') {
       console.log("kasutaja profiil muutus")
    }
})

if(localStorage.getItem('ACCESS_TOKEN')){
    validateToken()
}

function makeInitials() {
    console.log("making initials");
    // makes intitals from userProfile based on name or email
    var initials=" "
    if (userProfile.firstName && userProfile.lastName) {
        return initials + userProfile.firstName[0] + userProfile.lastName[0] || initials + userProfile.firstName[0] || initials + userProfile.lastName[0]
    } else {
        var parts = userProfile.email.split("@")
        parts = parts[0].split(".")
        for(var i=0; i< parts.length; ++i){
            initials+=parts[i][0]
        }
        return initials
    }
}

function makeUserMenuMessage() {
    //makes massage for menu bar from pharse from Yaml  and initials genetated from profile
    document.getElementById('user_initials').innerText = makeInitials()
    localStorage.setItem("initials", makeInitials())
    // location.reload()
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
}


function GetUserInfo() {
    console.log("getting user info")
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
            makeUserMenuMessage()
        }).catch(function(error) {
            console.warn(error);
        });
    }else{
        console.log("validToken väärtus on", validToken)
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