const { Kafka } = require('kafkajs');


const kafka = new Kafka({
  clientId: 'reservation-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});


const producer = kafka.producer();

ъ
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


const sendMessage = async (topic, message) => {
  try {

    if (!producer.isConnected) {
      await connectProducer();
    }


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