let botContentFormatter = async(centerFilteredData) => {
    await console.log(centerFilteredData.length);
    await console.log(centerFilteredData[0].sessions.length);
    let rows = ``;
    for (i = 0; i < centerFilteredData.length; i++) {
        let subrows = ``;
        for (j = 0; j < centerFilteredData[i].sessions.length; j++) {
            let subrow =
                (j+1) + `) ` + centerFilteredData[i].sessions[j].date + ` ` + centerFilteredData[i].sessions[j].vaccine + ` (` + centerFilteredData[i].sessions[j].min_age_limit + `+) Avl: ` + centerFilteredData[i].sessions[j].available_capacity + `
    `; // for newline
            subrows = subrows + subrow;
        }
        let row =
            (i + 1) + `) ` + centerFilteredData[i].name + ` ` + centerFilteredData[i].address + ` ` + centerFilteredData[i].district_name + ` ` + centerFilteredData[i].pincode + `
    ` + subrows;
        rows = rows + `
` + row;
    };
    let html = rows;
    return {html: html, numRecords: centerFilteredData.length};
};


module.exports = { botContentFormatter };
