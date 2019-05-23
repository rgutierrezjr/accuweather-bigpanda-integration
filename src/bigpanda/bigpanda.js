const request = require('request');

// This function will post the given body to the BigPanda Alerts API.
// The function is generic but could be generalized further to accept any method and resource.
const postNotification = (bearerToken, body, callback) => {

    if (!bearerToken || bearerToken === '') {
        return callback('Error: Bearer token required')
    }

    if (!body || body === '') {
        return callback('Error: Body is required')
    }

    request({
        body: JSON.stringify(body),
        method: 'POST',
        url: `https://api.bigpanda.io/data/v2/alerts`,
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        }
    }, (error, response) => {

        if (error || response === undefined) {
            return callback('Error: Unable to connect to BigPanda API')
        }

        switch (response.statusCode) {
            case 400:
                return callback('Error: Request had bad syntax or the parameters supplied were invalid')
                break
            case 401:
                return callback('Error: Unauthorized. API authorization failed')
                break
            case 404:
                return callback('Error: Server has not found a route matching the given URI')
                break
            case 410:
                return callback('Error: Requested resource is no longer available')
                break
            case 500:
                return callback('Error: Server encountered an unexpected condition which prevented it from fulfilling the request')
                break
            case 501:
                return callback('Error: Unsupported method')
                break
            case 201:
                return callback(undefined, 'Success: BigPanda notified.')
                break
        }
    });
};

module.exports.postNotification = postNotification;
