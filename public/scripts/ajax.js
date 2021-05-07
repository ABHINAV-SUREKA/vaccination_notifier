$(function(){
    var district_data_block = "";
    $("input#subscribe").click((event) => {
        event.preventDefault();
        var data = $("form#preferences").serialize()+"&subscribe=Subscribe";
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
        });
    });
    $("input#unsubscribe").click((event) => {
        event.preventDefault();
        console.log("unsubscribe");
        var data = $("form#preferences").serialize()+"&unsubscribe=Unsubscribe";
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
        });
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
                            $("#table_container").text("Select District");
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
    $("#unsubscribe").click(function() {
        $("#age").removeAttr("required");
        $("#email").attr("required", true);
        $("#location_value").removeAttr("required");
    });
    $("#subscribe").click(function() {
        $("#age").attr("required", true);
        $("#email").attr("required", true);
        $("#location_value").attr("required", true);
    });
    $("#check_availability").click(function() {
        $("#age").attr("required", true);
        $("#email").removeAttr("required");
        $("#location_value").attr("required", true);
        //});
        //$("#check_availability").click(function() {
        if ($("#age").val().length != 0 && $("#location_value").val().length != 0)
        {
            $.ajax({
                url: "vaccine_availability",
                type: "get",
                timeout: 25000,
                beforeSend: function() {
                    $("#location_value").removeAttr("hidden");
                    $("#location_value").append("Fetching results...");
                }
            })
                .done((result) => {
                    $("#location_value").empty();
                    $("#location_value").removeAttr("hidden");
                    if (result.length) {
                        $("#location_value").append(result);
                    } else {
                        $("#location_value").append("Unable to fetch data");
                    }
                })
                .fail(function (jqXHR, textStatus, error) { alert("Unable to fetch data at this time | " + textStatus + " | " + error); });
        }
        //});
    });

});