const configuration = {
    headless : false,
    slowDown: 250, 
    startingTimeOfDay: 7,  //24 hour clock,
    endingTimeOfDay: 23,    // 24 hour clock,
    renewTimeRange: [65, 70]   // 65 to 70 minutes default ( Must be greater than 60)
}




module.exports = {configuration}