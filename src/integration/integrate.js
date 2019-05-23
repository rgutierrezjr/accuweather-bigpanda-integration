require('../config/config')

const bigpanda = require('../bigpanda/bigpanda')
const accuweather = require('../accuweather/accuweather')

// Dynamically load keys and tokens.
const accuWeatherApiKey = process.env.ACCU_WEATHER_API_KEY
const bigPandaBearerToken = process.env.BIG_PANDA_BEARER_TOKEN
const bigPandaAppKey = process.env.BIG_PANDA_APP_KEY

// This function will orchestrate the integration between AccuWeather and BigPanda.
const integrate = (location, locationId, callback) => {

    accuweather.getCurrentConditions(accuWeatherApiKey, locationId, (errorMessage, weatherResults) => {
        if (errorMessage) {
            // If an error is detected, return error.
            // Alternatives: write to a file, notify an external source, or add to a queue for reattempt.

            return callback(errorMessage)
        }

        // Build BigPanda payload with results from AccuWeather response.
        const alertPayload = {
            app_key : `${bigPandaAppKey}`,
            status : `warning`,
            host: `${location}`,
            check: 'Weather Check',
            incident_identifier: `${locationId}_9`,
            condition: weatherResults.WeatherText,
            precipitation: weatherResults.HasPrecipitation,
            precipitation_type: weatherResults.PrecipitationType,
            link: weatherResults.Link
        }

        // Send alert to BigPanda API.
        bigpanda.postNotification(bigPandaBearerToken, alertPayload, (errorMessage, notificationResult) => {
            if (errorMessage) {
                // If an error is detected, return error.

                return callback(errorMessage)
            }

            // Print success message to the console.
            // Alternatives: notify an external source or complete a queue item.

            return callback(undefined, notificationResult)
        })
    })
}

module.exports.integrate = integrate
