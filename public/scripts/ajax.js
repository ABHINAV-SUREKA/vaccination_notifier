$(function(){
    var district_data_block = "";
    $("input#subscribe").click((event) => {
        $("#age").attr("required", true);
        $("#email").attr("required", true);
        $("#location_value").attr("required", true);
        if ($("#age").val().length != 0 && $("#email").val().length != 0 && $("#location_value").val().length != 0) {
            event.preventDefault();
            var data = $("form#preferences").serialize() + "&subscribe=Subscribe";
            $.ajax({
                url: "action",
                type: "post",
                data: data,
                timeout: 20000,
            }).done((result) => {
                console.log(result);
                if (result.length) {
                    var alert_data = "<div class=\"alert alert-success alert-dismissible fade show\" role=\"alert\">" +
                        "                <strong>" + result + "</strong>" +
                        "                <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                        "            </div>";
                    $("#alert_placeholder").append(alert_data);
                }
            }).fail(function (jqXHR, textStatus, error) {
                alert("Unable to fetch data at this time | " + textStatus + " | " + error);
            });
        }
    });
    $("input#unsubscribe").click((event) => {
        $("#age").removeAttr("required");
        $("#email").attr("required", true);
        $("#location_value").removeAttr("required");
        if ($("#email").val().length != 0) {
            event.preventDefault();
            var data = $("form#preferences").serialize() + "&unsubscribe=Unsubscribe";
            $.ajax({
                url: "action",
                type: "post",
                data: data,
                timeout: 20000,
            }).done((result) => {
                console.log(result);
                if (result.length) {
                    var alert_data = "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">" +
                        "                <strong>" + result + "</strong>" +
                        "                <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\" aria-label=\"Close\"></button>" +
                        "            </div>";
                    $("#alert_placeholder").append(alert_data);
                }
            }).fail(function (jqXHR, textStatus, error) {
                alert("Unable to fetch data at this time | " + textStatus + " | " + error);
            });
        }
    });
    $("input#check_availability").click((event) => {
        $("#age").attr("required", true);
        $("#email").removeAttr("required");
        $("#location_value").attr("required", true);
        if ($("#age").val().length != 0 && $("#location_value").val().length != 0) {
            event.preventDefault();
            var data = $("form#preferences").serialize()+"&check_availability=Check Availability";
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
                $("#table_container").removeAttr("hidden");
                console.log(result);
                if (result.length) {
                    $("#table_container").append(result);
                } else {
                    $("#table_container").append("Unable to fetch data");
                }
            }).fail(function (jqXHR, textStatus, error) {
                alert("Unable to fetch data at this time | " + textStatus + " | " + error);
                $("#table_container").empty();
                $("#table_container").attr("hidden", true);
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