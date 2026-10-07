from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.assistant import get_assistant_service

router = APIRouter(prefix="/api/assistant", tags=["AI Threat Intelligence Assistant"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    model_used: str
    status: str

@router.post("/chat", response_model=ChatResponse)
def assistant_chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Messages list cannot be empty."
        )

    service = get_assistant_service()
    raw_messages = [{"role": m.role, "content": m.content} for m in req.messages]
    
    result = service.generate_chat_response(
        messages=raw_messages,
        context=req.context
    )
    
    return ChatResponse(**result)
