// API docimentation : https://myanimelist.net/apiconfig/references/api/v2
// API call without access token : https://myanimelist.net/forum/?topicid=1973077
// problem : https://myanimelist.net/forum/?topicid=1850649#msg60420647

import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;
const MAL_BASE_URL = process.env.MAL_BASE_URL || "https://api.myanimelist.net";
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Proxy MAL
app.all("*", async (req, res) => {
  try {
    // Méthodes autorisées
    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    // Chemin autorisé
    if (!req.path.startsWith("/v2/")) {
      return res.status(400).json({
        error: "Not allowed"
      });
    }

    // URL cible
    const targetUrl = new URL(req.originalUrl, MAL_BASE_URL);

    // Validation cible
    if (
      targetUrl.protocol !== "https:" ||
      targetUrl.hostname !== "api.myanimelist.net" ||
      !targetUrl.pathname.startsWith("/v2/")
    ) {
      return res.status(400).json({
        error: "Invalid target URL"
      });
    }

    // Headers sortants
    const headers = {
      "User-Agent": "mal-proxy/1.0"
    };

    // Client ID serveur
    if (MAL_CLIENT_ID) {
      headers["X-MAL-CLIENT-ID"] = MAL_CLIENT_ID;
    }

    // Token utilisateur
    const userAuthorization = req.get("Authorization");

    if (userAuthorization?.startsWith("Bearer ")) {
      headers["Authorization"] = userAuthorization;
    }

    // Requête MAL
    const response = await fetch(targetUrl, {
      method: "GET",
      headers
    });

    const contentType = response.headers.get("content-type") || "application/json";
    const body = await response.text();

    // Réponse client
    res.status(response.status);
    res.setHeader("Content-Type", contentType);
    res.send(body);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Proxy error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`MAL proxy listening on port ${PORT}`);
});