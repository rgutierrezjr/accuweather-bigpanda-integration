const { expect } = require('chai');
const nock = require('nock');

const accuweather = require('../src/accuweather/accuweather');

const accuweather_response_pass = require('./accuweather-response-pass');

const apiKey = 'test_key';
const locationId = 'test_location_id';


// The idea behind the following unit tests is not that we are testing AccuWeather or BigPanda's API but rather
// our application. For this reason, we are making the assumption that both AccuWeather and BigPanda's responses are predictable.
// These expected responses will be managed in a separate files and be used to test our handling of those responses.

// The following is a suite of predictable unsuccessful AccuWeather API requests.

describe('AccuWeather', () => {
  describe('successful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .reply(200, accuweather_response_pass);
    });

    it('Retrieval of current weather conditions', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(weatherResults.WeatherText).to.equal('Partly sunny');
      expect(weatherResults.HasPrecipitation).to.equal(false);
      expect(weatherResults.PrecipitationType).to.equal(null);
      expect(weatherResults.Temperature.Imperial.Value).to.equal(70);
      expect(weatherResults.Temperature.Metric.Value).to.equal(21.1);
      expect(weatherResults.Link).to.equal('http://www.accuweather.com/en/us/new-york-ny/10007/current-weather/349727?lang=en-us');
    }));
  });

  describe('Invalid api key', () => {
    it('Empty bearer token', () => accuweather.getCurrentConditions('', locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: API Key is required');
    }));

    it('Undefined bearer token', () => accuweather.getCurrentConditions('', undefined, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: API Key is required');
    }));
  });

  describe('Invalid location id', () => {
    it('Empty location id ', () => accuweather.getCurrentConditions(apiKey, '', (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Location id is required');
    }));

    it('Undefined location id', () => accuweather.getCurrentConditions(apiKey, undefined, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Location id is required');
    }));
  });

  describe('unsuccessful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .reply(401, undefined);
    });

    it('401, unauthorized ', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Unauthorized. API authorization failed');
    }));
  });

  describe('unsuccessful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .reply(400, undefined);
    });

    it('400, bad syntax / invalid parameters ', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Request had bad syntax or the parameters supplied were invalid');
    }));
  });

  describe('unsuccessful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .reply(403, undefined);
    });

    it('403, unauthorized endpoint ', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Unauthorized. You do not have permission to access this endpoint');
    }));
  });

  describe('unsuccessful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .reply(404, undefined);
    });

    it('404, Invalid route / resource', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Server has not found a route matching the given URI');
    }));
  });

  describe('unsuccessful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .reply(500, undefined);
    });

    it('500, Server error ', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Server encountered an unexpected condition which prevented it from fulfilling the request');
    }));
  });

  describe('unsuccessful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .reply(503, undefined);
    });

    it('500, Service unavailable ', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Service unavailable');
    }));
  });

  describe('unsuccessful retrieval', () => {
    before(() => {
      nock('http://dataservice.accuweather.com')
        .get(`/currentconditions/v1/${locationId}?apikey=${apiKey}`)
        .replyWithError('Some unexpected error.');
    });

    it('Unexpected error', () => accuweather.getCurrentConditions(apiKey, locationId, (errorMessage, weatherResults) => {
      expect(errorMessage).to.equal('Error: Unable to connect to AccuWeather API');
    }));
  });
});
