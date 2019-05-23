const request = require('request');

// Invoke the AccuWeather API. Returns the current weather conditions for the location id passed in.
const getCurrentConditions = (apiKey, locationId, callback) => {

    if (!apiKey || apiKey === '') {
        return callback('Error: API Key is required')
    }

    if (!locationId || locationId === '') {
        return callback('Error: Location id is required')
    }

    request({
        method: 'GET',
        url: `http://dataservice.accuweather.com/currentconditions/v1/${locationId}?apikey=${apiKey}`,
        json: true
    }, (error, response, body) => {

        if (error) {
            return callback('Error: Unable to connect to AccuWeather API')
        }

        switch (response.statusCode) {
            case 400:
                return callback('Error: Request had bad syntax or the parameters supplied were invalid')
                break
            case 401:
                return callback('Error: Unauthorized. API authorization failed')
                break
            case 403:
                return callback('Error: Unauthorized. You do not have permission to access this endpoint')
                break
            case 404:
                return callback('Error: Server has not found a route matching the given URI')
                break
            case 500:
                return callback('Error: Server encountered an unexpected condition which prevented it from fulfilling the request')
                break
            case 503:
                return callback('Error: Service unavailable')
                break
            case 200:
                return callback(undefined, body[0])
                break
        }
    });
};

module.exports.getCurrentConditions = getCurrentConditions;
