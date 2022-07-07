//TODO: Add a js object with firstName,MiddleName,lastName and userSlug and use that to fill in the search bar, instead of userIds

//Send data from text input to server
//Server searches user, and send back the username,and userSlug
//This data will be displayed in an UL.
function sendData(input) {
    const searchResults = document.querySelector("#ulSearchResults");
    const searchBox = document.querySelector("#userSlug");
    searchResults.innerHTML = "";
    if (!input.value) return;
    fetch("/users/search", {
        method: "POST",
        headers: { "Content-Type": " application/json" },
        body: JSON.stringify({ payload: input.value }),
    })
        .then((res) => res.json())
        .then((data) => {
            let users = data.payload;
            if (users.length < 1) {
                searchResults.innerHTML = "<p> Nothing found</p>";
                return;
            }
            for (let user of users) {
                searchResults.innerHTML += `<li id=${user.userSlug}> ${user.firstName}</li> <hr>`;
            }
        });
}

//When clicked on a list item, userSlug will appear in searchfield
function getUserInLi(e) {
    const searchResults = document.querySelector("#ulSearchResults");
    const searchBox = document.querySelector("#userSlug");
    if (e.nodeName == "ul") return;
    searchResults.innerHTML = "";
    searchBox.value = e.target.id;
}
