let emailContentFormatter = async(centerFilteredData) => {
    await console.log(centerFilteredData.length);
    await console.log(centerFilteredData[0].sessions.length);
    let rows = ``;
    for (i = 0; i < centerFilteredData.length; i++) {
        let subrows = ``;
        for (j = 0; j < centerFilteredData[i].sessions.length; j++) {
            let textColor = "green";
            if (centerFilteredData[i].sessions[j].available_capacity <= 10)
                textColor = "#afa31a";
            let subrow = `
                <tr>
                    <td>` + (j+1) + `</td>
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
                <td>` + (i + 1) + `</td>
                <td>` + centerFilteredData[i].name + `</td>
                <td>` + centerFilteredData[i].address + `</td>
                <td>` + centerFilteredData[i].district_name + `</td>
                <td>` + centerFilteredData[i].pincode + `</td>
                <td>
                    <table style="width:100%">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Min Age</th>
                                <th>Available</th>
                                <th>Vaccine</th>
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
        <!DOCTYPE HTML>
        <html>
        <head xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
            <title>Vaccination Notifier</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <style>
                #records {
                    font-family: Verdana, Helvetica, sans-serif;
                    border-collapse: collapse;
                    width: 100%;
                }
                #records td, #records th {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                #records tr:nth-child(even){
                    background-color: #f2f2f2;
                }
                #records tr:hover {background-color: #ddd;}
                #records th {
                    padding-top: 12px;
                    padding-bottom: 12px;
                    text-align: left;
                    background-color: #343a40;
                    color: white;
                }
                .additionalStyles{
                    font-family: Verdana, Helvetica, sans-serif;
                }
            </style>
        </head>
        <body class="text-center" data-new-gr-c-s-check-loaded="14.1008.0" data-gr-ext-installed="">
            <h3>Vaccine availability details for your preferred location:</h3>
            Get vaccinated today!
            <p></p>
            <div class="table-responsive-lg">
                <table id="records" align="center">
                    <thead class="thead-dark">
                        <tr>
                            <th style="width:3%">#</th>
                            <th style="width:14%">Center Name</th>
                            <th style="width:18%">Address</th>
                            <th style="width:8%">District</th>
                            <th style="width:10%">Pincode</th>
                            <th style="width:67%">Sessions</th>
                        </tr>
                    </thead>
                    <tbody>` + rows + `</tbody>
                </table>
            </div>
        </body>
        </html>
    `;
    return {html: html, numRecords: centerFilteredData.length};
};


module.exports = { emailContentFormatter };
