const request = require('request');

// Invoke the AccuWeather API. Returns the current weather conditions for the location id passed in.
const getCurrentConditions = (apiKey, locationId, callback) => {
    request({
        method: 'GET',
        url: `http://dataservice.accuweather.com/currentconditions/v1/${locationId}?apikey=${apiKey}`,
        json: true
    }, (error, response, body) => {
        if (error) {
            callback('Error: Unable to connect to AccuWeather API');
        } else if (response.statusCode === 400) {
            callback('Error: Request had bad syntax or the parameters supplied were invalid');
        } else if (response.statusCode === 401) {
            callback('Error: Unauthorized. API authorization failed');
        } else if (response.statusCode === 403) {
            callback('Error: Unauthorized. You do not have permission to access this endpoint');
        } else if (response.statusCode === 404) {
            callback('Error: Server has not found a route matching the given URI');
        } else if (response.statusCode === 500) {
            callback('Error: Server encountered an unexpected condition which prevented it from fulfilling the request');
        } else if (response.statusCode === 503) {
            callback('Error: Service unavailable')
        } else if (response.statusCode === 200) {
            callback(undefined, body[0])
        }
    });
};

module.exports.getCurrentConditions = getCurrentConditions;
