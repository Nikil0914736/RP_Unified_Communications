# RP Unified Communications

**Unified Communications** is an enterprise-grade, full-featured communication hub built with a .NET backend and an Angular frontend. This application streamlines all communication channels into a single, intuitive platform, designed for seamless collaboration and productivity. Featuring a clean, modern, and fully responsive interface, it provides a consistent user experience across all devices.

## Recent Features & Enhancements

-   **Real-time Reminders**: A complete, end-to-end reminders system has been implemented, allowing for the creation and real-time delivery of reminders to residents.
    -   **Read/Unread Functionality**: Reminders can be marked as read, which instantly updates their visual state and the unread counts throughout the application.
    -   **Interactive Pop-up**: Clicking on a reminder opens a pop-up with the full message details.
    -   **Unread Count Badges**: The footer, dashboard, and notifications page all display badges with the number of unread reminders.

-   **Broadcasts Module**: A complete, end-to-end broadcast system has been implemented, allowing Leasing Consultants to send messages that are received in real-time by all Residents.
-   **Unread Count Badges**: The footer navigation and the notification filter tabs now display red badges to indicate the number of unread items, ensuring users never miss an update.
-   **Interactive Offer Popover**: Offers now open in a detailed popover that includes a full, bulleted list of renewal details and a set of action buttons ("Accept," "Decline," etc.). This popover also features a sophisticated billing schedule display, with a tabbed interface for different billing periods (e.g., 12 vs. 24 months), providing users with a clear and comprehensive overview of their payment schedule.
-   **UI & UX Refinements**:
    -   **Themed Scrollbar**: A custom, dark-themed scrollbar has been added for a more polished and immersive dark mode experience.
    -   **Header Role Display**: The user's role (e.g., "Resident") is now displayed in the header for better context.
    -   **Color-Coded Tabs**: The filter tabs on the notifications page are now color-coded to match the summary cards on the dashboard, creating a more cohesive design.
-   **State Management & Bug Fixes**:
    -   Resolved a critical bug where notification data was not being cleared on logout.
    -   Fixed an issue where marking a message as read did not persist correctly.

-   **Inbox Popover Enhancements**:
    -   **Scheduled Billing Details**: The inbox message popover now includes a "Schedule Billing Details" section, which displays monthly billing information in a clean, scrollable table.
    -   **Tabbed Billing View**: For offers that include both 12 and 24-month renewal options, the billing details are organized into tabs for easy comparison.

## Features

### Core Application
-   **Enterprise-Grade Design System**: A consistent and professional design is applied across all components, ensuring a cohesive and intuitive user experience.
-   **Full Dark Mode Support**: A sleek, dark theme is available throughout the entire application.
-   **Personalized Header**: The header dynamically displays the user's initials after a successful login.
-   **Lightweight Icons**: Utilizes the clean and modern Feather icon set.

### Authentication
-   **Backend User Persistence**: A .NET Web API backend handles all user data, which is persisted in a `users.json` file.
-   **Secure User Login & Registration**: A robust login page validates user credentials (email, password, and role) against the backend. The login and registration pages feature a modern dropdown menu to select the user type (**Resident** or **Leasing Consultant**), with "Resident" as the default.
-   **Password Change**: A secure page for users to change their password, with validation for password length and a check to prevent using the same password.
-   **Route Protection**: Angular Guards (`AuthGuard`, `ResidentGuard`, and `LeasingConsultantGuard`) protect all sensitive routes, automatically redirecting unauthorized users to the login page.

### Real-time & Notifications
-   **Real-time Broadcasts with SignalR**: The application uses SignalR to push live broadcast messages to all connected clients, ensuring instant communication.
-   **Unified Notification Center**: Broadcast messages are seamlessly integrated into the main "Notifications" page, creating a single, unified feed for all alerts and communications.
-   **Role-Based Views**: The notification system is role-aware. **Residents** see all notifications, including broadcasts, while **Leasing Consultants** have access to broadcast creation tools.
-   **Live Dashboard Count**: The dashboard summary features a notification count that updates in real-time as new messages arrive, tailored to the logged-in user's role.
-   **Interactive Message Popover**: A polished, reusable popover component allows users to view the full content of broadcast and inbox messages. It features a modern design, smooth animations, and is closable via the Escape key or an overlay click. For inbox messages related to renewal offers, it now includes a "Schedule Billing Details" section, which can display information in a single table or a tabbed view for 12 and 24-month options.

### Main Modules
-   **Dashboard**: A central hub that provides a high-level summary of all recent activity, including a live, role-aware notification count.
-   **Inbox**: A simple and clean interface to view and manage incoming messages.
-   **Notifications**: A dedicated page that provides a unified, filterable feed of all alerts, reminders, and broadcast messages.
-   **Reminders**: A module to create and schedule new reminders.
-   **Follow-ups**: A section to track and manage follow-up tasks.
-   **Broadcast**: A tool for **Leasing Consultants** to compose and send broadcast messages.
-   **Settings**: A page to manage application preferences.

## Project Structure

The project is organized into the following main directories:
-   `.github/`: Contains GitHub-specific files, such as workflow definitions for continuous integration and deployment.
-   `backend/`: Contains the .NET Web API solution responsible for all business logic and data persistence.
-   `frontend/`: Contains the Angular application responsible for the user interface and user experience.

## Technology Stack

-   **.NET Web API**: A robust framework for building backend web APIs.
-   **SignalR**: For real-time, bi-directional communication between the server and clients.
-   **Angular**: A powerful framework for building dynamic single-page applications.
-   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
-   **HTML5 & CSS3**: For structuring and styling the application.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   **Node.js and npm**: [Download & Install Node.js](https://nodejs.org/)
-   **Angular CLI**: `npm install -g @angular/cli`
-   **.NET 6 SDK** (or newer): [Download & Install .NET](https://dotnet.microsoft.com/download)
-   **Git**: [Download & Install Git](https://git-scm.com/downloads)

### Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd RP_Unified_Communications
    ```

2.  **Set up the Frontend**:
    ```bash
    cd frontend
    npm install
    ```

3.  **The Backend** does not require a separate installation step.

### Running the Application

You will need to run the backend and frontend servers in two separate terminals.

1.  **Start the Backend Server**:
    ```bash
    # In the /backend directory
    cd ../backend
    dotnet run
    ```
    The backend will be running on `http://localhost:5237`.

2.  **Start the Frontend Server**:
    ```bash
    # In the /frontend directory
    cd ../frontend
    ng serve
    ```
    Navigate to `http://localhost:4200/`. The application will be live, and it will automatically reload if you make any changes to the source files.

### Default Users

You can use the following default credentials to log in and test the application:

-   **Role**: Resident
    -   **Username**: `resident@realpage.com`
    -   **Password**: `password`
-   **Role**: Leasing Consultant
    -   **Username**: `leasingconsultant@realpage.com`
    -   **Password**: `password`

### Git Configuration Note

This repository includes a `.gitattributes` file to enforce consistent line endings across different operating systems. If you encounter any warnings related to line endings (LF vs. CRLF), they should be resolved automatically by this configuration.

