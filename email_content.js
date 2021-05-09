let emailContentFormatter = async(centerFilteredData) => {
    await console.log(centerFilteredData.length);
    await console.log(centerFilteredData[0].sessions.length);
    let rows = ``;
    for (i = 0; i < centerFilteredData.length; i++) {
        let subrows = ``;
        for (j = 0; j < centerFilteredData[i].sessions.length; j++) {
            let subrow = `
                <tr>
                    <th scope="row">` + (j+1) + `</th>
                    <td>` + centerFilteredData[i].sessions[j].date + `</td>
                    <td>` + centerFilteredData[i].sessions[j].min_age_limit + `</td>
                    <td>` + centerFilteredData[i].sessions[j].available_capacity + `</td>
                    <td>` + centerFilteredData[i].sessions[j].vaccine + `</td>
                </tr>
            `;
            subrows = subrows + subrow;
        }
        let row = `
            <tr>
                <th>` + (i + 1) + `</th>
                <td>` + centerFilteredData[i].name + `</td>
                <td>` + centerFilteredData[i].address + `</td>
                <td>` + centerFilteredData[i].district_name + `</td>
                <td>` + centerFilteredData[i].pincode + `</td>
                <td>
                    <table class="table">
                        <thead class="thead-dark">
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
                #records tr:nth-child(even){background-color: #f2f2f2;}
                #records tr:hover {background-color: #ddd;}
                #records th {
                    padding-top: 12px;
                    padding-bottom: 12px;
                    text-align: left;
                    background-color: #03161d;
                    color: white;
                }
                .additionalStyles{
                    font-family: Verdana, Helvetica, sans-serif;
                }
            </style>
        </head>
        <body class="text-center" data-new-gr-c-s-check-loaded="14.1008.0" data-gr-ext-installed="">
            <div class="table-responsive-lg">
                <table id="records" align="center">
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
        </body>
        </html>
    `;
    return {html: html, numRecords: centerFilteredData.length};
};


module.exports = { emailContentFormatter };
