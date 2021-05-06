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

let getStates = async (errorHandler) => {
    let response;
    try {
        let config = {
            method: "get",
            url: "https://cdn-api.co-vin.in/api/v2/admin/location/states",
            headers: {
                "accept": "application/json",
                "Accept-Language": "hi_IN",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
            }
        }
        response = await axios(config);
        return await response.data;
    } catch(error) {
        errorHandler(error);
    }
    return null;
};

let getAllDistricts = async (errorHandler) => {
    let combinedStateDistrictDataList = [];
    try {
        let promised_state_data = await getStates(errorHandler);
        for (i = 0; i < promised_state_data.states.length; i++) {
            let config = {
                method: "get",
                url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + promised_state_data.states[i].state_id,
                headers: {
                    "accept": "application/json",
                    "Accept-Language": "hi_IN",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                }
            }
            let response = await axios(config);
            let combinedStateDistrictData = {
                state_id: promised_state_data.states[i].state_id,
                state_name: promised_state_data.states[i].state_name,
                districts: response.data.districts
            };
            await combinedStateDistrictDataList.push(combinedStateDistrictData);
        }
    } catch(error) {
        errorHandler(error);
    } finally {
        return combinedStateDistrictDataList;
    }
};

let getDistrictsByState = async (stateId) => {
    if (stateId) {
        let config = {
            method: "get",
            url: "https://cdn-api.co-vin.in/api/v2/admin/location/districts/" + parseInt(stateId),
            headers: {
                "accept": "application/json",
                "Accept-Language": "hi_IN",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
            }
        }
        let response = await axios(config);
        return await response.data;
    }
};



module.exports = { slotsCalenderByPin, slotsCalenderByDistrict, getAllDistricts, getDistrictsByState };