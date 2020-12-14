var validToken = false


if(localStorage.getItem('ACCESS_TOKEN')){
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
        console.log(new Date(expDate));

        if(now < expDate){
            validToken = true
        }else{
            validToken = false
        }
    }
    catch(err){
        //console.log(err)
        validToken = false
    }
}

