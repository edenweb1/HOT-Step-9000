"""Audio-path validation and upload persistence helpers for release-task flow."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path
from typing import List, Optional

from fastapi import HTTPException
from starlette.datastructures import UploadFile as StarletteUploadFile

# Known-safe audio file extensions (lowercase, with dot).
_AUDIO_EXTENSIONS = frozenset({
    ".mp3", ".wav", ".flac", ".ogg", ".opus", ".m4a",
    ".aac", ".webm", ".mp4", ".wma",
})

# Additional directories that are considered safe for audio file paths.
# Always includes the system temp dir; callers can register more via
# ``add_allowed_audio_directory()``.
_allowed_audio_dirs: List[str] = []


def add_allowed_audio_directory(directory: str) -> None:
    """Register an additional directory as safe for audio file paths.

    Args:
        directory: Absolute path to a directory that should be accepted
            by ``validate_audio_path``.
    """
    resolved = os.path.realpath(directory)
    if resolved not in _allowed_audio_dirs:
        _allowed_audio_dirs.append(resolved)


def _is_in_allowed_directory(realpath: str) -> bool:
    """Return True if *realpath* falls under any allowed directory."""
    system_temp = os.path.realpath(tempfile.gettempdir())
    dirs_to_check = [system_temp] + _allowed_audio_dirs
    for base in dirs_to_check:
        try:
            if os.path.commonpath([base, realpath]) == base:
                return True
        except ValueError:
            continue
    return False


def validate_audio_path(path: Optional[str]) -> Optional[str]:
    """Validate user-supplied audio path and block unsafe filesystem traversal.

    Accepts:
    - Paths within the system temp directory.
    - Paths within any directory registered via ``add_allowed_audio_directory()``.
    - Absolute paths pointing to **existing** files with a recognized audio
      extension (trusted local caller fallback, e.g. Node.js frontend).
    - Relative paths without ``..`` traversal components.

    Args:
        path: User-supplied path value from request payload.

    Returns:
        Normalized path string for accepted values, or ``None`` for empty input.

    Raises:
        HTTPException: If the path fails all safety checks.
    """

    if not path:
        return None

    requested_path = os.path.realpath(path)

    # 1. Allowed-directory whitelist (always includes temp dir).
    if _is_in_allowed_directory(requested_path):
        return requested_path

    # 2. Existing audio file with safe extension (trusted local caller).
    if os.path.isabs(path):
        ext = os.path.splitext(requested_path)[1].lower()
        if ext in _AUDIO_EXTENSIONS and os.path.isfile(requested_path):
            return requested_path
        raise HTTPException(status_code=400, detail="absolute audio file paths are not allowed")

    # 3. Relative paths – block traversal attempts.
    normalized = os.path.normpath(path)
    if ".." in normalized.split(os.sep):
        raise HTTPException(status_code=400, detail="path traversal in audio file paths is not allowed")
    return path


async def save_upload_to_temp(upload: StarletteUploadFile, *, prefix: str) -> str:
    """Persist uploaded audio file to a temporary location.

    Args:
        upload: Uploaded file wrapper from Starlette/FastAPI.
        prefix: Filename prefix used for the temporary file.

    Returns:
        Path to the stored temporary file.

    Raises:
        Exception: Re-raises write errors after cleaning up partial files.
    """

    suffix = Path(upload.filename or "").suffix
    fd, path = tempfile.mkstemp(prefix=f"{prefix}_", suffix=suffix)
    os.close(fd)
    try:
        with open(path, "wb") as file_obj:
            while True:
                chunk = await upload.read(1024 * 1024)
                if not chunk:
                    break
                file_obj.write(chunk)
    except Exception:
        try:
            os.remove(path)
        except Exception:
            pass
        raise
    finally:
        try:
            await upload.close()
        except Exception:
            pass
    return path
