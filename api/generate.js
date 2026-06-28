// api/generate.js
// Ce fichier est une "fonction serverless" exécutée par Vercel.
// Elle tourne côté serveur, donc ta clé API n'est JAMAIS visible dans le navigateur.

export default async function handler(req, res) {
  // 1. Autoriser uniquement les requêtes POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // 2. Récupérer les données envoyées par ta page HTML
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Format de requête invalide" });
  }

  try {
    // 3. Appeler l'API Anthropic avec la clé stockée en variable d'environnement
    //    process.env.ANTHROPIC_API_KEY est définie dans le dashboard Vercel,
    //    elle ne sera JAMAIS envoyée au navigateur.
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: system || "",
        messages,
      }),
    });

    // 4. Si l'API Anthropic retourne une erreur, la transmettre proprement
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur Anthropic API:", errorData);
      return res.status(response.status).json({
        error: "Erreur lors de l'appel à l'API",
        details: errorData,
      });
    }

    // 5. Transmettre la réponse au navigateur
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erreur serveur:", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}
