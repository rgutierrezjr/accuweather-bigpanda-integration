require('../config/config');

const accuweather = require('../accuweather/accuweather');
const notificationQueue = require('../rabbitmq/queueNotification');

// Dynamically load keys and tokens.
const accuWeatherApiKey = process.env.ACCU_WEATHER_API_KEY;
const bigPandaAppKey = process.env.BIG_PANDA_APP_KEY;

const notifyQueue = 'notify_big_panda_queue';

// This function will orchestrate the integration between AccuWeather and BigPanda.
const fetchWeatherAndQueue = (location, locationId, callback) => {
  accuweather.getCurrentConditions(accuWeatherApiKey, locationId, (errorMessage, weatherResults) => {
    if (errorMessage) {
      // If an error is detected, return error.
      // Alternatives: write to a file, notify an external source, or add to a queue for reattempt.

      return callback(errorMessage);
    }

    // Build a BigPanda payload with results from AccuWeather response. We will queue this
    // payload and notify BigPanda at a later time.
    const alertPayload = {
      app_key: `${bigPandaAppKey}`,
      status: 'warning',
      host: `${location}`,
      check: 'Weather Check',
      incident_identifier: `${locationId}_${Math.floor(Math.random() * 101)}`,
      condition: weatherResults.WeatherText,
      precipitation: weatherResults.HasPrecipitation,
      precipitation_type: weatherResults.PrecipitationType,
      link: weatherResults.Link,
    };

    // Define options for this channel. Set queue behavior and header values.
    // RabbitMQ by default does not have built in retry functionality so I will
    // be implementing this behavior myself using a "reattempts remaining" header field.
    // If we fail to notify BigPanda for whatever reason, we will redeliver this item
    // with decremented "reattempts remaining".
    const options = {
      persistent: true,
      contentType: 'application/json',
      type: 'big_panda_notification',
      headers: {
        reattempts_remaining: 5,
      },
    };

    // Queue payload for notification.
    return notificationQueue.push(alertPayload, notifyQueue, options);
  });
};

module.exports.fetchWeatherAndQueue = fetchWeatherAndQueue;
