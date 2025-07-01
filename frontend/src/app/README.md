# RP Unified Communications Frontend

This is the frontend for the RP Unified Communications platform, a modern, real-time application designed to streamline communication between property management and residents.

## Key Features

- **Real-Time Notifications**: Utilizes SignalR for instant delivery of broadcasts and other notifications.
- **Role-Based UI**: The interface dynamically adapts based on user roles (Resident vs. Leasing Consultant), showing relevant information and actions for each.
- **Interactive Dashboard**: A central hub providing an at-a-glance summary of unread messages, broadcasts, alerts, and more, with a modern, circular card design.
- **Dynamic & Personalized UI**:
  - **Unique User Colors**: Each user is assigned a unique, consistent color based on their initials, which is used in profile pictures and message lists.
  - **Consistent Icons**: A clear and consistent icon system (Feather Icons) is used throughout the application, with dynamic colors in the footer that match the dashboard summaries.
- **Core Communication Suite**: Includes modules for Inbox, Reminders, Follow-ups, and a full-featured notification center.

## Tech Stack

- **Framework**: Angular
- **Real-Time Communication**: SignalR
- **Styling**: CSS with Feather Icons
- **State Management**: RxJS for reactive data streams

## Getting Started

Follow these instructions to get the frontend up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [Angular CLI](https://angular.io/cli)

### Installation

1.  **Clone the repository** (if you haven't already).
2.  **Navigate to the `frontend` directory**:
    ```sh
    cd path/to/RP_Unified_Communications/frontend
    ```
3.  **Install NPM packages**:
    ```sh
    npm install
    ```

### Running the Application

1.  **Ensure the Backend is Running**: This frontend requires the corresponding backend service to be running. By default, it will look for the backend at `http://localhost:5237`.

2.  **Run the Angular development server**:
    ```sh
    ng serve
    ```

3.  **Open in your browser**: Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
