function sendData(input) {
    fetch("users/search", {
        method: "POST",
        headers: { "Content-Type": " application/json" },
        body: JSON.stringify({ payload: input.value }),
    })
        .then((res) => res.json())
        .then((data) => {
            let payload = data.payload;
            console.log(data);
        });
}
