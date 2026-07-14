from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Literal

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.nvidia_llm_service import NvidiaLLMService

router = APIRouter()


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    messages: List[Message] = Field(..., min_length=1)
    max_tokens: int = Field(default=4096, ge=1, le=8192)
    temperature: float = Field(default=1.0, ge=0.0, le=2.0)
    top_p: float = Field(default=0.95, ge=0.0, le=1.0)
    # enable_thinking: bool = True
    # include_system_prompt: bool = True


class ChatResponse(BaseModel):
    response: Dict[str, Any]


@router.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "ok"}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    messages = _build_messages(request)
    service = _create_service()

    try:
        response = await service.chat(
            messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            # enable_thinking=request.enable_thinking,
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=exc.response.text,
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    finally:
        await service.close()

    return ChatResponse(response=response)


@router.post("/chat/stream")
async def stream_chat(request: ChatRequest) -> StreamingResponse:
    messages = _build_messages(request)

    async def event_stream():
        service = _create_service()
        output_batcher = TokenBatcher(channel="0")
        thinking_batcher = TokenBatcher(channel="1")

        try:
            async for chunk in service.stream_chat(
                messages,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p,
                # enable_thinking=request.enable_thinking,
            ):
                for payload in _extract_stream_payloads(chunk):
                    content = payload.get("content")
                    reasoning = payload.get("reasoning")

                    if reasoning:
                        for line in thinking_batcher.add(reasoning):
                            yield line

                    if content:
                        for line in output_batcher.add(content):
                            yield line

            for line in thinking_batcher.flush():
                yield line
            for line in output_batcher.flush():
                yield line
        except httpx.HTTPStatusError as exc:
            error = {"status_code": exc.response.status_code, "detail": exc.response.text}
            yield _to_ndjson({"error": error})
        except httpx.HTTPError as exc:
            error = {"status_code": 502, "detail": str(exc)}
            yield _to_ndjson({"error": error})
        finally:
            await service.close()

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")


def _build_messages(request: ChatRequest) -> List[Dict[str, str]]:
    messages = [message.model_dump() for message in request.messages]

    if messages[0]["role"] != "system":
        return [{"role": "system", "content": SYSTEM_PROMPT}, *messages]

    return messages


def _create_service() -> NvidiaLLMService:
    try:
        return NvidiaLLMService()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


class TokenBatcher:
    def __init__(self, channel: str, batch_size: int = 5):
        self.channel = channel
        self.batch_size = batch_size
        self._tokens: List[str] = []

    def add(self, text: str) -> List[str]:
        lines = []
        self._tokens.extend(_split_text_tokens(text))

        while len(self._tokens) >= self.batch_size:
            batch = self._tokens[: self.batch_size]
            self._tokens = self._tokens[self.batch_size :]
            lines.append(_to_ndjson({self.channel: "".join(batch)}))

        return lines

    def flush(self) -> List[str]:
        if not self._tokens:
            return []

        batch = self._tokens
        self._tokens = []
        return [_to_ndjson({self.channel: "".join(batch)})]


def _extract_stream_payloads(chunk: str) -> List[Dict[str, str]]:
    try:
        data = json.loads(chunk)
    except json.JSONDecodeError:
        return []

    payloads = []
    for choice in data.get("choices", []):
        delta = choice.get("delta") or {}
        payload = {}

        if delta.get("content"):
            payload["content"] = delta["content"]
        if delta.get("reasoning"):
            payload["reasoning"] = delta["reasoning"]

        if payload:
            payloads.append(payload)

    return payloads


def _split_text_tokens(text: str) -> List[str]:
    return re.findall(r"\s*\S+\s*", text)


def _to_ndjson(payload: Dict[str, Any]) -> str:
    return f"{json.dumps(payload, ensure_ascii=False)}\n"
