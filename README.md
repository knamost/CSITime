<div align="center">
  <br />
  <h1>CSITime</h1>
  <p>A feature-rich, open-source platform for Tribhuvan University (TU) BSc CSIT students, providing a centralized hub for study resources, discussions, and academic progress tracking.</p>
  <br />
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#key-features">Key Features</a></li>
    <li><a href="#technical-architecture">Technical Architecture</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

---

## About The Project

CSITime is a modern, scalable web application built to address the specific needs of BSc CSIT students at Tribhuvan University. It serves as a one-stop solution for accessing academic resources, engaging in community discussions, and managing coursework. The platform is built with a focus on type-safety, performance, and developer experience, utilizing the latest features of the Next.js App Router and React 19.

---

## Key Features

- **Dual Authentication**: Login with either email or a unique username.
- **Role-Based Access Control**: Pre-defined roles (`STUDENT`, `MODERATOR`, `ADMIN`) with distinct permissions.
- **Official TU Syllabus**: The database is pre-seeded with the complete, up-to-date BSc CSIT curriculum for all 8 semesters.
- **Dynamic Electives**: Students in semesters V through VIII can select their specific elective subjects, which dynamically updates their available resources.
- **Resource Hub**: A centralized place to upload, download, and view study materials like notes, past papers, and solutions.
- **Inline Media Viewer**: Natively view PDFs, images, and videos in the browser without needing to download them first.
- **Community Forum**: Engage in discussions, ask questions, and share knowledge through a threaded forum with a voting system.
- **Admin Dashboard**: A protected area for moderators and administrators to manage users, content, and site settings.

---

## Technical Architecture

This project is built on a foundation of modern, robust, and scalable technologies.

### Core Framework & Libraries

- **Framework**: **Next.js 16.2.1** (using the App Router) provides the backbone, enabling Server-Side Rendering (SSR), Server Components, and API route handling.
- **UI Library**: **React 19** is used for building a fast and interactive user interface.
- **Styling**: A combination of **Tailwind CSS 4** for utility-first styling and **Shadcn UI** for a set of pre-built, accessible components.
- **Data Validation**: **Zod** is used for robust, type-safe validation of environment variables, API payloads, and form data.
- **Authentication**: **NextAuth.js v5** handles user authentication, supporting both email/username credentials.
- **Utilities**:
    - `bcryptjs`: For secure password hashing.
    - `date-fns`: For reliable date and time manipulation.
    - `lucide-react`: For a clean and consistent icon set.
    - `sonner`: For displaying non-intrusive toast notifications.

### Database Schema

The database is managed by **Prisma ORM** with a PostgreSQL backend. The schema is designed to be relational and scalable.

- **`User`**: Core model for users, storing profile information, roles (`STUDENT`, `MODERATOR`, `ADMIN`), and academic progress.
- **`Semester` & `Subject`**: Defines the academic structure based on the official TU syllabus.
- **`Resource`**: Manages uploaded files, linking them to specific subjects and users.
- **`Post`, `Comment`, `Vote`**: Powers the community discussion forum, enabling threaded conversations and user engagement.
- **`Account` & `Session`**: Managed by NextAuth.js to handle authentication state and provider information.

### API Routes

The backend logic is exposed via Next.js API Routes within the `src/app/api` directory.

-   `api/auth/[...nextauth]`: The catch-all route for handling all NextAuth.js authentication flows (login, logout, session management).
-   `api/auth/signup`: Handles new user registration, including password hashing and database entry.
-   `api/upload`: Manages file uploads, currently saving files to the local `public/uploads` directory.
-   `api/resources/[id]/download`: Securely serves files for download, tracking download counts.
-   `api/search`: Provides a site-wide search functionality for resources and posts.

---

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or newer)
- [pnpm](https://pnpm.io/installation) (or npm/yarn)
- [Docker](https://www.docker.com/products/docker-desktop/) (for a local PostgreSQL instance)

### Installation & Setup

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-username/csitime.git
    cd csitime
    ```

2.  **Install dependencies**
    ```sh
    pnpm install
    ```

3.  **Set up the environment**
    Create a `.env` file in the project root.
    ```env
    # Example for the local Docker setup:
    DATABASE_URL="postgresql://docker:docker@localhost:5432/csitime"
    ```

4.  **Start the database** (Optional)
    If you have Docker, you can use the provided configuration to spin up a PostgreSQL container.
    ```sh
    docker-compose up -d
    ```

5.  **Run database migrations and seed**
    This command sets up the schema and populates the database with the TU syllabus and a default admin user (`username: admin`, `password: password`).
    ```sh
    pnpx prisma migrate dev --name init
    pnpx prisma db seed
    ```

6.  **Run the development server**
    ```sh
    pnpm dev
    ```
The application will be available at `http://localhost:3000`.

---

## Roadmap

-   [ ] **Cloud Storage Migration**: Transition from local file uploads to a cloud provider like **AWS S3** or **Uploadthing**.
-   [ ] **Comprehensive E2E Testing**: Expand Playwright tests to cover file uploads and the inline media viewer.
-   [ ] **Real-time Notifications**: Implement a notification system for new comments, replies, and votes.
-   [ ] **Enhanced User Profiles**: Add more customization options and activity tracking to user profiles.

See the [open issues](https://github.com/your-username/csitime/issues) for a more detailed list of proposed features.

---

## Contributing

Contributions are welcome and greatly appreciated. Please fork the repository and create a pull request, or open an issue with the "enhancement" tag.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
