const { expect } = require('chai');
const nock = require('nock');
const bigpanda = require('../src/bigpanda/bigpanda');

const bigpanda_response_pass = require('./bigpanda-response-pass');

const bearerToken = 'test_bearer_token';

const alertPayload = {
  app_key: 'test_app_key',
  status: 'warning',
  host: 'test_location',
  check: 'Weather Check',
  incident_identifier: 'test_location_id',
  condition: 'Partly sunny',
  precipitation: false,
  precipitation_type: null,
  link: 'http://www.accuweather.com/en/us/new-york-ny/10007/current-weather/349727?lang=en-us',
};

// The following is a suite of predictable unsuccessful Big Panda API notifications.

describe('BigPanda', () => {
  describe('successful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .reply(201, bigpanda_response_pass);
    });

    it('Best case, successful request', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(notificationResult).to.equal('Success: BigPanda notified.');
    }));
  });

  describe('Invalid bearer token', () => {
    it('Empty bearer token ', () => bigpanda.postNotification('', alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Bearer token required');
    }));

    it('Undefined bearer token ', () => bigpanda.postNotification(undefined, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Bearer token required');
    }));
  });

  describe('Invalid body', () => {
    it('Empty body', () => bigpanda.postNotification(bearerToken, '', (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Body is required');
    }));

    it('Undefined body ', () => bigpanda.postNotification(bearerToken, undefined, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Body is required');
    }));
  });

  describe('unsuccessful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .reply(401, bigpanda_response_pass);
    });

    it('401, unauthorized ', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Unauthorized. API authorization failed');
    }));
  });

  describe('unsuccessful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .reply(400, bigpanda_response_pass);
    });

    it('401, Invalid payload or parameters. ', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Request had bad syntax or the parameters supplied were invalid');
    }));
  });

  describe('unsuccessful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .reply(404, bigpanda_response_pass);
    });

    it('400, Invalid route or resource ', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Server has not found a route matching the given URI');
    }));
  });

  describe('unsuccessful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .reply(410, bigpanda_response_pass);
    });

    it('410, Invalid resource', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Requested resource is no longer available');
    }));
  });

  describe('unsuccessful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .reply(500, bigpanda_response_pass);
    });

    it('500, Server-side error', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Server encountered an unexpected condition which prevented it from fulfilling the request');
    }));
  });

  describe('unsuccessful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .reply(501, bigpanda_response_pass);
    });

    it('501, Unsupported method', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Unsupported method');
    }));
  });

  describe('unsuccessful notification', () => {
    before(() => {
      nock('https://api.bigpanda.io')
        .post('/data/v2/alerts')
        .replyWithError('Some unexpected error.');
    });

    it('Unexpected error', () => bigpanda.postNotification(bearerToken, alertPayload, (errorMessage, notificationResult) => {
      expect(errorMessage).to.equal('Error: Unable to connect to BigPanda API');
    }));
  });
});
