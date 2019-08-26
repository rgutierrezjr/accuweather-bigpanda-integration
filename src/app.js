const integration = require('./integration/integrate');
const queue = require('./rabbitmq/dequeueAndNotify');

// RabbitMQ Queues
const deadLetterQueue = 'dead_letter_queue';
const notifyQueue = 'notify_big_panda_queue';

// Using the pre-configured locations below, this application will request current real-time
// weather conditions and then notify BigPanda (a data enrichment and correlation platform) of said conditions to form
// correlation between them.

const locations = new Map();

// For demonstration purposes, this integration is implemented specifically for the locations below.
// However, each integration piece ("getCurrentConditions" and "postNotification") is implemented generically and can be
// reused with any location.

// I could see this reading in locations from a file, a database, from the command line, or from an external
// source (incoming api calls) and pushed into a queue. The following would instead read/pop from said source and
// process locations accordingly. Those making it end-to-end would could be marked as complete and the rest as failed
// to guarantee delivery.

locations.set('New York', ['349727', '710949', '2531279', '2245721', '2212053']);
locations.set('Chicago', ['348308', '2249562', '1162619', '1169367', '1068089']);
locations.set('San Francisco', ['347629', '113032', '261737', '3409211', '262723']);

// Iterate through the location map, fetch current conditions and then notify BigPanda.
// An alternative method would be to fetch all weather conditions up front and then
// build a single notification payload; this is supported by BigPanda.

// Start RabbitMQ queue listener. This listener will consume queue items as they're pushed
// by "fetchWeatherAndQueue". One important aspect to note here is that, ideally, we would
// have a consumer application listening indefinitely for new notifications to send. However,
// for the purposes of this demonstration I've included both the producer and consumer code
// in one application.
queue.listenAndNotify(notifyQueue, deadLetterQueue);

locations.forEach((locationIds, location) => {
  // Iterate through a location's (New York) location ids.

  locationIds.forEach((locationId) => {
    // Fetch weather conditions for location and push to queue.

    integration.fetchWeatherAndQueue(location, locationId, (error, result) => {
      if (error) {
        console.log('unsuccessful fetch and queue:', error);
      } else {
        console.log('successful fetch and queue', result);
      }
    });
  });
});
