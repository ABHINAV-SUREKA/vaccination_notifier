const axios = require("axios")
    , dateFormat = require("dateformat");

// Fetch info from Cowin
let slotsCalenderByPin = async (element) => {
    let config = {
        method: "get",
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=" + element.location_value + "&date=" + dateFormat(new Date(), "dd-mm-yyyy"),
        headers: {
            "accept": "application/json",
            "Accept-Language": "hi_IN",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        }
    }
    let response = await axios(config);
    return response.data;
};

let slotsCalenderByDistrict = async (element) => {
    let config = {
        method: "get",
        url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + element.location_value + "&date=" + dateFormat(new Date(), "dd-mm-yyyy"),
        headers: {
            "accept": "application/json",
            "Accept-Language": "hi_IN",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        }
    }
    let response = await axios(config);
    return await response.data;
};

let slotsCalenderByState = async (element) => {
    let promised_district_data = await getDistricts(element.location_value);
    let combinedDistrictDataList = [];
    for (i = 0; i < promised_district_data.districts.length; i++) {
        let config = {
            method: "get",
            url: "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=" + promised_district_data.districts[i].district_id + "&date=" + dateFormat(new Date(), "dd-mm-yyyy"),
            headers: {
                "accept": "application/json",
                "Accept-Language": "hi_IN",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
            }
        }
        let response = await axios(config);
        await combinedDistrictDataList.push(...response.data.centers);
    }
    console.log(combinedDistrictDataList);
    return combinedDistrictDataList;
};


module.exports = { slotsCalenderByPin, slotsCalenderByState, slotsCalenderByDistrict };