# ⚡ DarkService — Distributed Load & Resilience Testing Platform (Work In Progress)
An authorized load-testing platform for evaluating the performance and resilience of user-controlled infrastructure.
*   **Target Verification:** Verifies ownership through a unique .txt token before running tests.
*   **Resource Management:** Manages networks, worker servers, methods, duration, and concurrent slots.
*   **Access Control:** Supports JWT authentication, RBAC, permissions, plans, and feature limits.
*   **Microservice Architecture:** Separates test execution into an independent service.
*   **Message Queue Coordination:** Uses Kafka to queue jobs and prevent worker slot conflicts.
*   **Backend Architecture:** Built with modular NestJS, repositories, migrations, filters, and interceptors.
*   **Dashboard:** Uses React to manage users, roles, plans, networks, servers, and test jobs.
*   **Tech:** NestJS, TypeScript, React, PostgreSQL, Drizzle ORM, Redis, Kafka, JWT, Swagger, Docker.
