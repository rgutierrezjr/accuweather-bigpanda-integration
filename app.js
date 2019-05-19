
// This file will orchestrate the integration between AccuWeather and BigPanda.
// Using the pre-configured locations below, the application will request current real-time
// weather conditions and then notify BigPanda of said conditions to form correlation between them.

require('./config/config')

const bigpanda = require('./bigpanda/bigpanda')
const accuweather = require('./accuweather/accuweather')

// Dynamically load keys and tokens.
const accuWeatherApiKey = process.env.ACCU_WEATHER_API_KEY
const bigPandaBearerToken = process.env.BIG_PANDA_BEARER_TOKEN
const bigPandaAppKey = process.env.BIG_PANDA_APP_KEY

const locations = new Map()

// For demonstration purposes, this integration is implemented specifically for the locations below.
// However, each integration piece ("getCurrentConditions" and "postNotification") is implemented generically and can be reused
// with any location.

locations.set('New York', [ "349727", "710949", "2531279", "2245721", "2212053"])
locations.set('Chicago', [ "348308", "2249562", "1162619", "1169367", "1068089"])
locations.set('San Francisco', [ "347629", "113032", "261737", "3409211", "262723"])

// Iterate through the location map, fetch current conditions and then notify BigPanda.
// An alternative method would be to fetch all weather conditions up front and then
// build a single notification payload; this is supported by BigPanda.

locations.forEach((locationIds, location) => {

    // Iterate through a location's (New York) location ids.

    locationIds.forEach((locationId) => {

        accuweather.getCurrentConditions(accuWeatherApiKey, locationId, (errorMessage, weatherResults) => {
            if (errorMessage) {
                // If an error is detected, print the details to console.
                // Alternatives: write to a file, notify an external source, or add to a queue for reattempt.

                console.log(errorMessage)
            } else {

                // Build BigPanda payload with results from AccuWeather response.
                const alertPayload = {
                    app_key : `${bigPandaAppKey}`,
                    status : `warning`,
                    host: `${location}`,
                    check: 'Weather Check',
                    incident_identifier: `${locationId}`,
                    condition: weatherResults.condition,
                    precipitation: weatherResults.has_precipitation,
                    precipitation_type: weatherResults.precipitation_type,
                    link: weatherResults.link
                }

                // Send alert to BigPanda API.
                bigpanda.postNotification(bigPandaBearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
                    if (errorMessage) {
                        // If an error is detected, print the details to console.
                        // Alternatives: write to a file, notify an external source, or add to a queue for reattempt.

                        console.log(errorMessage);
                    } else {
                        // Print success message to the console.
                        // Alternatives: notify an external source or complete a queue item.

                        console.log(notificationResult);
                    }
                })
            }
        })
    })
})









