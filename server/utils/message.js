const moment = require('moment');

// Creates and returns a message object
var generateMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf()
    }
};

// Creates and returns a location object 
var generateLocationMessage = (from, latitude, longitude) => {
    return {
        from,
        url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        createdAt: moment().valueOf()
    }
};

module.exports = {generateMessage, generateLocationMessage};