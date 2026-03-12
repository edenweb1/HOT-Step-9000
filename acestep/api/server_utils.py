"""Shared helper utilities used by API server request and runtime flows."""

from __future__ import annotations

import os
import re
from typing import Any, Dict, Optional


STATUS_MAP = {"queued": 0, "running": 0, "succeeded": 1, "failed": 2}


def parse_description_hints(description: str) -> tuple[Optional[str], bool]:
    """Parse language and instrumental hints from free-form description text.

    Args:
        description: User free-form sample description.

    Returns:
        Tuple of ``(language_code, is_instrumental)``.
    """

    if not description:
        return None, False

    description_lower = description.lower().strip()

    language_mapping = {
        "english": "en",
        "en": "en",
        "chinese": "zh",
        "中文": "zh",
        "zh": "zh",
        "mandarin": "zh",
        "japanese": "ja",
        "日本語": "ja",
        "ja": "ja",
        "korean": "ko",
        "한국어": "ko",
        "ko": "ko",
        "spanish": "es",
        "español": "es",
        "es": "es",
        "french": "fr",
        "français": "fr",
        "fr": "fr",
        "german": "de",
        "deutsch": "de",
        "de": "de",
        "italian": "it",
        "italiano": "it",
        "it": "it",
        "portuguese": "pt",
        "português": "pt",
        "pt": "pt",
        "russian": "ru",
        "русский": "ru",
        "ru": "ru",
        "bengali": "bn",
        "bn": "bn",
        "hindi": "hi",
        "hi": "hi",
        "arabic": "ar",
        "ar": "ar",
        "thai": "th",
        "th": "th",
        "vietnamese": "vi",
        "vi": "vi",
        "indonesian": "id",
        "id": "id",
        "turkish": "tr",
        "tr": "tr",
        "dutch": "nl",
        "nl": "nl",
        "polish": "pl",
        "pl": "pl",
    }

    detected_language = None
    for lang_name, lang_code in language_mapping.items():
        if len(lang_name) <= 2:
            pattern = r"(?:^|\s|[.,;:!?])" + re.escape(lang_name) + r"(?:$|\s|[.,;:!?])"
        else:
            pattern = r"\b" + re.escape(lang_name) + r"\b"
        if re.search(pattern, description_lower):
            detected_language = lang_code
            break

    is_instrumental = False
    if "instrumental" in description_lower:
        is_instrumental = True
    elif "pure music" in description_lower or "pure instrument" in description_lower:
        is_instrumental = True
    elif description_lower.endswith(" solo") or description_lower == "solo":
        is_instrumental = True

    return detected_language, is_instrumental


def env_bool(name: str, default: bool) -> bool:
    """Read boolean environment variable with legacy truthy semantics."""

    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def get_model_name(config_path: str) -> str:
    """Extract model name from config path."""

    if not config_path:
        return ""
    normalized = config_path.rstrip("/\\")
    return os.path.basename(normalized)


def map_status(status: str) -> int:
    """Map textual job status to integer API status code."""

    return STATUS_MAP.get(status, 2)


def parse_timesteps(value: Optional[str]) -> Optional[list[float]]:
    """Parse comma-separated timesteps into float list."""

    if not value or not value.strip():
        return None
    try:
        return [float(item.strip()) for item in value.split(",") if item.strip()]
    except (ValueError, Exception):
        return None


def is_instrumental(lyrics: str) -> bool:
    """Return whether lyrics indicate instrumental output."""

    if not lyrics:
        return True
    lyrics_clean = lyrics.strip().lower()
    if not lyrics_clean:
        return True
    return lyrics_clean in ("[inst]", "[instrumental]")


def _build_generation_info(
    lm_metadata: Optional[Dict[str, Any]],
    time_costs: Dict[str, float],
    seed_value: str,
    inference_steps: int,
    num_audios: int,
    audio_format: str = "flac",
) -> str:
    """Build a compact generation timing summary.

    Args:
        lm_metadata: LM-generated metadata dictionary (unused, kept for API compat).
        time_costs: Unified time costs dictionary.
        seed_value: Seed value string (unused, kept for API compat).
        inference_steps: Number of inference steps (unused, kept for API compat).
        num_audios: Number of generated audios.
        audio_format: Output audio format name (e.g. "flac", "mp3", "wav32").

    Returns:
        Formatted generation info string.
    """
    if not time_costs or num_audios <= 0:
        return ""

    songs_label = f"({num_audios} song{'s' if num_audios > 1 else ''})"
    info_parts = []

    # --- Block 1: Generation time (LM + DiT) ---
    lm_total = time_costs.get('lm_total_time', 0.0)
    dit_total = time_costs.get('dit_total_time_cost', 0.0)
    gen_total = lm_total + dit_total

    if gen_total > 0:
        avg = gen_total / num_audios
        lines = [f"Total generation time {songs_label}: {gen_total:.2f}s"]
        lines.append(f"- {avg:.2f}s per song")
        if lm_total > 0:
            lines.append(f"- LM phase {songs_label}: {lm_total:.2f}s")
        if dit_total > 0:
            lines.append(f"- DiT phase {songs_label}: {dit_total:.2f}s")
        info_parts.append("\n".join(lines))

    # --- Block 2: Processing time (conversion + scoring + LRC) ---
    audio_conversion_time = time_costs.get('audio_conversion_time', 0.0)
    auto_score_time = time_costs.get('auto_score_time', 0.0)
    auto_lrc_time = time_costs.get('auto_lrc_time', 0.0)
    proc_total = audio_conversion_time + auto_score_time + auto_lrc_time

    if proc_total > 0:
        fmt_label = audio_format.upper() if audio_format != "wav32" else "WAV 32-bit"
        lines = [f"Total processing time {songs_label}: {proc_total:.2f}s"]
        if audio_conversion_time > 0:
            lines.append(f"- to {fmt_label} {songs_label}: {audio_conversion_time:.2f}s")
        if auto_score_time > 0:
            lines.append(f"- scoring {songs_label}: {auto_score_time:.2f}s")
        if auto_lrc_time > 0:
            lines.append(f"- LRC detection {songs_label}: {auto_lrc_time:.2f}s")
        info_parts.append("\n".join(lines))

    return "\n\n".join(info_parts)
