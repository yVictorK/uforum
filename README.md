<h1 align="center">UForum</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status Badge"/>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next JS Badge"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring" alt="Spring Boot Badge"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License Badge"/>
</p>

## Table of Contents

- [Project Description](#project-description)
- [Project Status](#project-status)
- [Features and Demonstration](#features-and-demonstration)
- [Application Access and Execution](#application-access-and-execution)
- [Technologies Used](#technologies-used)
- [Developers](#developers)
- [License](#license)

## Project Description

UForum is a comprehensive digital ecosystem developed specifically for the Federal University of Amazonas (UFAM). The platform seamlessly integrates social interaction, advanced geospatial campus auditing, and academic management into a unified, high-performance web application. 

The application features a modern, premium "Liquid Glass" and Bento-inspired aesthetic, focusing on micro-interactions, responsive design, and intuitive user experiences. It is built to serve as a centralized hub for students, faculty, and administrative staff, providing tools for robust communication, campus navigation, and resource management.

## Project Status

**Active and Evolving**
The core functionality of the platform is fully developed and operational, including the social engine, interactive campus map, and hierarchical administration panel. Refinements, UI/UX optimizations, and advanced moderation features are actively being improved.

## Features and Demonstration

### Social Networking Engine
- **Community Architecture**: Supports course-specific and interest-based communities.
- **Nested Discussions**: Hierarchical threaded discussions for clear communication.
- **Dynamic Interactivity**: Includes real-time state synchronization for posts, upvotes, downvotes, and media attachments.

### Interactive Campus Mapping
- **Geospatial Precision**: Interactive campus map integrated with custom tiles.
- **Indoor Cartography**: Administrative tools allow for the creation and dynamic editing of building floors and rooms using advanced canvas-based rendering (Konva.js).
- **Event Localization**: Pins and interactive markers to locate campus events directly on the map.

### Administrative and Moderation Suite
- **Role-Based Access Control (RBAC)**: Secure access management for Administrators and Moderators.
- **Moderation Queue**: A complete dashboard to view, ignore, or resolve user reports, including the ability to permanently ban users or delete content.
- **Content Governance**: Thematic consistency across the application natively supporting light and dark modes.

### Academic Marketplace
- **Peer-to-Peer Transactions**: A secure environment for students to list academic textbooks, lab equipment, and services.
- **Listing Management**: Real-time status updates (Available, Reserved, Sold).

## Application Access and Execution

### Prerequisites

To run this project locally, ensure you have the following installed on your machine:
- Docker Engine
- Docker Compose
- Git

### Running the Application

1. Clone the repository:
```bash
git clone https://github.com/your-username/uforum.git
cd uforum
```

2. Execute the multi-container environment via Docker Compose:
```bash
docker compose up --build
```
*Alternatively, you can use the provided bash script `dev.sh` to initialize the environment.*

3. Access the interfaces:
- **Application Interface (Frontend)**: `http://localhost:3000`
- **RESTful API Endpoint (Backend)**: `http://localhost:8080/api/v1`
- **MailHog (SMTP Web Inspector)**: `http://localhost:8025`

### Authentication Notes
Registration requires valid institutional domains (`*.ufam.edu.br` or `*.alumni.ufam.edu.br`). During local development, password recovery flows and institutional emails are captured locally and can be inspected via the MailHog interface.

## Technologies Used

### Frontend Architecture
- **Framework**: Next.js 15 (App Router)
- **Library**: React
- **State Management**: React Query (Server State) and Zustand (Client State)
- **Styling**: Tailwind CSS and CSS Variables (Dual Theme Support)
- **Animations**: Framer Motion
- **Map Rendering**: React Leaflet, Konva.js

### Backend Architecture
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.2
- **Security**: Spring Security with Stateless JWT (JSON Web Tokens)
- **Persistence**: Spring Data JPA
- **Database**: PostgreSQL
- **Migrations**: Flyway

### Infrastructure and Deployment
- **Containerization**: Docker and Docker Compose
- **Local Mail Testing**: MailHog

## Developers

- **Victor Kossmann** - Full Stack Developer

## License

This project is licensed under the MIT License. See the LICENSE file for details.
