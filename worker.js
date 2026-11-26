// Cloudflare Worker für FenstyGPT
// In Cloudflare unter Settings > Variables and Secrets ein Secret namens GEMINI_API_KEY anlegen.
const MODEL = "gemini-3.5-flash-lite";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function json(data, status=200) {
  return new Response(JSON.stringify(data), {status, headers:{...cors,"Content-Type":"application/json; charset=utf-8"}});
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null,{headers:cors});
    if (url.pathname !== "/chat" || request.method !== "POST") return json({error:"Nutze POST /chat."},404);
    if (!env.GEMINI_API_KEY) return json({error:"Auf dem Server fehlt das Secret GEMINI_API_KEY."},500);
    try {
      const body = await request.json();
      const s = body.settings || {};
      const history = Array.isArray(body.history) ? body.history.slice(-20) : [];
      const system = [
        `Du heißt ${String(s.name || "FenstyGPT").slice(0,40)}.`,
        `Persönlichkeit: ${String(s.personality || "Freundlich und natürlich").slice(0,1000)}.`,
        `Humor-Level: ${Math.max(0,Math.min(100,Number(s.humor)||0))} von 100.`,
        `Freund-Modus: ${s.friend ? "aktiv" : "aus"}.`,
        `Weitere Regeln: ${String(s.rules || "").slice(0,1000)}.`,
        "Antworte in der Sprache des Nutzers. Sei hilfreich, respektvoll und altersgerecht. Erzeuge keine sexuellen Inhalte mit Minderjährigen."
      ].join("\n");
      const contents = history
        .filter(m => (m.role === "user" || m.role === "model") && Array.isArray(m.parts))
        .map(m => ({role:m.role,parts:m.parts.filter(p=>typeof p.text==="string").map(p=>({text:p.text.slice(0,6000)}))}))
        .filter(m=>m.parts.length);
      if (!contents.length || contents[contents.length-1].role !== "user") return json({error:"Keine gültige Nachricht erhalten."},400);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
        method:"POST",
        headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
        body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{temperature:0.8,maxOutputTokens:700}})
      });
      const result = await response.json();
      if (!response.ok) return json({error:result.error?.message || "Die Gemini-API hat einen Fehler gemeldet."},response.status);
      const reply = result.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();
      if (!reply) return json({error:"Die KI hat keine Textantwort zurückgegeben."},502);
      return json({reply});
    } catch (e) {
      return json({error:e.message || "Unbekannter Serverfehler."},500);
    }
  }
};