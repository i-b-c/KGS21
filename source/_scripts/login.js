var validToken = false
var accountStatus = true
var userProfile
var userProfileLoadedEvent = new CustomEvent('userProfileLoaded')


if(localStorage.getItem('ACCESS_TOKEN')){
    validateToken()
}


document.addEventListener('userProfileLoaded', function (e) {
    console.log('User profile is loaded', userProfile)
})

function validateToken(){
    var token = localStorage.getItem('ACCESS_TOKEN')
    try{
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        var parsedToken = JSON.parse(jsonPayload)
        console.log("token: ", parsedToken)
        var expDate = JSON.parse(jsonPayload).exp * 1000
        var now = new Date().getTime()

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
            userProfile = data
            document.dispatchEvent(userProfileLoadedEvent)
        }).catch(function(error) {
            console.warn(error);
        });
    }else{
        console.log("validToken väärtus on", validToken)
    }

}

function LogOut() {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("provider")
    location.reload()
}

function saveUrl(){
    localStorage.setItem('url', window.location.href)
}