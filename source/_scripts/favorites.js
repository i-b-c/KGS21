

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
		console.log("jah!!!!!!!!");
		document.getElementById("save-favorite-btn").style.display = "block"
		document.getElementById("direct-to-login-btn").style.display = "none"
	}
	var id = parseInt(document.getElementById("performance-id").innerHTML)
	if (currentFavoArr.includes(id)){
		console.log("on lemmik")
		 document.getElementById("delete-favorite-btn").style.display = "block"
		 document.getElementById("save-favorite-btn").style.display = "none"

	}

})

function deleteFromFavo(id){
		if (currentFavoArr.includes(id)) {
		console.log("hakkan kustutama lemmikut", id)
		var favoUpdate = userProfile.Favorites.filter(function filterId(favo){
			return favo.performance_id !== id
		})
		// console.log(favoUpdate)
		var favo = { Favorites: favoUpdate }
		favoJSON = JSON.stringify(favo)
		var requestOptions = {
			method: "PUT",
			body: JSON.stringify(favo),
			headers: {
				Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
				"Content-Type": "application/json",
			},
		};
		console.log("requestOptions", requestOptions);
		fetch("https://a.saal.ee/users/me", requestOptions)
			.then(function (response) {
				if (response.ok) {
					return response.json();
				}
				return Promise.reject(response);
			})
			.then(function (data) {
				console.log("salvestan profiili lisatud favoga", data);
				localStorage.setItem("USER_PROFILE", JSON.stringify(data))
				document.dispatchEvent(userProfileLoadedEvent)
			})
			.catch(function (error) {
				console.warn(error);
			});
	} else {
		console.log("seda pole sinu lemmikute hulgas", id);
	}
}

function saveToFavorites(id) {

	if (!currentFavoArr.includes(id)) {
		console.log("uus lemmik", id);
		var favo = { Favorites: userProfile.Favorites };
		favo.Favorites.push({ performance_id: id });
		favoJSON = JSON.stringify(favo);

		var requestOptions = {
			method: "PUT",
			body: JSON.stringify(favo),
			headers: {
				Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
				"Content-Type": "application/json",
			},
		};
		console.log("requestOptions", requestOptions);
		fetch("https://a.saal.ee/users/me", requestOptions)
			.then(function (response) {
				if (response.ok) {
					return response.json();
				}
				return Promise.reject(response);
			})
			.then(function (data) {
				console.log("salvestan profiili lisatud favoga", data);
				localStorage.setItem("USER_PROFILE", JSON.stringify(data))
				document.dispatchEvent(userProfileLoadedEvent)
			})
			.catch(function (error) {
				console.warn(error);
			});
	} else {
		console.log("selline id on juba sinu lemmikute listis", id);
	}
}

function updateFavo(id){
	function sendToStrapi(data){
		favoJSON = JSON.stringify(data)
		var requestOptions = {
			method: "PUT",
			body: JSON.stringify(favo),
			headers: {
				Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
				"Content-Type": "application/json",
			},
		};
		console.log("requestOptions", requestOptions);
		fetch("https://a.saal.ee/users/me", requestOptions)
			.then(function (response) {
				if (response.ok) {
					return response.json();
				}
				return Promise.reject(response);
			})
			.then(function (data) {
				console.log("salvestan profiili lisatud favoga", data);
				localStorage.setItem("USER_PROFILE", JSON.stringify(data))
				document.dispatchEvent(userProfileLoadedEvent)
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
		sendToStrapi(favo)
	} else {
		console.log("lisan", id)
		var favo = { Favorites: userProfile.Favorites };
		favo.Favorites.push({ performance_id: id })
		sendToStrapi(favo)

	}
}

