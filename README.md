# Wentzel Storage (Pack Pal Tablet)

Dette er et lagerstyringssystem designet til tablets og desktop. Systemet håndterer ordrer, lagerbeholdning og pakke-skabeloner for at effektivisere pakkeprocessen.

## Funktioner

*   **Lagerstyring:** Tilføj, rediger og slet varer i lageret med lokation og antal.
*   **Ordrehåndtering:** Opret ordrer manuelt eller ud fra skabeloner. Følg status (afventer, aktiv, afsluttet).
*   **Skabeloner:** Opret genanvendelige pakke-skabeloner for hurtig ordreoprettelse.
*   **Lagerskærm (Storage View):** Visning til lageret, der viser aktive ordrer og varer.
*   **Admin Panel:** Hovedinterface til administration af systemet.

## Teknisk Stack

*   **Frontend:** React (Vite), Tailwind CSS, Shadcn UI.
*   **Backend:** Node.js (Express), SQLite (better-sqlite3).
*   **Mobil:** Capacitor (til byg af Android/iOS apps).

## Installation

1.  Klon projektet.
2.  Installer afhængigheder:

```bash
npm install
```

## Sådan kører du projektet

Systemet består af en frontend og en backend, der skal køre samtidig.

### 1. Start Backend
Backend styrer databasen og API'et.

```bash
node backend/server.js
```
*API'et vil køre på `http://localhost:3001`*

### 2. Start Frontend
Frontend er brugergrænsefladen. Åbn en ny terminal:

```bash
npm run dev
```
*Appen vil typisk være tilgængelig på `http://localhost:8080` (eller den port Vite vælger).*

## Byg til Produktion

For at bygge frontend til produktion:

```bash
npm run build
```

## Database

Projektet bruger en lokal SQLite database (`backend/storage.db`). Denne fil oprettes automatisk første gang serveren startes, hvis den ikke findes.
