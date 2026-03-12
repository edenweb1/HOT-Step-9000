"""
Runtime monkeypatch for generate_audio on checkpoint-loaded models.

Instead of modifying checkpoint files on disk (which breaks other apps),
this module replaces the generate_audio method on model instances AFTER
they are loaded via AutoModel.from_pretrained().

Our local model files (acestep/models/base/, acestep/models/sft/) already
contain the patched generate_audio with solver/guidance registry support.
Turbo models have their own distinct generate_audio and are not patched.
"""

import types

from loguru import logger


def apply_generate_audio_monkeypatch(model) -> bool:
    """Replace generate_audio on *model* with our local patched version.

    Returns True if the monkeypatch was applied, False if skipped (e.g. turbo).
    """
    class_name = type(model).__name__
    module_name = type(model).__module__ or ""

    # Turbo models have a fundamentally different diffusion loop
    # (fixed timestep schedule, no solver/guidance registry). Skip them.
    if "turbo" in module_name.lower() or "turbo" in class_name.lower():
        logger.info(
            f"[monkeypatch] Skipping turbo model ({class_name}) — "
            "turbo has its own generate_audio"
        )
        return False

    # Import the patched generate_audio from our local base model code.
    # This version has: guidance_mode, get_solver(), get_guidance(), PAG, etc.
    from acestep.models.base.modeling_acestep_v15_base import (
        AceStepConditionGenerationModel as BaseModel,
    )

    patched_method = BaseModel.generate_audio

    # Bind the unbound method to the model instance
    model.generate_audio = types.MethodType(patched_method, model)

    logger.info(
        f"[monkeypatch] Replaced generate_audio on {class_name} "
        f"(from {module_name}) with local patched version"
    )
    return True
