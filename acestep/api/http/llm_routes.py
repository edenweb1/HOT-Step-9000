"""LLM provider management API routes.

Mounted at ``/api/llm/`` — provides endpoints for listing providers,
refreshing models, and updating provider settings at runtime.
"""

import logging
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class SettingsUpdateRequest(BaseModel):
    """Request body for updating LLM settings."""
    settings: dict[str, str]  # key → value pairs to upsert


def register_llm_routes(app: FastAPI) -> None:
    """Register LLM provider management routes on the FastAPI app."""

    @app.get("/api/llm/providers")
    async def list_llm_providers():
        """List all configured LLM providers with availability and models."""
        from acestep.api.llm.provider_manager import list_providers
        providers = list_providers()
        return {"providers": [p.to_dict() for p in providers]}

    @app.get("/api/llm/providers/{provider_id}/models")
    async def get_provider_models(provider_id: str):
        """Refresh and return models for a specific provider."""
        from acestep.api.llm.provider_manager import get_provider
        try:
            provider = get_provider(provider_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))

        if not provider.is_available():
            raise HTTPException(
                status_code=503,
                detail=f"Provider '{provider_id}' is not available. Check configuration.",
            )

        info = provider.to_info()
        return {
            "provider_id": provider_id,
            "models": info.models,
            "default_model": info.default_model,
        }

    @app.get("/api/llm/settings")
    async def get_llm_settings():
        """Return all LLM-related settings from the database."""
        from acestep.api.lireek.lireek_db import get_all_settings
        all_settings = get_all_settings()
        # Filter to only LLM-relevant keys
        llm_keys = {
            "gemini_api_key", "openai_api_key", "anthropic_api_key",
            "ollama_base_url", "lmstudio_base_url",
            "unsloth_base_url", "unsloth_username", "unsloth_password",
            "gemini_model", "openai_model", "anthropic_model",
            "ollama_model", "lmstudio_model", "unsloth_model",
            "default_llm_provider", "genius_access_token",
        }
        filtered = {k: v for k, v in all_settings.items() if k in llm_keys}
        # Mask API keys for display (show last 4 chars only)
        for key in filtered:
            if "key" in key or "password" in key:
                val = filtered[key]
                if val and len(val) > 4:
                    filtered[key] = "•" * (len(val) - 4) + val[-4:]
        return {"settings": filtered}

    @app.post("/api/llm/settings")
    async def update_llm_settings(req: SettingsUpdateRequest):
        """Update LLM provider settings in the database."""
        from acestep.api.lireek.lireek_db import set_setting
        updated = []
        for key, value in req.settings.items():
            # Don't save masked values back
            if value and not value.startswith("•"):
                set_setting(key, value)
                updated.append(key)
                logger.info("Updated LLM setting: %s", key)
        return {"updated": updated, "count": len(updated)}
