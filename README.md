# Open Science Collaboration Hub - Implementation

This repository contains a partial implementation (20-30%) of the Open Science Collaboration Hub, a platform that connects researchers with remote laboratory equipment across institutional boundaries.

## Implementation Scope

For this initial implementation, we've focused on the core functionality that demonstrates the system's architecture and validates key design decisions:

1. **User Authentication Service**: User registration, login, and role management
2. **Equipment Registry**: Equipment catalog with search functionality
3. **Reservation System**: Booking time slots with approval workflows
4. **Notification Service**: Event-driven notifications for system events
5. **Basic Web Interface**: Equipment discovery and reservation management

## Architecture Overview

This implementation follows a microservices architecture pattern as described in the design document. The key components are:

- **Frontend**: React application with TypeScript and Material UI
- **API Gateway**: Express-based gateway for routing and authentication
- **Microservices**: 
  - Identity Service (Node.js)
  - Equipment Registry Service (Node.js)
  - Reservation Service (Node.js)
  - Notification Service (Node.js)
- **Databases**:
  - PostgreSQL for user, equipment, and reservation data
  - Redis for caching and session management
- **Event Streaming**:
  - Kafka for asynchronous event-driven communication
  - Zookeeper for Kafka cluster management

## Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- Git

## Getting Started

1. Clone this repository:
```
git clone https://github.com/yourusername/open-science-hub.git
cd open-science-hub
```

2. Install dependencies:
```
npm install
```

3. Start the development environment:
```
docker-compose up
```

4. Access the application:
- Web UI: http://localhost:3000
- API: http://localhost:8080
- Kafka UI: http://localhost:8090 (for monitoring Kafka topics and messages)

## Project Structure

```
├── client/                   # Frontend React application
├── server/                   # Backend services
│   ├── api-gateway/          # API Gateway service
│   ├── identity-service/     # Authentication and user management
│   ├── equipment-service/    # Equipment catalog and search
│   ├── reservation-service/  # Booking and approval workflows
│   └── notification-service/ # Event-driven notification system
├── docker/                   # Docker configuration files
├── docs/                     # Additional documentation
└── scripts/                  # Utility scripts
```

## Event-Driven Architecture

The system uses Kafka for asynchronous communication between services:

1. **Topics**:
   - `reservation.created`: New reservation requests
   - `reservation.approved`: Approved reservations
   - `reservation.rejected`: Rejected reservations
   - `equipment.status.changed`: Equipment status updates

2. **Producers**:
   - Reservation Service: Publishes reservation events
   - Equipment Service: Publishes equipment status events

3. **Consumers**:
   - Notification Service: Processes events to send notifications
   - Analytics Service (future): Will process events for reporting

## Running Tests

```
npm test
```

## Development

To run individual services during development:

```
# Start the frontend
cd client
npm start

# Start a specific backend service
cd server/identity-service
npm start
```

## API Documentation

API documentation is available at http://localhost:8080/api/docs when the application is running.

## License

MIT # SystemDesign-final
