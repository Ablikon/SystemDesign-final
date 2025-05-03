const express = require('express');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const winston = require('winston');

// Initialize logger
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

// Initialize Express app
const app = express();
const port = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Kafka setup
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

// Notification handlers
const notificationHandlers = {
  'reservation.created': async (message) => {
    const reservation = JSON.parse(message.value.toString());
    logger.info(`New reservation created: ${reservation.id}`);
    // TODO: Send email notification to lab manager
  },
  'reservation.approved': async (message) => {
    const reservation = JSON.parse(message.value.toString());
    logger.info(`Reservation approved: ${reservation.id}`);
    // TODO: Send email notification to researcher
  },
  'reservation.rejected': async (message) => {
    const reservation = JSON.parse(message.value.toString());
    logger.info(`Reservation rejected: ${reservation.id}`);
    // TODO: Send email notification to researcher
  },
  'equipment.status.changed': async (message) => {
    const equipment = JSON.parse(message.value.toString());
    logger.info(`Equipment status changed: ${equipment.id} to ${equipment.status}`);
    // TODO: Send notifications to relevant users
  }
};

// Start Kafka consumer
const runConsumer = async () => {
  try {
    await consumer.connect();
    
    // Subscribe to all relevant topics
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
          // Process message based on topic
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
    setTimeout(runConsumer, 5000); // Try to reconnect after 5 seconds
  }
};

// API endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start Express server
app.listen(port, () => {
  logger.info(`Notification service listening on port ${port}`);
  // Start Kafka consumer
  runConsumer().catch(error => {
    logger.error(`Failed to run Kafka consumer: ${error.message}`, { error });
  });
});

// Handle graceful shutdown
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