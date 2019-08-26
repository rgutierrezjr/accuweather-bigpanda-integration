const amqp = require('amqplib/callback_api');

// Connect to the RabbitMQ (queue) server. I'm using RabbitMQ as a service here; CloudAMQP.
// The AMQP url. For the purposes of this demonstration, url - creds in plaintext.
const amqpURL = 'amqp://obbyndqs:qF8AsQY136AHUBFeHIB24JxsXIG11szQ@lion.rmq.cloudamqp.com/obbyndqs';

/**
 * This service will push a new notification to "queue" with the "options" passed.
 * @param notification The message payload.
 * @param queue The name of the queue to push to.
 * @param options The options for this push action.
 */
const push = (notification, queue, options) => {
  amqp.connect(amqpURL, (error0, connection) => {
    if (error0) {
      return 'Queue Error: Could not connect to CloudAMQP.';
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
          return 'Queue Error: Could not create channel to CloudAMQP.';
      }

      channel.assertQueue(queue, {
        durable: false,
      });

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(notification)), options);
    });
  });

  return 'Success: message queued.';
};

module.exports.push = push;
