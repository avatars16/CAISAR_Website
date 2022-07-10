//TODO: Add a js object with firstName,MiddleName,lastName and userURL and use that to fill in the search bar, instead of userIds

//Send data from text input to server
//Server searches user, and send back the username,and userURL
//This data will be displayed in an UL.
function sendData(e) {
    const searchResults = document.querySelector("#ulSearchResults");
    const searchBox = document.querySelector("#userURL");
    searchResults.innerHTML = "";
    if (!e.value) return;
    fetch("/users/search", {
        method: "POST",
        headers: { "Content-Type": " application/json" },
        body: JSON.stringify({ payload: e.value }),
    })
        .then((res) => res.json())
        .then((data) => {
            let users = data.payload;
            if (users.length < 1) {
                searchResults.innerHTML = "<p> Nothing found</p>";
                return;
            }
            for (let user of users) {
                searchResults.innerHTML += `<li id=${user.userURL}> ${user.firstName}</li> <hr>`;
            }
        });
}

//When clicked on a list item, userURL will appear in searchfield
function getUserInLi(e) {
    const searchResults = document.querySelector("#ulSearchResults");
    const searchBox = document.querySelector("#userURL");
    if (e.nodeName == "ul") return;
    searchResults.innerHTML = "";
    searchBox.value = e.target.id;
}
