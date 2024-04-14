const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const base = "https://api-m.sandbox.paypal.com";

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for development purposes (adjust as needed in production)
app.use(cors());

// Parse incoming JSON data from the client
app.use(bodyParser.json());

// Function to fetch access token (same as previous code)
async function getAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error(
      "Missing required environment variables: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET"
    );
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await response.json();
  return data.access_token;
}

// Function to fetch transactions based on user email (secure)
async function fetchUserTransactions(email) {
  try {
    // 1. Validate email format (basic check)
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error("Invalid email format.");
    }

    // 2. Retrieve access token
    const accessToken = await getAccessToken();

    // 3. Calculate start and end dates
    const startDate = new Date(Date.now() - 600 * 1000).toISOString();
    const endDate = new Date().toISOString();

    // 4. Construct secure API URL (avoid sending email in URL)
    const url = new URL(
      "https://api-m.sandbox.paypal.com/v1/reporting/transactions"
    );
    url.searchParams.append("transaction_status", "COMPLETED");
    url.searchParams.append("start_date", startDate);
    url.searchParams.append("end_date", endDate);

    // 5. Make API request with user-specific filters (sent in request body)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json(); // Assuming the response contains JSON
      const errorMessage = `API request failed with status ${
        response.status
      }: ${data.message || "Unknown error"}`;
      throw new Error(errorMessage);
    }

    // 6. Extract transaction IDs
    const data = await response.json();
    const transactions = data.transaction_details.filter(
      (transaction) => transaction.payer_info.email_address === email
    );
    const transactionIds = transactions.map(
      (transaction) => transaction.transaction_info.transaction_id
    );

    return transactionIds;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { error: error.message }; // Return error message for client-side handling
  }
}

// API endpoint to handle user email and return transaction IDs (or error)
app.post("/api/transactions", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const transactionIds = await fetchUserTransactions(email);
    res.json({ transactionIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

app.listen(port, () => console.log(`Server listening on port ${port}`));
