# Democratizing Science: Open Science Collaboration Hub

##Full solution with architecture here -> https://github.com/Ablikon/SystemDesign-final

## Revolutionizing Scientific Research

Imagine a world where a young scientist from a developing country can use an advanced electron microscope located thousands of miles away in a prestigious laboratory. Or a scenario where a researcher from a small university gets access to a multi-million dollar mass spectrometer without the need for long trips and waiting periods. This is not science fiction – this is the reality created by the **Open Science Collaboration Hub** project.

## The Problem Being Solved

Modern science faces serious challenges:

* **Unequal access to equipment**: Expensive scientific instruments are concentrated in wealthy institutions, leaving researchers from less well-funded institutes and countries without access to cutting-edge technologies.

* **Idle resources**: Even in the world's best laboratories, complex equipment is often used only a few hours a day, sitting idle the rest of the time.

* **Difficulty reproducing experiments**: Reproducibility is a cornerstone of science, but differences in equipment make it difficult to precisely replicate experiments.

* **Isolated expertise**: Specialists in working with complex equipment rarely venture beyond their institutions, limiting the spread of advanced techniques.

## The Solution

Open Science Collaboration Hub is an innovative platform that connects researchers with laboratory equipment, transcending institutional boundaries. Using modern remote access technologies and microservice architecture, it creates an ecosystem for truly open science.

### How It Works

1. **Global equipment catalog**: Researchers can search for available equipment worldwide, applying filters by type, specifications, and availability.

2. **Intelligent reservation system**: Book time on selected equipment, specifying purpose and requirements. Laboratory managers can review the request and provide access.

3. **Remote control**: Control equipment through intuitive web interfaces, observe experiments through real-time video streams.

4. **Data collection and analysis**: Collect and analyze data in real time, collaborating with colleagues around the world.

5. **Protocol sharing**: Share experimental protocols, ensuring clear documentation and reproducibility.

## Technological Innovations

This project uses advanced technologies:

* **Microservice architecture**: Each system component works as a separate service, providing flexibility and scalability.

* **Event-driven interaction**: Asynchronous communication between services through Kafka ensures reliability and system resilience.

* **Secure authentication**: JWT tokens and role-based access protect data and equipment.

* **Docker containerization**: Each service runs in an isolated environment for maximum compatibility and ease of deployment.

## Potential Impact

Open Science Collaboration Hub can fundamentally change the scientific ecosystem:

* **Democratization of science**: Researchers from anywhere in the world will gain access to cutting-edge equipment.

* **Increased resource utilization efficiency**: Laboratories can monetize the downtime of expensive equipment.

* **Acceleration of scientific discoveries**: Simplified access to equipment will speed up the pace of research and innovation.

* **Improved reproducibility**: Standardized interfaces and common protocols will facilitate experiment reproduction.

* **Development of interdisciplinary collaboration**: The platform will bring together scientists from different fields and regions, fostering innovative projects.

## Current Implementation

To demonstrate the concept, the core components of the platform have been implemented:

* User authentication system
* Equipment catalog with search functionality
* Reservation system with approval workflows
* Event-driven notification system
* Basic web interface for platform interaction

Future versions will add remote equipment control, data analysis tools, and enhanced collaboration capabilities.

---

## README

# Open Science Collaboration Hub - System Design Project

## Implementation Scope

For this implementation, I've focused on the core functionality that demonstrates the system's architecture and validates key design decisions:

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
git clone https://github.com/Ablikon/SystemDesign-final.git
```

2. Install dependencies:
```
npm run install:all
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
├── design_document_final.md  # Complete system design documentation
└── docker-compose.yml        # Docker composition for services
```

## Authentication & Authorization

- The system requires authentication for creating reservations
- JWT authentication is implemented via the Identity Service
- Role-based access control restricts reservation approvals to laboratory managers

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

## Running Tests

```
npm test
```

## Important Notes for Instructors

This project demonstrates key system design principles:
- Microservices architecture
- Event-driven communication
- API Gateway pattern
- Authentication and authorization
- Docker containerization
