const express = require('express');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const winston = require('winston');


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});


const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());


const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'notification-group' });


const notificationHandlers = {
  'reservation.created': async (message) => {
    const reservation = JSON.parse(message.value.toString());
    logger.info(`New reservation created: ${reservation.id}`);

  },
  'reservation.approved': async (message) => {
    const reservation = JSON.parse(message.value.toString());
    logger.info(`Reservation approved: ${reservation.id}`);

  },
  'reservation.rejected': async (message) => {
    const reservation = JSON.parse(message.value.toString());
    logger.info(`Reservation rejected: ${reservation.id}`);

  },
  'equipment.status.changed': async (message) => {
    const equipment = JSON.parse(message.value.toString());
    logger.info(`Equipment status changed: ${equipment.id} to ${equipment.status}`);

  }
};


const runConsumer = async () => {
  try {
    await consumer.connect();
    

    await consumer.subscribe({ 
      topics: [
        'reservation.created', 
        'reservation.approved', 
        'reservation.rejected',
        'equipment.status.changed'
      ] 
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        logger.info(`Received message from topic: ${topic}`);
        
        try {

          if (notificationHandlers[topic]) {
            await notificationHandlers[topic](message);
          } else {
            logger.warn(`No handler for topic: ${topic}`);
          }
        } catch (error) {
          logger.error(`Error processing message: ${error.message}`, { error });
        }
      }
    });
  } catch (error) {
    logger.error(`Failed to start Kafka consumer: ${error.message}`, { error });
    setTimeout(runConsumer, 5000); 
  }
};


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});


app.listen(port, () => {
  logger.info(`Notification service listening on port ${port}`);

  runConsumer().catch(error => {
    logger.error(`Failed to run Kafka consumer: ${error.message}`, { error });
  });
});


process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received, shutting down gracefully');
  await consumer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received, shutting down gracefully');
  await consumer.disconnect();
  process.exit(0);
}); 