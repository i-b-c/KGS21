
if(location.search){
    let token = location.search.split("?id_token=")[1]
    localStorage.setItem("ID_TOKEN", token)
}

function LogOut (){
    localStorage.removeItem("ID_TOKEN")
}






