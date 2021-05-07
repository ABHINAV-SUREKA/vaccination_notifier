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
    <div class="table-responsive-md">
        <table class="table table-striped">
            <thead class="thead-dark">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Center Name</th>
                    <th scope="col">Address</th>
                    <th scope="col">District</th>
                    <th scope="col">Pincode</th>
                    <th scope="col">Fees</th>
                </tr>
            </thead>
            <tbody>` + rows + `</tbody>
        </table>
    </div>
</body>
</html>`;