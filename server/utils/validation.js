// Checks the given string if it is a valid string
var isRealString = (str) => {
    return typeof str === 'string' && str.trim().length > 0;
}; 

module.exports = {isRealString};