

document.addEventListener("DOMContentLoaded", function (e) {
	console.log(location.pathname.split("/").includes("performance"))
	console.log(validToken);
	if (location.pathname.split("/").includes("performance") && validToken) {
		console.log("jah!!!!!!!!");
		document.getElementById("save-favorite-btn").style.display = "block";
		document.getElementById("direct-to-login-btn").style.display = "none";
	}

})

function saveToFavorites(id) {
	currentFavoArr = [];
	currentFavo = userProfile.Favorites;
	for (var i = 0; i < currentFavo.length; i++) {
		currentFavoArr.push(currentFavo[i].performance_id);
	}

	console.log("favos", currentFavoArr);

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
					GetUserInfo();
				}
				return Promise.reject(response);
			})
			.then(function (data) {
				console.log(data);
			})
			.catch(function (error) {
				console.warn(error);
			});
	} else {
		console.log("selline id on juba sinu lemmikute listis", id);
	}
}

function GetUserFavorites() {
	console.log("getting user favorites");
	if (validToken) {


		var requestOptions = {
			method: "GET",
			headers: {
				Authorization: "Bearer " + localStorage.getItem("ACCESS_TOKEN"),
			},
			maxRedirects: 20,
		}

		return new Promise (function (resolve, reject) {
			fetch("https://a.saal.ee/performance/my", requestOptions)
				.then(function (response) {
					if (response.ok) {
						return response.json()
					}
					reject(response)
				})
				.then(function (data) {
					console.log("lemmikud",data)
					resolve(data)
				})
				.catch(function (error) {
					console.warn(error)
				})
		})





	} else {
		console.log("validToken väärtus on", validToken);
	}
}
