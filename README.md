<p align="center">
  <img src="https://raw.githubusercontent.com/yVictorK/uforum/main/uforum-frontend/public/logo.svg" width="90"/>
</p>

<h1 align="center">UForum</h1>

<p align="center">
  A social platform for the Federal University of Amazonas (UFAM) — forums, events, university map, and a student marketplace in one place.
</p>

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
- [Roadmap](#roadmap)
- [Developers](#developers)
- [License](#license)

## Project Description

UForum is a social platform built for the Federal University of Amazonas (UFAM), focused on connecting students through communities, events, an interactive campus map, and a student marketplace.

Users can join communities (forums), create and interact with posts, discover and participate in events, and buy or sell academic-related items through a simple marketplace integrated with WhatsApp.

The platform also includes user profiles with academic information, activity history, and social connections (followers/following), creating a complete digital environment for university life.

## Project Status

**MVP complete.** Core features — communities, posts with threaded replies, events, marketplace, and the interactive campus map — are fully functional. The admin and moderation panel was added after the initial release.

Currently planned: Redis caching, email queue management, and a mobile version.

## Features and Demonstration

### Home and Authentication

A seamless entry point featuring a dynamic hero section and institutional authentication flow.

![Home and Login Demo](https://github.com/user-attachments/assets/be37152a-8503-4081-bdba-33187bfbd79d)

### Social Networking Engine

- **Threaded discussions** up to 5 levels deep with optimistic UI updates
- **Vote system** with toggle behavior (upvote → neutral → downvote) persisted per user
- **Nested reply tree** rendered recursively on the frontend with lazy loading

![Feed and Communities Demo](https://github.com/user-attachments/assets/5b96da2e-8764-408e-b043-4d85dd0f600c)

### Events and Academic Marketplace

- **Peer-to-Peer Transactions**: A secure environment for students to list academic textbooks, lab equipment, and services.
- **Listing Management**: Real-time status updates (Available, Reserved, Sold).
- **Campus Events**: Integrated event discovery to keep the community informed.
- **WhatsApp Integration**: Contact sellers instantly with a pre-filled message containing the product name.

![Events and Marketplace Demo](https://github.com/user-attachments/assets/ac6e1b8d-813b-4757-b628-9a1a061ba7d9)

### Campus Map

- **Interactive map** with dark-themed custom tiles and building markers across the UFAM campus.
- **Indoor Cartography**: Administrative tools allow for the creation and dynamic editing of building floors and rooms using canvas-based rendering (Konva.js).
- **Event Localization**: Pins and interactive markers to locate campus events directly on the map.

![Map and Building Interactivity Demo](https://github.com/user-attachments/assets/38267a93-ff8f-4e27-a2fa-3cd7977b4631)

### Administrative and Moderation Suite

- **Five-tier role system**: Student, Professor, Event Manager, Moderator, and Admin, each with scoped permissions.
- **Role-Based Access Control (RBAC)**: Secure access management for Administrators and Moderators.
- **Moderation Queue**: A complete dashboard to view, ignore, or resolve user reports, including the ability to permanently ban users or delete content.

![Admin Panel Demo](https://github.com/user-attachments/assets/49bf970e-2209-433c-b073-63d96d114c22)

## Application Access and Execution

### Prerequisites

To run this project locally, ensure you have the following installed on your machine:

- Docker Engine
- Docker Compose
- Git

### Running the Application

1. Clone the repository:

```bash
git clone https://github.com/yVictorK/uforum.git
cd uforum
```

2. Start the application:

```bash
# Production-like (recommended for testing the full stack)
docker compose up --build

# Development mode with hot reload
./dev.sh
```

3. Access the interfaces:

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api/v1`
- **MailHog (SMTP Inspector)**: `http://localhost:8025`

### Authentication Notes

Registration requires a valid institutional email (`*.ufam.edu.br` including all its subdomains). During local development, password recovery and email flows are captured by MailHog and can be inspected at `http://localhost:8025`.

## Technologies Used

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Library**: React
- **State Management**: React Query (Server State) and Zustand (Client State)
- **Styling**: Tailwind CSS and CSS Variables (Dual Theme Support)
- **Animations**: Framer Motion
- **Map Rendering**: React Leaflet, Konva.js

### Backend

- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.2
- **Security**: Spring Security with Stateless JWT
- **Persistence**: Spring Data JPA
- **Database**: PostgreSQL
- **Migrations**: Flyway

### Infrastructure

- **Containerization**: Docker and Docker Compose
- **Local Mail Testing**: MailHog

## Roadmap

- [x] Social system
- [x] Marketplace
- [x] Events system
- [x] Campus map
- [x] Admin panel
- [x] Interactive notifications
- [x] Save and share posts
- [ ] Redis caching
- [ ] Email queue management
- [ ] Mobile version

## Developers

- **Victor Kossmann** - Full Stack Developer

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
