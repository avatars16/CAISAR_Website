function deleteEmptyFields(json) {
    for (var key in json) {
        if (!json[key]) delete json[key];
    }
    return json;
}

module.exports = { deleteEmptyFields };
