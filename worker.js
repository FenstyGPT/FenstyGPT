const MODEL = "nvidia/nemotron-3.5-super-vl:free";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (url.pathname !== "/chat" || request.method !== "POST") {
      return json({ error: "Nutze POST /chat." }, 404);
    }

    if (!env.OPENROUTER_API_KEY) {
      return json({ error: "OPENROUTER_API_KEY fehlt auf dem Server." }, 500);
    }

    try {
      const body = await request.json();
      const s = body.settings || {};

      const system = [
        `Du heißt ${String(s.name || "FenstyGPT").slice(0, 40)}.`,
        `Persönlichkeit: ${String(s.personality || "Frech und selbstbewusst").slice(0, 1000)}.`,
        `Humor: ${Math.max(0, Math.min(100, Number(s.humor) || 50))} von 100.`,
        `Freund-Modus: ${s.friend ? "aktiv" : "aus"}.`,
        `Regeln: ${String(s.rules || "Antworte ehrlich und natürlich.").slice(0, 1000)}.`,
        "Antworte in der Sprache des Nutzers. Sei hilfreich, respektvoll und altersgerecht."
      ].join("\n");

      const history = Array.isArray(body.history)
        ? body.history.slice(-20)
        : [];

      const messages = [
        { role: "system", content: system },
        ...history
          .filter(m =>
            (m.role === "user" || m.role === "model") &&
            Array.isArray(m.parts)
          )
          .map(m => ({
            role: m.role === "model" ? "assistant" : "user",
            content: m.parts
              .filter(p => typeof p.text === "string")
              .map(p => p.text.slice(0, 6000))
              .join("\n")
          }))
          .filter(m => m.content.length > 0)
      ];

      if (messages[messages.length - 1]?.role !== "user") {
        return json({ error: "Keine gültige Nachricht erhalten." }, 400);
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://fenstygpt.github.io/FenstyGPT/",
            "X-Title": "FenstyGPT"
          },
          body: JSON.stringify({
            model: MODEL,
            messages,
            temperature: 0.8,
            max_tokens: 700
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return json({
          error: result.error?.message || "OpenRouter hat einen Fehler gemeldet."
        }, response.status);
      }

      const reply = result.choices?.[0]?.message?.content;

      if (!reply) {
        return json({ error: "Die KI hat keine Antwort geliefert." }, 502);
      }

      return json({ reply });

    } catch (e) {
      return json({ error: e.message || "Serverfehler." }, 500);
    }
  }
};
