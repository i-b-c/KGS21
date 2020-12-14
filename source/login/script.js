var userProfile


//http://a.saal.ee/auth/google/callback
function decodeToken(token){
    console.log("token", token)
        try{
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            var parsedToken = JSON.parse(jsonPayload)
            console.log("token: ", parsedToken)
            var expDate = JSON.parse(jsonPayload).exp * 1000


        }
        catch(err){
            //console.log(err)
        }
}



if (location.search) {

    //google
    var requestOptions = {
        method: 'GET',
    }
    fetch('https://a.saal.ee/auth/google/callback' + location.search, requestOptions).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        userProfile = data
        let token = data.jwt
        localStorage.setItem("ACCESS_TOKEN", token)
        // document.dispatchEvent(userProfileLoadedEvent)
        // console.log("cognitos olev profiil:")
        console.log(userProfile);
    }).catch(function (error) {
        console.warn(error);
    });

    // //facebook
    // var requestOptions = {
    //     method: 'GET',
    // }
    // fetch('https://a.saal.ee/auth/facebook/callback' + location.search, requestOptions).then(function (response) {
    //     if (response.ok) {
    //         return response.json();
    //     }
    //     return Promise.reject(response);
    // }).then(function (data) {
    //     userProfile = data
    //     let token = data.jwt
    //     localStorage.setItem("ACCESS_TOKEN", token)
    //     // document.dispatchEvent(userProfileLoadedEvent)
    //     // console.log("cognitos olev profiil:")
    //     console.log(userProfile);
    // }).catch(function (error) {
    //     console.warn(error);
    // });

}




function LogOut() {
    localStorage.removeItem("ACCESS_TOKEN")
}

//PUT /users/:id  --> Update an existing user
//DELETE /users/:id --> Delete existing user



function GetUserInfo() {
    if(validToken){
        let requestOptions = {
            'method': 'GET',
            'headers': {
                'Authorization': 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
            },
            'maxRedirects': 20
        };

        fetch('https://a.saal.ee/users/me', requestOptions).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (data) {

            console.log(data);

        }).catch(function (error) {
            console.warn(error);
        });

    }else {
        console.log("oled sisse logimata")
    }

}