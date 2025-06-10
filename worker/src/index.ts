// copilot-file.oria-masas-ai.workers.dev
//--------------------------------------------------------------
// Cloudflare Worker – judge a user summary against a reference
// transcript, now with real DOCX-to-text extraction.
//--------------------------------------------------------------

import { unzipSync, strFromU8 } from "fflate";   // ⬅️ NEW

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      const formData      = await request.formData();
      const systemPrompt  = formData.get("systemPrompt");
      const userFile      = formData.get("userFile");      // learner’s summary
      const referenceFile = formData.get("referenceFile"); // task2reference.txt

      if (!systemPrompt || !userFile || !referenceFile) {
        return jsonError(
          "Missing required fields: systemPrompt, userFile or referenceFile",
          400
        );
      }

      /* -------- turn uploads into plain text ---------- */
      const [userText, referenceText] = await Promise.all([
        fileToText(userFile),
        fileToText(referenceFile),
      ]);

      if (userText.trim().length < 10) {
        return jsonOk(
          '<p class="mb-4"><strong>שגיאה:</strong> הקובץ שהעלית ריק או קצר מדי.</p>'
        );
      }
      if (referenceText.trim().length < 10) {
        return jsonOk(
          '<p class="mb-4"><strong>שגיאה:</strong> קובץ התמלול ריק או קצר מדי.</p>'
        );
      }

      /* -------------- Gemini -------------------------- */
      const gemini = await generateGeminiResponse(
        systemPrompt.toString(),
        userText,
        referenceText
      );

      const markdown =
        gemini?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "*השירות לא החזיר תשובה*";
      const html = markdownToHTML(markdown);

      return jsonOk(html);
    } catch (err) {
      return jsonError(`Error processing request: ${err.message}`, 500, err.stack);
    }
  },
};

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

function jsonOk(responseHtml) {
  return new Response(JSON.stringify({ response: responseHtml }), {
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function jsonError(message, status = 500, details = "") {
  return new Response(JSON.stringify({ error: message, details }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

/**
 * Extract as much *real* text as we can from common file types.
 */
async function fileToText(file) {
  /* ---------- quick wins: already-text ---------- */
  const name = (file.name || "").toLowerCase();
  const mime = file.type;

  if (
    mime.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv") ||
    name.endsWith(".json") ||
    name.endsWith(".log")
  ) {
    return await file.text();
  }

  /* ---------- HTML ---------- */
  if (name.endsWith(".html") || mime === "text/html") {
    const raw = await file.text();
    // naïve strip of tags / entities – good enough for transcripts
    return raw
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------- DOCX (Word) ---------- */
  if (
    name.endsWith(".docx") ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const ab   = await file.arrayBuffer();
      const zip  = unzipSync(new Uint8Array(ab));
      const doc  = zip["word/document.xml"];
      if (!doc) throw new Error("missing document.xml");

      const xml  = strFromU8(doc);
      const body = [...xml.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)].map((m) =>
        m[1]
      );
      const text = body.join(" ").replace(/\s+/g, " ").trim();
      if (text.length) return text;
    } catch (err) {
      /* fall through to default */
    }
  }

  /* ---------- anything else ---------- */
  return `[המשתמש העלה קובץ בשם: ${file.name}] \n[לא ניתן לקרוא את תוכן הקובץ – אנא בקש קובץ טקסט]`;
}

/**
 * Very small Markdown → HTML utility tailored to your formatting rules.
 */
function markdownToHTML(md) {
  return (
    "<p class=\"mb-4\">" +
    md
      .replace(/^(הפידבק שלך על הקובץ:|משוב:)\s*/i, "")
      .replace(/\n\*(?!\*)/g, "\n- ")
      .replace(/(?<!\*)\*(?!\*)/g, "")
      .replace(/\*{3,}/g, "**")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n\n+/g, '</p><p class="mb-4">')
      .replace(/\n/g, "<br>") +
    "</p>"
  )
    .replace(
      /<p class="mb-4">((?:-\s.*?(?:<br>)?)+)<\/p>/g,
      (_, items) =>
        `<ul class="list-disc list-inside mb-4 space-y-1">${items
          .split(/<br>/)
          .filter(Boolean)
          .map((li) => `<li class="mb-1">${li.replace(/^- /, "")}</li>`)
          .join("")}</ul>`
    )
    .replace(
      /<p class="mb-4">((?:\d+\.\s.*?(?:<br>)?)+)<\/p>/g,
      (_, items) =>
        `<ol class="list-decimal list-inside mb-4 space-y-1">${items
          .split(/<br>/)
          .filter(Boolean)
          .map((li) => `<li class="mb-1">${li.replace(/^\d+\.\s*/, "")}</li>`)
          .join("")}</ol>`
    )
    .replace(/<p class="mb-4">\s*<\/p>/g, "");
}

/**
 * Call Gemini 2.0-flash with separate messages for transcript and summary.
 */
async function generateGeminiResponse(systemPrompt, userText, referenceText) {
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDrei2P4mnar13CgMppLga3QTULd9IVqzc";

  const maxChars = 30000;            // conservative safety-cut
  const safeRef  = referenceText.slice(0, maxChars);
  const safeUser = userText.slice(0, maxChars);

  const payload = {
    systemInstruction: {
      role: "system",
      parts: [
        {
          text:
            systemPrompt +
            "\n\nפורמט התשובה: Markdown סטנדרטי בלבד:\n" +
            "- **טקסט מודגש**\n- רשימות עם מקף (-)\n- רשימות ממוספרות 1. 2. 3.\n" +
            "- שורה ריקה בין פסקאות\n- ללא כוכביות בודדות אחרות",
        },
      ],
    },
    contents: [
      { role: "user", parts: [{ text: `BEGIN_TRANSCRIPT\n${safeRef}\nEND_TRANSCRIPT` }] },
      { role: "user", parts: [{ text: `BEGIN_SUMMARY\n${safeUser}\nEND_SUMMARY` }] },
      { role: "user", parts: [{ text: "Please grade the summary according to the rubric above and explain any point deductions." }] },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API ${res.status}: ${body.slice(0, 300)}`);
  }
  return await res.json();
}
