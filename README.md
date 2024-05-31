# PayPal Transaction Fetcher

This project is a simple web application that allows users to fetch their PayPal transaction IDs by providing their email address. The backend is built with Express.js, and the frontend is a basic HTML form with JavaScript for client-side functionality.

## Features

- Fetch PayPal transactions securely using OAuth2 token.
- Basic email validation on both client-side and server-side.
- Display transaction IDs on the frontend.

## Prerequisites

- Node.js installed on your machine.
- A PayPal Developer account with sandbox credentials (Client ID and Secret).

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/paypal-transaction-fetcher.git
    cd paypal-transaction-fetcher
    ```

2. Install the required dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your PayPal sandbox credentials:

    ```env
    PAYPAL_CLIENT_ID=your-client-id
    PAYPAL_CLIENT_SECRET=your-client-secret
    ```

## Running the Application

1. Start the Express server:

    ```sh
    npm start
    ```

2. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

- `server.js`: Main server file containing all the backend logic.
- `public/`: Directory containing static files served to the client.
  - `index.html`: Main HTML file for the frontend.
  - `style.css`: CSS file for styling the frontend.

## Endpoints

### POST /api/transactions

Fetches transaction IDs for a given user email.

#### Request Body

```json
{
  "email": "user@example.com"
}
