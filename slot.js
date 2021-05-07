const cowin = require("./cowin");


let checkSlots = async (element,errorHandler) => {
    let centerFilteredData = [];
    try {
        if (element.location && element.location == "pincode") {
            let slots_calender_by_pin_data = await cowin.slotsCalenderByPin(element);
            let sessionFilteredData = await slots_calender_by_pin_data.centers.map((center) => {
                return {...center, sessions: center.sessions.filter(session => session.min_age_limit <= parseInt(element.age) &&  session.available_capacity > 0)};
            });
            centerFilteredData = await sessionFilteredData.filter(center => center.sessions.length > 0);
        } else if(element.location && element.location == "district") {
            let slots_calender_by_district_data = await cowin.slotsCalenderByDistrict(element);
            let sessionFilteredData = await slots_calender_by_district_data.centers.map((center) => {
                return {...center, sessions: center.sessions.filter(session => session.min_age_limit <= parseInt(element.age) &&  session.available_capacity > 0)};
            });
            let centerFilteredData = await sessionFilteredData.filter(center => center.sessions.length > 0);
        }
    } catch(error) {
        errorHandler(error);
    } finally {
        return centerFilteredData;
    }
}


module.exports = { checkSlots };