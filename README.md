# UForum - Social Networking and Campus Integration Platform

UForum is a comprehensive digital ecosystem developed for the Federal University of Amazonas (UFAM). The platform integrates social interaction, geospatial campus auditing, and academic management into a unified, high-performance web application.

---

## Project Overview

The UForum platform serves as a centralized hub for students, faculty, and administrative staff. It addresses the need for secure, institutional communication and provides tools for campus navigation and resource management.

### Primary Objectives
- **Institutional Communication**: Facilitate structured discussions within academic communities.
- **Geospatial Awareness**: Provide an interactive interface for campus navigation and event localization.
- **Resource Management**: Enable a secure marketplace for academic materials.
- **Administrative Oversight**: Implement a hierarchical moderation system for platform integrity.

---

## Core Functionality

### 1. Social Networking Engine
- **Community Architecture**: Course-specific and interest-based communities (e.g., IComp, FT, Medicine).
- **Threaded Discussions**: Nested comment structures supporting high-density information exchange.
- **Interactivity**: Asynchronous voting systems, post-saving mechanisms, and media integration.

### 2. Interactive Campus Mapping
- **Mapbox Integration**: Custom-rendered campus tiles with Department-level precision.
- **Event Localization**: Real-time correlation between campus events and geographic coordinates.
- **Block Identification**: Detailed metadata for campus buildings and administrative sectors.

### 3. Administrative and Moderation Suite
- **Role-Based Access Control (RBAC)**: Defined permissions for Administrators, Moderators, and Event Managers.
- **Metrics Dashboard**: Real-time analytics for user engagement, content volume, and system activity.
- **Content Governance**: Dedicated tools for user promotion, banning, and content moderation.

### 4. Academic Marketplace
- **Peer-to-Peer Transactions**: A secure listings platform for academic textbooks, lab equipment, and student services.
- **Status Tracking**: Management of listing visibility (Available, Reserved, Sold).

---

## Technical Architecture

### Frontend Layer
- **Framework**: Next.js 15 (App Router Architecture)
- **State Management**: React Query (Server State) and Zustand (Client State)
- **UI System**: Custom-built Dark Mode interface utilizing Framer Motion for state transitions.
- **Type Safety**: TypeScript-first implementation.

### Backend Layer
- **Framework**: Spring Boot 3.2 (Java 21 LTS)
- **Security**: Spring Security with stateless JWT (JSON Web Token) implementation.
- **Persistence**: Spring Data JPA with PostgreSQL.
- **Migrations**: Serialized database versioning via Flyway.

### Infrastructure
- **Containerization**: Orchestrated via Docker Compose.
- **SMTP Handling**: Integrated MailHog for local development and testing of automated recovery flows.

---

## Security Protocols

### Identity Verification
- **Domain Restriction**: Registration is restricted to authorized `*.ufam.edu.br` and `*.alumni.ufam.edu.br` domains.
- **Password Complexity**: Enforced character requirements, including mandatory special characters (`!@#$%*`).

### Recovery Mechanisms
- **Password Reset Flow**: Time-sensitive (30-minute expiry) secure tokens delivered via institutional email.
- **Token Management**: Automated cleanup of expired recovery tokens to prevent database bloat.

---

## Deployment and Configuration

### Environment Setup
The platform is designed to be deployed as a multi-container application.

1. **Prerequisites**: Docker Engine and Docker Compose installed.
2. **Execution**: Run the following command from the project root:
   ```bash
   docker compose up --build
   ```

### Local Development Access
- **Application Interface**: `http://localhost:3000`
- **RESTful API Endpoint**: `http://localhost:8080/api/v1`
- **SMTP Web Inspector**: `http://localhost:8025`

### Configuration of External Services
For production email delivery, environment variables in `docker-compose.yml` must be configured with valid SMTP credentials (e.g., Gmail App Passwords).

---

## Development and Contributions

The project follows a standard modular architecture. Source code is organized into `uforum-backend` and `uforum-frontend` directories.

### Documentation Placeholders
[Insert Video Demonstration of Social Engine Here]
[Insert Video Demonstration of Interactive Map Here]
[Insert Video Demonstration of Admin Dashboard Here]

---

## License
This project is licensed under the MIT License.
