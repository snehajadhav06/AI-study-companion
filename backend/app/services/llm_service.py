import json
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

class LLMService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
        self.model = settings.MODEL_NAME

    def _clean_json_string(self, raw_str: str) -> str:
        cleaned = raw_str.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()
        return cleaned

    async def _post_request(self, messages: List[Dict[str, str]], response_format: Optional[str] = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/snehajadhav06/AI-study-companion",
            "X-Title": "AI Study Companion"
        }
        
        payload = {
            "model": self.model,
            "messages": messages
        }
        
        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}
            
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                return f"Error connecting to LLM service: {str(e)}"

    async def generate_rag_answer(self, question: str, context: str, history: List[Dict[str, str]]) -> str:
        system_prompt = (
            "You are a helpful and strict study assistant. Answer the user's question based ONLY on the provided context. "
            "If the answer is not in the context, state that you cannot find it in the uploaded documents. "
            "Do not make up facts or use external knowledge. Context:\n"
            f"{context}"
        )
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": question})
        
        return await self._post_request(messages)

    async def generate_summary(self, text_content: str, detail_level: str) -> Dict[str, Any]:
        system_prompt = (
            "You are an expert study-notes generator. Read the document content below and return ONLY a valid JSON object — no markdown code fences, no explanation text before or after.\n\n"
            "Follow this EXACT schema:\n"
            "{\n"
            "  \"title\": \"string - concise document title\",\n"
            "  \"key_takeaways\": [\n"
            "    \"string - one clear takeaway per item, max 25 words each\",\n"
            "    \"... 8-12 items total\"\n"
            "  ],\n"
            "  \"important_formulas\": [\n"
            "    \"string - one formula or key fact per item\",\n"
            "    \"... only if applicable, otherwise empty array\"\n"
            "  ],\n"
            "  \"revision_notes\": \"string - plain text or simple markdown using ONLY headings (##) and bullet points (-). DO NOT use markdown tables, DO NOT use code blocks, DO NOT nest complex formatting. Keep each section under 100 words.\"\n"
            "}\n\n"
            "STRICT RULES:\n"
            "1. Output valid JSON only. No text outside the JSON object.\n"
            "2. Never use pipe characters (|) or table syntax anywhere in any field.\n"
            "3. Never repeat the same character or token more than 3 times in a row.\n"
            "4. If a section would require a table, convert it to a bulleted list instead (e.g. \"GET - Retrieve data (safe, idempotent)\" instead of a table row).\n"
            "5. Keep the entire response under 1500 words total.\n"
            "6. Close every JSON string and bracket properly before ending output."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Document content:\n{text_content[:6000]}"}
        ]
        
        raw_response = await self._post_request(messages, response_format="json")
        cleaned_response = self._clean_json_string(raw_response)
        try:
            return json.loads(cleaned_response)
        except Exception:
            return {
                "title": "Document Summary",
                "key_takeaways": ["Failed to generate structured takeaways."],
                "important_formulas": [],
                "revision_notes": cleaned_response
            }

    async def generate_flashcards(self, text_content: str, num_cards: int) -> List[Dict[str, str]]:
        system_prompt = (
            "Generate academic flashcards. "
            "Return the output as a JSON object with a single key 'flashcards' containing a list of objects. "
            "Each object must have 'front' (question/term), 'back' (definition/answer), 'difficulty' ('easy', 'medium', 'hard'), "
            "and 'topic' (concept name)."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate exactly {num_cards} flashcards from this text:\n{text_content[:6000]}"}
        ]
        
        raw_response = await self._post_request(messages, response_format="json")
        cleaned_response = self._clean_json_string(raw_response)
        try:
            data = json.loads(cleaned_response)
            return data.get("flashcards", [])
        except Exception:
            return [
                {
                    "front": "General Question",
                    "back": "General Answer",
                    "difficulty": "medium",
                    "topic": "General"
                }
            ]

    async def generate_quiz(self, text_content: str, num_questions: int, difficulty: str) -> List[Dict[str, Any]]:
        system_prompt = (
            "Create concise educational quiz questions from the provided context. "
            "Return ONLY valid JSON with one key: 'questions'. "
            "Each question object must include: id, type, question, options (for mcq), correct_answer, explanation. "
            "Keep questions clear, factual, and short."
        )

        prompt_text = (
            f"Generate exactly {num_questions} {difficulty}-level questions. "
            f"Use only this context:\n{text_content[:4000]}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text},
        ]

        raw_response = await self._post_request(messages, response_format="json")
        cleaned_response = self._clean_json_string(raw_response)
        try:
            data = json.loads(cleaned_response)
            return data.get("questions", [])
        except Exception:
            return []

    async def generate_study_plan(self, subjects: List[str], hours_per_day: float, target_date: str) -> Dict[str, Any]:
        import datetime
        try:
            target_date_parsed = datetime.datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            target_date_parsed = datetime.datetime.utcnow().date() + datetime.timedelta(days=30)
            
        today = datetime.datetime.utcnow().date()
        days_remaining = max(1, (target_date_parsed - today).days)
        weeks_remaining = max(1, round(days_remaining / 7))
        weekly_hours = round(hours_per_day * 7, 1)
        
        system_prompt = (
            "You are an expert study planner. Generate a study plan using ONLY the exact parameters below. Do not assume or invent a different timeline.\n\n"
            f"FIXED PARAMETERS (do not recalculate or override these):\n"
            f"- Subjects: {', '.join(subjects)}\n"
            f"- Study hours per day: {hours_per_day}\n"
            f"- Days remaining until exam: {days_remaining}\n"
            f"- Total weeks to plan: {weeks_remaining}\n"
            f"- Exam/target date: {target_date}\n\n"
            "RULES:\n"
            f"1. The plan MUST span EXACTLY {weeks_remaining} weeks — no more, no fewer.\n"
            f"2. Total weekly study load = study hours per day × 7 = {weekly_hours} hours. Distribute topics to fit realistically within this budget.\n"
            "3. Divide the listed subjects evenly across the available weeks based on typical topic complexity — don't give all weeks to one subject unless only one subject was provided.\n"
            f"4. If days_remaining is less than 14, compress the plan into a fast-review structure (broad coverage + practice) rather than a slow foundational build-up — do not assume months of runway.\n"
            "5. If days_remaining is very short (under 7 days), organize by DAY instead of by week, and clearly label it as an intensive revision plan.\n"
            "6. Each week/day entry must include: \"topics_to_master\" (list) and \"suggested_milestones\" (list). Keep both concise and realistic for the time budget.\n"
            "7. Return ONLY valid JSON in this schema, no extra text:\n"
            "{\n"
            f"  \"duration_weeks\": {weeks_remaining},\n"
            f"  \"study_load_per_week\": \"{weekly_hours} hours\",\n"
            "  \"plan\": [\n"
            "    {\n"
            "      \"week\": 1,\n"
            "      \"topics_to_master\": [\"...\", \"...\"],\n"
            "      \"suggested_milestones\": [\"...\", \"...\"]\n"
            "    }\n"
            "  ]\n"
            "}"
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Subjects list: {', '.join(subjects)}"}
        ]
        
        raw_response = await self._post_request(messages, response_format="json")
        cleaned_response = self._clean_json_string(raw_response)
        try:
            data = json.loads(cleaned_response)
            
            schedule = []
            for item in data.get("plan", []):
                schedule.append({
                    "week": item.get("week", 1),
                    "topics": item.get("topics_to_master", []),
                    "suggested_activities": ", ".join(item.get("suggested_milestones", []))
                })
                
            return {
                "title": f"Study Schedule for {', '.join(subjects)}",
                "total_weeks": data.get("duration_weeks", weeks_remaining),
                "schedule": schedule
            }
        except Exception:
            return {
                "title": f"Study Schedule for {', '.join(subjects)}",
                "total_weeks": weeks_remaining,
                "schedule": []
            }

llm_service = LLMService()
