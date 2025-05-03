const { Kafka } = require('kafkajs');

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'reservation-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});

// Create producer
const producer = kafka.producer();

// Connect producer on service startup
const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Kafka producer:', error);
    return false;
  }
};

// Disconnect producer on service shutdown
const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log('Kafka producer disconnected successfully');
    return true;
  } catch (error) {
    console.error('Failed to disconnect Kafka producer:', error);
    return false;
  }
};

// Send message to Kafka topic
const sendMessage = async (topic, message) => {
  try {
    // Ensure producer is connected
    if (!producer.isConnected) {
      await connectProducer();
    }

    // Send the message
    await producer.send({
      topic,
      messages: [
        { 
          key: message.id || String(Date.now()), 
          value: JSON.stringify(message) 
        }
      ]
    });

    console.log(`Message sent to topic ${topic}`);
    return true;
  } catch (error) {
    console.error(`Failed to send message to topic ${topic}:`, error);
    return false;
  }
};

// Common event types for the reservation service
const RESERVATION_EVENTS = {
  CREATED: 'reservation.created',
  APPROVED: 'reservation.approved',
  REJECTED: 'reservation.rejected',
  CANCELLED: 'reservation.cancelled',
  COMPLETED: 'reservation.completed'
};

module.exports = {
  connectProducer,
  disconnectProducer,
  sendMessage,
  RESERVATION_EVENTS
}; 