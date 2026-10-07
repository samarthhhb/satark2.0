import os
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("satark.assistant")

SYSTEM_PROMPT = """You are the SATARK 2.0 Cybercrime & Cybersecurity Analytics Assistant.

SCOPE & EXPERTISE:
1. SATARK 2.0: CatBoost forecasting, risk classification (Low/Medium/High), district crime profiles, and evaluation methodology.
2. Official Indian cybercrime statistics (NCRB district and state metrics, multi-year trends, 31 crime categories like OTP fraud, identity theft, banking fraud, cyber stalking, ransomware, personation).
3. General Cybersecurity Knowledge: Draw upon generalized cybersecurity principles, industry frameworks, defense-in-depth, endpoint security, authentication hygiene (MFA/2FA), incident response, network monitoring, social engineering countermeasures, and threat intelligence.
4. Indian cyber laws & policing: Information Technology Act, 2000 (Sections 43, 66, 66C, 66D, 66E, 66F, 67, 67A, 67B) and relevant IPC provisions.

GREETINGS:
- Respond politely and concisely to greetings (e.g., "hi", "hello", "who are you?", "help"). State your purpose as the SATARK Cybercrime & Cybersecurity Assistant.

TOPIC RESTRICTION:
- Strictly restricted to cybercrime, cybersecurity, SATARK forecasting, risk evaluation, and cyber laws.
- For completely unrelated topics (cooking, movies, sports, generic coding unrelated to cybersecurity), politely refuse:
"I am the SATARK Assistant, specialized in cybercrime analytics, cybersecurity defense, and Indian cyber law. Please ask a question related to cybercrime trends, risk assessment, or cybersecurity."

MANDATORY OUTPUT CONSTRAINTS:
1. LENGTH LIMIT: Your total response MUST be strictly under 300 words. Keep answers focused, precise, and practical.
2. NO TABLES: NEVER use markdown tables (| --- |) or HTML tables. Use clean bullet points, numbered lists, or concise paragraphs instead.
3. STRUCTURE: Use clear bold headings and bullet points for high readability.
"""

FALLBACK_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "allam-2-7b",
    "openai/gpt-oss-20b"
]

class AIAssistantService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = None
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Error initializing Groq client: {e}")

    def _enforce_word_limit(self, text: str, max_words: int = 300) -> str:
        words = text.split()
        if len(words) <= max_words:
            return text
        # Truncate to max_words and ensure clean sentence ending
        truncated = " ".join(words[:max_words])
        if not truncated.endswith(('.', '!', '?')):
            last_period = max(truncated.rfind('.'), truncated.rfind('!'), truncated.rfind('?'))
            if last_period > len(truncated) * 0.7:
                truncated = truncated[:last_period + 1]
            else:
                truncated += "..."
        return truncated

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if not self.client:
            return {
                "reply": "Groq API client is not configured. Please ensure GROQ_API_KEY is set.",
                "model_used": "none",
                "status": "error"
            }

        # Build prompt with context if present
        system_instruction = SYSTEM_PROMPT
        if context:
            context_str = f"\n\nCURRENT EVALUATION CONTEXT:\n- State: {context.get('state', 'N/A')}\n- District: {context.get('district', 'N/A')}\n- Reference Year: {context.get('input_year', 'N/A')}\n- Forecast Year: {context.get('forecast_year', 'N/A')}\n- Predicted Cybercrime Burden: {context.get('predicted_total', 'N/A')} cases\n- Predicted Risk Level: {context.get('risk_level', 'N/A')}"
            system_instruction += context_str

        chat_messages = [{"role": "system", "content": system_instruction}]

        # Append sanitized user/assistant history (limit to last 8 turns)
        for msg in messages[-8:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                chat_messages.append({"role": role, "content": content})

        # Try models in fallback order
        last_error = None
        for model_name in FALLBACK_MODELS:
            try:
                response = self.client.chat.completions.create(
                    model=model_name,
                    messages=chat_messages,
                    temperature=0.3,
                    max_tokens=450
                )
                reply = response.choices[0].message.content
                if reply and reply.strip():
                    cleaned_reply = self._enforce_word_limit(reply.strip(), max_words=300)
                    return {
                        "reply": cleaned_reply,
                        "model_used": model_name,
                        "status": "success"
                    }
            except Exception as e:
                logger.warning(f"Groq model {model_name} failed: {e}. Trying fallback...")
                last_error = str(e)
                continue

        return {
            "reply": f"Sorry, the AI Assistant is temporarily unavailable. Error: {last_error}",
            "model_used": "failed_all_fallbacks",
            "status": "error"
        }

assistant_service = AIAssistantService()

def get_assistant_service() -> AIAssistantService:
    return assistant_service
