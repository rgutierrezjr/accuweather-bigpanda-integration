const expect = require('chai').expect
const nock = require('nock')

const bigpanda = require('../bigpanda/bigpanda')
const accuweather = require('../accuweather/accuweather')

const accuweather_response_pass = require('./accuweather-response-pass')
const bigpanda_response_pass = require('./bigpanda-response-pass')

const apiKey = "test_key"
const locationId = "test_location_id"
const bearerToken = "test_bearer_token"

const alertPayload = {
    app_key : 'test_app_key',
    status : 'warning',
    host: 'test_location',
    check: 'Weather Check',
    incident_identifier: 'test_location_id',
    condition: 'Partly sunny',
    precipitation: false,
    precipitation_type: null,
    link: "http://www.accuweather.com/en/us/new-york-ny/10007/current-weather/349727?lang=en-us"
}

// The idea behind the following unit tests is not that we are testing AccuWeather or BigPanda's API but rather
// our application. For this reason, we are making the assumption that both AccuWeather and BigPanda's responses are predictable.
// These expected responses will be managed in a separate files and be used to test our handling of those responses.

describe('AccuWeather: successful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(200, accuweather_response_pass);
    })

    it('Retrieval of current weather conditions', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(weatherResults.condition).to.equal('Partly sunny')
            expect(weatherResults.has_precipitation).to.equal(false)
            expect(weatherResults.precipitation_type).to.equal(null)
            expect(weatherResults.temperature_fahrenheit).to.equal(70)
            expect(weatherResults.temperature_celsius).to.equal(21.1)
            expect(weatherResults.link).to.equal("http://www.accuweather.com/en/us/new-york-ny/10007/current-weather/349727?lang=en-us")
        })
    })

})

describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(401, undefined);
    })

    it('401, unauthorized handling ', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Unauthorized. API authorization failed')
        })
    })

})

describe('BigPanda: successful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(200, bigpanda_response_pass);
    })

    it('Best case, successful request', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(notificationResult).to.equal('Success: BigPanda notified.')
        })
    })

})

describe('BigPanda: unsuccessful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(401, bigpanda_response_pass);
    })

    it('401, unauthorized handling ', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Unauthorized. API authorization failed')
        })
    })

})