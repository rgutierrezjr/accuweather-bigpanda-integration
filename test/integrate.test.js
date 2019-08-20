const { expect } = require('chai');
const nock = require('nock');

const bigpanda_response_pass = require('./bigpanda-response-pass');
const accuweather_response_pass = require('./accuweather-response-pass');

const integration = require('../src/integration/integrate');

describe('Integrate: successful integration', () => {
  before(() => {
    nock('http://dataservice.accuweather.com')
      .get('/currentconditions/v1/710949?apikey=J8vUGFMEx3k19kGjqvcjhsJbKyOHCbsA')
      .reply(200, accuweather_response_pass);

    nock('https://api.bigpanda.io')
      .post('/data/v2/alerts')
      .reply(201, bigpanda_response_pass);
  });

  it('Successful current condition retrieval and notification', () => integration.integrate('New York', '710949', (error, resultMessage) => {
    expect(resultMessage).to.equal('Success: BigPanda notified.');
  }));
});
