# Wentzel Storage (Pack Pal Tablet)

This is a warehouse management system designed for tablets and desktops. The system handles orders, inventory, and package templates to streamline the packing process.

## Features

*   **Inventory Management:** Add, edit, and delete items in the warehouse with location and quantity.
*   **Order Management:** Create orders manually or from templates. Track status (pending, active, completed).
*   **Templates:** Create reusable package templates for quick order creation.
*   **Warehouse View (Storage View):** Display for the warehouse showing active orders and items.
*   **Admin Panel:** Main interface for system administration.

## Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Shadcn UI.
*   **Backend:** Node.js (Express), SQLite (better-sqlite3).
*   **Mobile:** Capacitor (for building Android/iOS apps).

## Installation

1.  Clone the project.
2.  Install dependencies:

```bash
npm install
```

## How to Run

The system consists of a frontend and a backend that must run simultaneously.

### 1. Start Backend
The backend manages the database and the API.

```bash
node backend/server.js
```
*The API will run on `http://localhost:3001`*

### 2. Start Frontend
The frontend is the user interface. Open a new terminal:

```bash
npm run dev
```
*The app will typically be available at `http://localhost:8080` (or whichever port Vite chooses).*

## Build for Production

To build the frontend for production:

```bash
npm run build
```

## Database

The project uses a local SQLite database (`backend/storage.db`). This file is automatically created the first time the server starts if it doesn't exist.
