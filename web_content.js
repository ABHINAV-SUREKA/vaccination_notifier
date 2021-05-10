let webContentFormatter = async(centerFilteredData) => {
    await console.log(centerFilteredData.length);
    await console.log(centerFilteredData[0].sessions.length);
    let rows = ``;
    for (i = 0; i < centerFilteredData.length; i++) {
        let subrows = ``;
        for (j = 0; j < centerFilteredData[i].sessions.length; j++) {
            let textColor = "green";
            if (centerFilteredData[i].sessions[j].available_capacity <= 10)
                textColor = "#cc9a06";
            let subrow = `
                <tr>
                    <th scope="row">` + (j+1) + `</th>
                    <td>` + centerFilteredData[i].sessions[j].date + `</td>
                    <td>` + centerFilteredData[i].sessions[j].min_age_limit + `</td>
                    <td style="color:` + textColor +`">` + centerFilteredData[i].sessions[j].available_capacity + `</td>
                    <td>` + centerFilteredData[i].sessions[j].vaccine + `</td>
                </tr>
            `;
            subrows = subrows + subrow;
        }
        let row = `
            <tr>
                <th scope="row">` + (i + 1) + `</th>
                <td>` + centerFilteredData[i].name + `</td>
                <td>` + centerFilteredData[i].address + `</td>
                <td>` + centerFilteredData[i].district_name + `</td>
                <td>` + centerFilteredData[i].pincode + `</td>
                <td>
                    <table class="table">
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Date</th>
                                <th scope="col">Min Age</th>
                                <th scope="col">Available</th>
                                <th scope="col">Vaccine</th>
                            </tr>
                        </thead>
                        <tbody>` + subrows + `</tbody>
                    </table>
                </td>
            </tr>
        `;
        rows = rows + row;
    };
    let html = `
        <div class="table-responsive-lg">
            <table class="table table-sm table-hover" id="records">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col" style="width:3%">#</th>
                        <th scope="col" style="width:14%">Center Name</th>
                        <th scope="col" style="width:18%">Address</th>
                        <th scope="col" style="width:8%">District</th>
                        <th scope="col" style="width:10%">Pincode</th>
                        <th scope="col" style="width:67%">Sessions</th>
                    </tr>
                </thead>
                <tbody>` + rows + `</tbody>
            </table>
        </div>
    `;
    return {html: html, numRecords: centerFilteredData.length};
};


module.exports = { webContentFormatter };
