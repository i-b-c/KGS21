if(validToken) GetUserInfo()

function loginWithProvider(loginProvider) {
    LogOut()
    localStorage.setItem("provider", loginProvider)
    window.location.replace('https://a.saal.ee/connect/' + loginProvider + '/')
}

//kui local storage'isse on salvestatud providery nimi, käib läbi callaback funktsiooni millega tagastatakse token strapist
async function GetCallback(providerToCall) {
    var requestOptions = {
        method: 'GET',
    }
    const response = await fetch('https://a.saal.ee/auth/' + providerToCall + '/callback' + location.search, requestOptions)
    // fetch('https://a.saal.ee/auth/' + providerToCall + '/callback' + location.search, requestOptions).then(function(response) {
    if (response.ok) {
        const data = await response.json()
        console.log("sisselogimise vastus", data);
        localStorage.setItem("ACCESS_TOKEN", data.jwt)
        localStorage.setItem("USER_PROFILE", JSON.stringify(data.user))
        localStorage.removeItem("provider")
        localStorage.setItem("initials", makeInitials(data.user))
        document.dispatchEvent(userProfileLoadedEvent)
        if (data.user.blocked || !data.user.confirmed) {
            accountStatus = false
        }
        validateToken()
    } else {
        var errorResponse = await response.json()
        var errors = []
        console.log("response: ", errorResponse)
        try {
            for (err of errorResponse.message) {
                for (messageId of err.messages) {
                    errors.push(messageId.id)
                }
            }
        } catch (err) {
            console.log(err)
        }

        try{
        errors.push(errorResponse.message.detail)
        }catch(err){
            console.log(err)

        }

        console.log("errors: ", errors)
        displayError(errors)
    }
}

//siia peaks kaardistama kõik erroris ja panema need statusribale alla või üles kuvama
function displayError(errArray){
    for (err of errArray){
        console.log("display", err)
        switch(err){
        case "Key (username)=(tapferm@gmail.com) already exists.":
            document.getElementById("userExists").style.display = "block"
        break
        case "Identifier or password invalid.":
            document.getElementById("invalidPsw").style.display = "block"
            console.log("error oli: ", err)
        break
        case "Email is already taken. Providers.":
            document.getElementById("userExistsProviders").style.display = "block"
            console.log("error oli: ", err)
        break
        case "Missing or invalid password":
            document.getElementById("invalidPsw").style.display = "block"
            console.log("error oli: ", err)
        break
        case "Missing or invalid email":
            document.getElementById("invalidEmail").style.display = "block"
            console.log("error oli: ", err)
        break
        case undefined:
            console.log("defineerimata: ", err)
        break
        default:
            document.getElementById("loginError").innerText = errArray
            document.getElementById("loginError").style.display = "block"
        }
    }
}

if (localStorage.getItem("provider")) {
    GetCallback(localStorage.getItem("provider"))
}
const beautifyProviders = providers => {
    providers = providers.replace(/facebook|google/gi, x => { return x.replace(/^\w/, (c) => c.toUpperCase()) })
    providers = providers.replace(/,/g, ', ')
    providers = providers.replace('local', 'password')
    // console.log(providers)
    return providers
}


let myLocation
if(document.location.pathname.split("/")[1]==="en"){
    myLocation = document.location.origin+"/en"
}else {
    myLocation = document.location.origin
}


const ShowUserFavorites = (favos) => {
    console.log("rendering user favorites");

    let locale = document.getElementById("locale").innerHTML
    document.getElementById("my-favorites").innerHTML=""
    for (favo of favos){
        document.getElementById("no-favo").style.display= "none"

        let oneFavo = document.getElementById("one-favo").cloneNode(true)
        oneFavo.setAttribute("id", favo.id)

        let link = oneFavo.childNodes[0].firstChild.firstChild
        link.setAttribute("href",`${myLocation}/performance/${favo.remote_id}`)

        let name = oneFavo.childNodes[0].firstChild.firstChild.firstChild
        name.innerHTML=favo[`name_${locale}`]

        let artist = oneFavo.childNodes[0].firstChild.firstChild.childNodes[1]
        artist.innerText=favo.artist

        let button = oneFavo.childNodes[1].firstChild
        button.setAttribute("onClick", `updateFavoPerformance(${favo.id}), hideFavo(${favo.id})`)

        // oneFavo.classList.toggle("hidden")
        document.getElementById("my-favorites").appendChild(oneFavo)
    }

}
function hideFavo(element_id){
    console.log("panen peitu", element_id)
    document.getElementById(element_id).classList.toggle("hidden")
}

function showUserInfo() {
    try {
        // console.log("showing user info")
        profile = JSON.parse(localStorage.getItem("USER_PROFILE"))
        email.innerHTML = profile.email
        if (profile.firstName) firstName.innerHTML = profile.firstName
        if (profile.lastName) lastName.innerHTML = profile.lastName
        if (profile.phoneNumber) phoneNr.innerHTML = profile.phoneNumber
        if (profile.provider) providers.innerHTML = beautifyProviders(profile.provider)
        if (profile.Favorites) ShowUserFavorites(profile.myPerformances)
    } catch (err) {
        console.log(err)
    }
    document.getElementById("logged-in-box").style.display = "block"
    document.getElementById("not-logged-in-box").style.display = "none"
}

if(validToken){
    showUserInfo()
    document.getElementById("logged-in-box").style.display = "block"
    document.getElementById("not-logged-in-box").style.display = "none"
}else {
    // console.log("pole sisse loginud")
}


document.addEventListener('userProfileLoaded', function(e) {
    console.log("listening to userProfile loaded event in login ")
    try{
        showUserInfo()
    }
    catch(err){
        console.log("error userProfileLoaded evendis: ",err)
    }
})




