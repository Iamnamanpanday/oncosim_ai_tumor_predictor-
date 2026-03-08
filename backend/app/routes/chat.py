from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import os, json, urllib.request, urllib.error

router = APIRouter()

# ── Request / Response models ─────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str          # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    context: Optional[dict] = None   # simulation result context (metrics, params)


# ── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are OncoSim AI — an expert assistant embedded in a tumor growth simulation platform.

You specialise in:
- Explaining tumor growth dynamics (logistic growth model: dN/dt = rN(1-N/K) - cN)
- Interpreting simulation results (peak size, final size, reduction %)
- Answering questions about chemotherapy parameters (growth rate r, chemo strength c, carrying capacity K)
- Oncology concepts in clear, accessible language

Rules:
- Be concise (2-4 sentences max unless a detailed explanation is asked for)
- When simulation context is provided in [CONTEXT], reference the actual numbers
- Use plain language first, then technical terms in parentheses if needed
- For questions outside oncology/simulation, politely redirect
- Never give medical advice or diagnose real patients
"""


def build_gemini_payload(message: str, history: list[ChatMessage], context: Optional[dict]) -> dict:
    """Build Gemini 1.5 Flash API request payload."""
    contents = []

    # Add history
    for msg in history[-10:]:   # last 10 messages only
        contents.append({
            "role": "user" if msg.role == "user" else "model",
            "parts": [{"text": msg.content}]
        })

    # Add context if present
    ctx_prefix = ""
    if context:
        ctx_prefix = f"[CONTEXT: simulation results — peak={context.get('peak_size','?'):.0f} cells, final={context.get('final_size','?'):.0f} cells, reduction={context.get('reduction_percent','?'):.1f}%]\n\n"

    contents.append({
        "role": "user",
        "parts": [{"text": ctx_prefix + message}]
    })

    return {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 400,
        }
    }


def call_gemini(message: str, history: list[ChatMessage], context: Optional[dict]) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None   # fall through to rule-based

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = build_gemini_payload(message, history, context)
    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return None


# ── Rule-based fallback ───────────────────────────────────────────────────────
FALLBACK_RULES = [
    (["hi", "hello", "hey"], "Hi! I'm OncoSim AI 👋 Ask me anything about the simulation, tumor growth parameters, or what your results mean."),
    (["what is r", "growth rate"], "The growth rate **r** controls how fast tumor cells divide. Higher r = faster exponential growth before carrying capacity kicks in. Typical range: 0.1–0.4 per day."),
    (["what is c", "chemo", "chemotherapy", "chemo strength"], "Chemo strength **c** is the cell-kill rate per day. When c > r, the treatment kills cells faster than they divide — the tumor shrinks. Try setting c slightly above r to eradicate the tumor."),
    (["carrying capacity", "what is k"], "Carrying capacity **K** (fixed at 10,000 cells) is the maximum size the tumor can reach given space and nutrients. Growth slows automatically as the tumor approaches K."),
    (["reduction", "result", "what does this mean", "interpret"], "A reduction ≥ 90% means the tumor was effectively eradicated. 50-90% = controlled growth. Below 50% = the tumor is still progressing — try increasing chemo strength."),
    (["logistic", "equation", "formula", "model"], "The model uses: **dN/dt = rN(1 – N/K) – cN**. The first term drives growth (slowing near K), and the second term represents drug-induced cell death."),
    (["peak", "maximum"], "The peak tumor size is the highest cell count reached during the simulation. A lower peak usually means the drug is effective but the tumor initially grows before being suppressed."),
    (["eradicated", "controlled", "partial", "progressing"], "Outcomes are: 🟢 Eradicated (≥90% reduction) • 🔵 Controlled (≥50%) • 🟡 Partial (<50%) • 🔴 Progressing (tumor grew). Adjust c vs r to change the outcome."),
]

def rule_based_reply(message: str, context: Optional[dict]) -> str:
    msg_lower = message.lower()
    for keywords, reply in FALLBACK_RULES:
        if any(k in msg_lower for k in keywords):
            # Inject context numbers if available
            if context and "result" in msg_lower:
                r = context.get("reduction_percent", 0)
                reply += f" Your simulation showed a **{r:.1f}%** reduction."
            return reply
    return "I specialise in OncoSim's tumor growth model and simulation results. Try asking about growth rate (r), chemo strength (c), carrying capacity (K), or what your results mean!"


# ── Route ─────────────────────────────────────────────────────────────────────
@router.post("/chat")
async def chat(body: ChatRequest):
    reply = call_gemini(body.message, body.history, body.context)
    if not reply:
        reply = rule_based_reply(body.message, body.context)
    return {"reply": reply}
