

document.addEventListener("DOMContentLoaded", function (e) {
	// console.log(location.pathname.split("/").includes("performance"))
	currentFavoArr = []
	if (userProfile.Favorites){
		currentFavo = userProfile.Favorites;
		for (var i = 0; i < currentFavo.length; i++) {
			currentFavoArr.push(currentFavo[i].performance_id);
		}

		console.log("favos", currentFavoArr)
	}
	// console.log(validToken);
	if (location.pathname.split("/").includes("performance") && validToken) {
		document.getElementById("save-favorite-btn").classList.toggle("hidden")
		document.getElementById("direct-to-login-btn").classList.toggle("hidden")
	}
	var id = parseInt(document.getElementById("performance-id").innerHTML)
	if (currentFavoArr.includes(id)){
		console.log("on lemmik")
		document.getElementById("delete-favorite-btn").classList.toggle("hidden")
		document.getElementById("save-favorite-btn").classList.toggle("hidden")
	}

})


function updateFavo(id){
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
				console.log("salvestan profiili uute update-itud lemmikutega", data);
				document.getElementById("delete-favorite-btn").classList.toggle("hidden")
				document.getElementById("save-favorite-btn").classList.toggle("hidden")
				localStorage.setItem("USER_PROFILE", JSON.stringify(data))
				document.dispatchEvent(userProfileLoadedEvent)
				// location.reload()
			})
			.catch(function (error) {
				console.warn(error);
			})
	}

	if (currentFavoArr.includes(id)) {
		console.log("kustutan", id)
		var favoUpdate = userProfile.Favorites.filter(function filterId(favo){
			return favo.performance_id !== id
		})
		var favo = { Favorites: favoUpdate }
		// document.getElementById("delete-favorite-btn").classList.toggle("hidden")
		// document.getElementById("save-favorite-btn").classList.toggle("hidden")
		sendToStrapi(favo)
	} else {
		console.log("lisan", id)
		var favo = { Favorites: userProfile.Favorites };
		favo.Favorites.push({ performance_id: id })
		// document.getElementById("delete-favorite-btn").classList.toggle("hidden")
		// document.getElementById("save-favorite-btn").classList.toggle("hidden")
		sendToStrapi(favo)

	}
}

