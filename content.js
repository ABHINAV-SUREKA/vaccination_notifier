let contentFormatter = async(centerFilteredData) => {
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
        <!DOCTYPE HTML>
        <html>
        <head>
            <title>Vaccination Notifier</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
            <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,900" rel="stylesheet">
            <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">           
        </head>
        <body class="text-center" data-new-gr-c-s-check-loaded="14.1008.0" data-gr-ext-installed="">
            <div class="table-responsive-lg">
                <table class="table table-sm table-striped table-hover">
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


module.exports = { contentFormatter };
