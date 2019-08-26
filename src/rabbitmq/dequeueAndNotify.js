const amqp = require('amqplib/callback_api');
const bigpanda = require('../bigpanda/bigpanda');
const queue = require('../rabbitmq/queueNotification');

const bigPandaBearerToken = process.env.BIG_PANDA_BEARER_TOKEN;

// The AMQP url. For the purposes of this demonstration, url - creds in plaintext.
const amqpURL = 'amqp://obbyndqs:qF8AsQY136AHUBFeHIB24JxsXIG11szQ@lion.rmq.cloudamqp.com/obbyndqs';

/**
 * This service will listen for messages in the "notifyQueue" queue. If we fail to notify BigPanda for whatever reason
 * we will ack the message and redeliver to "notifyQueue" with decremented "reattempts_remaining". If "reattempts_remaining"
 * reaches 0, the message will be discarded and redelivered to "deadLetterQueue".
 * @param notifyQueue
 * @param deadLetterQueue
 */
const listenAndNotify = (notifyQueue, deadLetterQueue) => {
  amqp.connect(amqpURL, (error0, connection) => {
    if (error0) {
        return 'Dequeue Error: Could not connect to CloudAMQP.';
    }

    connection.createChannel((error1, channel) => {
      if (error1) {
          return 'Dequeue Error: Could not create channel to CloudAMQP.';
      }

      channel.assertQueue(notifyQueue, {
        durable: false,
      });

      channel.consume(notifyQueue, (msg) => {
        const payload = JSON.parse(msg.content);

        // Send alert to BigPanda API.
        bigpanda.postNotification(bigPandaBearerToken, payload, (errorMessage, notificationResult) => {
          if (errorMessage) {
            const options = {
              persistent: true,
              contentType: 'application/json',
              type: 'big_panda_notification',
              headers: {
                reattempts_remaining: 5,
              },
            };

            // console.log("message details:", msg);

            // Because RabbitMQ message properties are immutable, we need to first ack the message
            // and then requeue the message with an updated "reattempts remaining" counter.
            // There is an inherit danger to this in that if the application were to
            // crash between re-queueing and ack we would either lose the message or create a duplicate
            // message, depending on the order.
            // Using a broker like Redis with built in retry handling would be preferable.
            // Knowing this, I wanted to go this route to show knowledge of both.
            const reattemptsRemaining = msg.properties.headers.reattempts_remaining;
            if (reattemptsRemaining > 0) {
              options.headers.reattempts_remaining = reattemptsRemaining - 1;
              queue.push(payload, notifyQueue, options);
            } else {
              // If we have exhausted reattempts, we will push this message to a "dead letter" queue.

              // Note: you can register RabbitMQ queues with a dead letter queue through exchange configurations.
              // A message can be routed to a dead letter queue on "nack", expiry or drop due to max queue length.
              // That being said, I wanted to do this manually to support maximum reattempts and make use of the
              // generic "push" service I implemented.
              queue.push(payload, deadLetterQueue, options);
            }
          }

          // Ack queue item to discard.
          channel.ack(msg);
        });
      });
    });
  });
};

module.exports.listenAndNotify = listenAndNotify;
