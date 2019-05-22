const expect = require('chai').expect
const nock = require('nock')

const bigpanda = require('../bigpanda/bigpanda')
const accuweather = require('../accuweather/accuweather')
const integration = require('../integration/integrate')

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
            expect(weatherResults.WeatherText).to.equal('Partly sunny')
            expect(weatherResults.HasPrecipitation).to.equal(false)
            expect(weatherResults.PrecipitationType).to.equal(null)
            expect(weatherResults.Temperature.Imperial.Value).to.equal(70)
            expect(weatherResults.Temperature.Metric.Value).to.equal(21.1)
            expect(weatherResults.Link).to.equal("http://www.accuweather.com/en/us/new-york-ny/10007/current-weather/349727?lang=en-us")
        })
    })

})

// The following is a suite of predictable unsuccessful AccuWeather API requests.
describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(401, undefined);
    })

    it('401, unauthorized ', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Unauthorized. API authorization failed')
        })
    })

})

describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(400, undefined);
    })

    it('400, bad syntax / invalid parameters ', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Request had bad syntax or the parameters supplied were invalid')
        })
    })

})

describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(403, undefined);
    })

    it('403, unauthorized endpoint ', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Unauthorized. You do not have permission to access this endpoint')
        })
    })

})

describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(404, undefined);
    })

    it('404, Invalid route / resource', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Server has not found a route matching the given URI')
        })
    })

})

describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(500, undefined);
    })

    it('500, Server error ', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Server encountered an unexpected condition which prevented it from fulfilling the request')
        })
    })

})

describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .reply(503, undefined);
    })

    it('500, Service unavailable ', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Service unavailable')
        })
    })

})

describe('AccuWeather: unsuccessful retrieval', () => {

    before(() => {
        nock('http://dataservice.accuweather.com')
            .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
            .replyWithError('Some unexpected error.');
    })

    it('Unexpected error', () => {
        return accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
            expect(errorMessage).to.equal('Error: Unable to connect to AccuWeather API')
        })
    })

})

describe('BigPanda: successful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(201, bigpanda_response_pass);
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

    it('401, unauthorized ', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Unauthorized. API authorization failed')
        })
    })

})

// The following is a suite of predictable unsuccessful Big Panda API notifications.
describe('BigPanda: unsuccessful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(400, bigpanda_response_pass);
    })

    it('401, Invalid payload or parameters. ', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Request had bad syntax or the parameters supplied were invalid')
        })
    })

})

describe('BigPanda: unsuccessful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(404, bigpanda_response_pass);
    })

    it('400, Invalid route or resource ', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Server has not found a route matching the given URI')
        })
    })

})

describe('BigPanda: unsuccessful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(410, bigpanda_response_pass);
    })

    it('410, Invalid resource', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Requested resource is no longer available')
        })
    })

})

describe('BigPanda: unsuccessful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(500, bigpanda_response_pass);
    })

    it('500, Server-side error', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Server encountered an unexpected condition which prevented it from fulfilling the request')
        })
    })

})

describe('BigPanda: unsuccessful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .reply(501, bigpanda_response_pass);
    })

    it('501, Unsupported method', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Unsupported method')
        })
    })

})

describe('BigPanda: unsuccessful notification', () => {

    before(() => {
        nock('https://api.bigpanda.io')
            .post('/data/v2/alerts')
            .replyWithError('Some unexpected error.');
    })

    it('Unexpected error', () => {
        return bigpanda.postNotification(bearerToken, JSON.stringify(alertPayload), (errorMessage, notificationResult) => {
            expect(errorMessage).to.equal('Error: Unable to connect to BigPanda API')
        })
    })

})