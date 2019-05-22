const integration = require('./integration/integrate')

// Using the pre-configured locations below, this application will request current real-time
// weather conditions and then notify BigPanda of said conditions to form correlation between them.

const locations = new Map()

// For demonstration purposes, this integration is implemented specifically for the locations below.
// However, each integration piece ("getCurrentConditions" and "postNotification") is implemented generically and can be reused
// with any location.

// I could see this reading in locations from a file, a database, from the command line, or from an external
// source (incoming api calls) and pushed into a queue. The following would instead read/pop from said queue and process
// locations accordingly. Those making it end-to-end would be marked as complete and the rest as failed to guarantee delivery.

locations.set('New York', [ "349727", "710949", "2531279", "2245721", "2212053"])
locations.set('Chicago', [ "348308", "2249562", "1162619", "1169367", "1068089"])
locations.set('San Francisco', [ "347629", "113032", "261737", "3409211", "262723"])

// Iterate through the location map, fetch current conditions and then notify BigPanda.
// An alternative method would be to fetch all weather conditions up front and then
// build a single notification payload; this is supported by BigPanda.

locations.forEach((locationIds, location) => {

    // Iterate through a location's (New York) location ids.

    locationIds.forEach((locationId) => {

        // Invoke integration.

        integration.integrate(location, locationId, (error, message) => {
            if (!error) {
                // Failed to integrate.
                // Alternatives: write to a file, notify an external source, or mark queue item as failed for reattempt.

                console.log(message)
            } else {
                // Successfully retrieve current conditions and notify big panda.
                // Alternatives: write to a file, notify an external source, or complete queue item.

                console.log(message)
            }
        })

    })

})







