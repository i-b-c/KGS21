
// http://localhost:4000/login
// https://saal.netlify.app/login

document.addEventListener("DOMContentLoaded", function (e) {

	// var favoIds=[]
	// if(validToken){
	// 	var favorites = JSON.parse(localStorage.getItem("USER_PROFILE")).myPerformances

	// 	for (var i = 0; i < favorites.length; i++) {
	// 		favoIds.push(favorites[i].id)
	// 	}

	// }

	// // console.log(validToken);
	// if (location.pathname.split("/").includes("performance") && validToken) {
	// 	if(document.getElementById("save-favorite-btn"))document.getElementById("save-favorite-btn").classList.toggle("hidden")
	// 	if(document.getElementById("direct-to-login-btn"))document.getElementById("direct-to-login-btn").classList.toggle("hidden")
	// }
	// if(document.getElementById("performance-id")){
	// 	var id = parseInt(document.getElementById("performance-id").innerHTML)
	// 	console.log(id)
	// 	if (favoIds.includes(id)){
	// 		console.log(id, " on sinu lemmik")
	// 		if(document.getElementById("delete-favorite-btn"))document.getElementById("delete-favorite-btn").classList.toggle("hidden")
	// 		if(document.getElementById("save-favorite-btn"))document.getElementById("save-favorite-btn").classList.toggle("hidden")
	// 	}
	// }

})


function updateFavoPerformance(thisId){

	function sendToStrapi(data){
		favoJSON = JSON.stringify(data)
		var requestOptions = {
			method: "PUT",
			body: favoJSON,
			headers: {
				Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
				"Content-Type": "application/json",
			},
		};
		console.log("salvestan strapisse", requestOptions);
		fetch("https://a.saal.ee/users/me", requestOptions)
			.then(function (response) {
				if (response.ok) {
					return response.json();
				}
				return Promise.reject(response);
			})
			.then(function (data) {
				console.log("salvestan profiili uute lemmikutega", data);
				if(document.getElementById("delete-favorite-btn")) document.getElementById("delete-favorite-btn").classList.toggle("hidden")
				if(document.getElementById("save-favorite-btn"))document.getElementById("save-favorite-btn").classList.toggle("hidden")
				localStorage.setItem("USER_PROFILE", JSON.stringify(data))
				document.dispatchEvent(userProfileLoadedEvent)
			})
			.catch(function (error) {
				console.warn(error);
			})
	}

	var favorites = JSON.parse(localStorage.getItem("USER_PROFILE")).myPerformances

	var favos=[]
	for (var i = 0; i < favorites.length; i++) {
		favos.push({"id": favorites[i].id})
	}

	var favoIds=[]
	for (var i = 0; i < favorites.length; i++) {
		favoIds.push(favorites[i].id)
	}

	if(favoIds.includes(thisId)){
		console.log("see on lemmik, kustutan ära")
		favos= favos.filter(function(favo){
			return favo.id !== thisId
		})
	}else{
		console.log("see pole sinu lemmik lisan")
		favos.push({ "id": thisId })
	}

	sendToStrapi({myPerformances: favos})
	console.log("current favoIds ", favoIds);
	console.log("new favos ", favos);
}

