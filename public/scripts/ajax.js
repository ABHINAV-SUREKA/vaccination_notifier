$(function(){
    $("#records").DataTable();
    let district_data_block = "";
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('verifyMsg')) {
        if (urlParams.get("verifyMsg").indexOf("User successfully subscribed") > -1) {
            let alert_type = "alert-success";
            let alert_response = urlParams.get("verifyMsg");
            let alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                "                <strong>" + alert_response + "</strong>" +
                "                <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                "            </div>";
            $("#alert_placeholder").append(alert_data);
        } else if(urlParams.get("verifyMsg").indexOf("User already subscribed") > -1) {
            let alert_type = "alert-info";
            let alert_response = urlParams.get("verifyMsg");
            let alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                "                <strong>" + alert_response + "</strong>" +
                "                <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                "            </div>";
            $("#alert_placeholder").append(alert_data);
        }
    }
    $("input#subscribe").click((event) => {
        $("#age").attr("required", true);
        $("#email").attr("required", true);
        $("#location_value").attr("required", true);
        if ($("#age").val().length != 0 && $("#email").val().length != 0 && $("#location_value").val().length != 0) {
            event.preventDefault();
            let data = $("form#preferences").serialize() + "&subscribe=Subscribe";
            let alert_type = "alert-danger";
            let alert_response = "";
            let alert_data = "";
            $.ajax({
                url: "action",
                type: "post",
                data: data,
                timeout: 45000,
            }).done((result) => {
                console.log(result);
                if (!result.trim().length) {
                    alert_response = "Unable to subscribe at the moment!";
                    alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                        "           <strong>" + alert_response + "</strong>" +
                        "           <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                        "         </div>";
                } else if ("User already subscribed" == result.trim()) {
                    alert_response = result;
                    alert_type = "alert-info";
                    alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                        "           <strong>" + alert_response + "</strong>" +
                        "           <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                        "         </div>";
                } else if (result.indexOf("A verification email has been sent") > -1) {
                    alert_response = result;
                    alert_type = "alert-info";
                    alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                        "           <strong>" + alert_response + "</strong>" +
                        "           <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                        "         </div>";
                } else {
                    alert_response = result;
                    alert_type = "alert-success";
                    alert_data = `
                        <div id="successModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="successModalLabel" aria-hidden="true">
                            <div class="modal-dialog gradient-custom-modal" role="document">
                                <div class="modal-content">
                                    <div class="modal-body gradient-custom-modal">
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="successModalClose">
                                            <span aria-hidden="true">&times;</span>
                                        </button> ` + result + `
                                    </div>
                                </div>
                            </div>
                        </div>
                        <script>
                            $("#successModal").modal('show');
                            $("#successModalClose").click(function() {
                                $("#successModal").modal('hide');
                            });
                        </script>
                    `;
                }
            }).fail(function (jqXHR, textStatus, error) {
                alert_response = "Unable to subscribe at the moment! | " + textStatus + " | " + error;
                alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                    "           <strong>" + alert_response + "</strong>" +
                    "           <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                    "         </div>";
            }).always(function () {
                $("#alert_placeholder").empty();
                $("#alert_placeholder").append(alert_data);
            });
        }
    });
    $("input#unsubscribe").click((event) => {
        $("#age").removeAttr("required");
        $("#email").attr("required", true);
        $("#location_value").removeAttr("required");
        if ($("#email").val().length != 0) {
            event.preventDefault();
            let data = $("form#preferences").serialize() + "&unsubscribe=Unsubscribe";
            let alert_type = "alert-danger";
            let alert_response = "";
            $.ajax({
                url: "action",
                type: "post",
                data: data,
                timeout: 20000,
            }).done((result) => {
                console.log(result);
                if (!result.length) {
                    alert_response = "Unable to unsubscribe at the moment!";
                } else if (result.indexOf("is not subscribed to email notification") > -1) {
                    alert_response = result;
                    alert_type = "alert-info";
                } else {
                    alert_response = result;
                    alert_type = "alert-success";
                }
            }).fail(function (jqXHR, textStatus, error) {
                alert_response = "Unable to unsubscribe at the moment! | " + textStatus + " | " + error;
            }).always(function () {
                let alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                    "                <strong>" + alert_response + "</strong>" +
                    "                <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                    "            </div>";
                $("#alert_placeholder").append(alert_data);
            });
        }
    });
    $("input#check_availability").click((event) => {
        $("#age").attr("required", true);
        $("#email").removeAttr("required");
        $("#location_value").attr("required", true);
        if ($("#age").val().length != 0 && $("#location_value").val().length != 0) {
            event.preventDefault();
            let data = $("form#preferences").serialize()+"&check_availability=Check Availability";
            let alert_type = "alert-danger";
            let alert_response = "";
            $.ajax({
                url: "action",
                type: "post",
                data: data,
                timeout: 25000,
                beforeSend: function() {
                    $("#table_container").empty();
                    $("#table_container").removeAttr("hidden");
                    $("#table_container").append("Fetching results...");
                }
            }).done((result) => {
                $("#table_container").empty();
                if (result.numRecords > 0) {
                    alert_type = "alert-success";
                    alert_response = "Fetched " + result.numRecords + " record(s)";
                    $("#table_container").removeAttr("hidden");
                    $("#table_container").append(result.html);
                } else {
                    alert_response = "No records found!";
                    $("#table_container").empty();
                    $("#table_container").attr("hidden", true);
                }
            }).fail(function (jqXHR, textStatus, error) {
                alert_response = "Unable to fetch vaccination details at the moment! | " + textStatus + " | " + error;
                $("#table_container").empty();
                $("#table_container").attr("hidden", true);
            }).always(function () {
                let alert_data = "<div class=\"alert " + alert_type + " alert-dismissible fade show\" role=\"alert\">" +
                    "                <strong>" + alert_response + "</strong>" +
                    "                <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                    "            </div>";
                $("#alert_placeholder").append(alert_data);
            });
        }
    });
    $("#location").change(function() {
        if ($("#location option:selected").val() == "district") {
            $("#location_value").replaceWith($("<select class=\"form-select col-lg-8\" name=\"location_value\" id=\"location_value\" required=\"\"><option value=\"\" disabled selected>Select District</option></select>"));
            if (district_data_block) {
                $("#location_value").append(district_data_block);
            } else {
                $.ajax({
                    url: "district_list",
                    type: "get",
                    timeout: 20000,
                    beforeSend: function() {
                        $("#location_value option:selected").text("Loading...");
                    }
                })
                    .done((result) => {
                        if (result.length) {
                            $("#location_value option:selected").text("Select District");
                            $.each(result, (i, stateObj) => {
                                let div_state_data = "<option value=" + stateObj.state_id + " disabled>" + stateObj.state_name + "</option>";
                                $("#location_value").append(div_state_data);
                                district_data_block = district_data_block + div_state_data;
                                $.each(stateObj.districts, (j, districtObj) => {
                                    let div_district_data = "<option value=" + districtObj.district_id + ">" + districtObj.district_name + "</option>";
                                    $("#location_value").append(div_district_data);
                                    district_data_block = district_data_block + div_district_data;
                                });
                            });
                        } else {
                            $("#location_value option:selected").text("Unable to fetch data");
                        }
                    })
                    .fail(function (jqXHR, textStatus, error) { alert("Unable to fetch data at this time | " + textStatus + " | " + error); });
            }
        } else if ($("#location option:selected").val() == "pincode") {
            $("#location_value").replaceWith($("<input class=\"form-control\" type=\"number\" name=\"location_value\" id=\"location_value\" placeholder=\"Pincode\" required=\"\" autofocus=\"\">"));
        }
    });
    if ($("#location option:selected").val() == "district") {
        $("#location_value").replaceWith($("<select class=\"form-select col-lg-8\" name=\"location_value\" id=\"location_value\" required=\"\"><option value=\"\" disabled selected>Select District</option></select>"));
        if (district_data_block) {
            $("#location_value").append(district_data_block);
        }
    }
});