const request = require('request');

// This function will post the given body to the BigPanda Alerts API.
// The function is generic but could be refactored to accept any method and resource.
const postNotification = (bearerToken, body, callback) => {

    request({
        body: body,
        method: 'POST',
        url: `https://api.bigpanda.io/data/v2/alerts`,
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
        }
    }, (error, response) => {

        if (error) {
            callback('Error: Unable to connect to BigPanda API');
        } else if (response.statusCode === 400) {
            callback('Error: Request had bad syntax or the parameters supplied were invalid');
        } else if (response.statusCode === 401) {
            callback('Error: Unauthorized. API authorization failed');
        } else if (response.statusCode === 404) {
            callback('Error: Server has not found a route matching the given URI');
        } else if (response.statusCode === 410) {
            callback('Error: Requested resource is no longer available');
        } else if (response.statusCode === 500) {
            callback('Error: Server encountered an unexpected condition which prevented it from fulfilling the request');
        } else if (response.statusCode === 501) {
            callback('Error: Unsupported method');
        } else {
            callback('Success: BigPanda notified.');
        }
    });
};

module.exports.postNotification = postNotification;
