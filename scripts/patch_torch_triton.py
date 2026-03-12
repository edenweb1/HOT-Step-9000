#!/usr/bin/env python3
"""
Patch torch_python.dll for Triton/torch.compile compatibility on Windows.

PyTorch 2.9.x has a bug where the CUDA stream handle (a 64-bit pointer) is
parsed as a C `long` — which is only 32 bits on Windows. This causes an
OverflowError when torch.compile/Triton tries to launch compiled CUDA kernels,
making nano-vllm fall back to slow PyTorch eager mode (~14x slower).

This script patches torch_python.dll to use `unsigned long long` (64-bit)
instead of `long` (32-bit) for the stream argument. The fix is idempotent —
running it multiple times is safe.

The bug is tracked upstream and expected to be fixed in PyTorch 2.10+.
Once users upgrade past the affected version, this patch becomes a no-op.

Usage:
    python scripts/patch_torch_triton.py           # Auto-detect from venv
    python scripts/patch_torch_triton.py --check    # Check status without patching
    python scripts/patch_torch_triton.py --revert   # Restore from backup
"""

import argparse
import os
import shutil
import sys


# The byte pattern in torch_python.dll that parses the CUDA stream handle.
# 'l' at the end = C long (32-bit on Windows) — causes OverflowError.
# 'K' at the end = unsigned long long (64-bit) — correct for stream handles.
PATTERN_BROKEN = b"KiiiiisOl"
PATTERN_FIXED  = b"KiiiiisOK"


def find_torch_dll() -> str:
    """Locate torch_python.dll from the current Python environment."""
    try:
        import torch
        dll_path = os.path.join(os.path.dirname(torch.__file__), "lib", "torch_python.dll")
        if os.path.exists(dll_path):
            return dll_path
    except ImportError:
        pass

    raise FileNotFoundError(
        "Could not find torch_python.dll. Is PyTorch installed in this Python environment?"
    )


def check_status(dll_path: str) -> str:
    """Check the current patch status of the DLL.

    Returns:
        'needs_patch' — broken pattern found, patch needed
        'already_patched' — fixed pattern found, no action needed
        'not_applicable' — neither pattern found (different PyTorch version)
    """
    data = open(dll_path, "rb").read()
    if PATTERN_BROKEN in data:
        return "needs_patch"
    elif PATTERN_FIXED in data:
        return "already_patched"
    else:
        return "not_applicable"


def apply_patch(dll_path: str, *, force: bool = False) -> bool:
    """Apply the patch to torch_python.dll.

    Args:
        dll_path: Path to torch_python.dll
        force: If True, re-apply even if already patched

    Returns:
        True if patch was applied, False if skipped
    """
    status = check_status(dll_path)

    if status == "already_patched" and not force:
        print(f"  [OK] Already patched: {dll_path}")
        return False

    if status == "not_applicable":
        print(f"  [SKIP] Pattern not found — this PyTorch version may not need patching.")
        print(f"         DLL: {dll_path}")
        return False

    # Create backup
    backup_path = dll_path + ".bak"
    if not os.path.exists(backup_path):
        shutil.copy2(dll_path, backup_path)
        print(f"  [BACKUP] Created: {backup_path}")

    # Read, patch, write
    data = open(dll_path, "rb").read()
    patched = data.replace(PATTERN_BROKEN, PATTERN_FIXED, 1)

    if len(patched) != len(data):
        print(f"  [ERROR] Size mismatch after patching — aborting!")
        return False

    open(dll_path, "wb").write(patched)
    print(f"  [PATCHED] Fixed CUDA stream handle parsing (long → unsigned long long)")
    print(f"            DLL: {dll_path}")
    return True


def revert_patch(dll_path: str) -> bool:
    """Restore torch_python.dll from backup."""
    backup_path = dll_path + ".bak"
    if not os.path.exists(backup_path):
        print(f"  [ERROR] No backup found at: {backup_path}")
        return False

    shutil.copy2(backup_path, dll_path)
    print(f"  [REVERTED] Restored from backup: {backup_path}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Patch torch_python.dll for Triton compatibility on Windows"
    )
    parser.add_argument("--check", action="store_true", help="Check status without patching")
    parser.add_argument("--revert", action="store_true", help="Restore from backup")
    parser.add_argument("--quiet", action="store_true", help="Suppress output unless action taken")
    args = parser.parse_args()

    # Skip on non-Windows
    if sys.platform != "win32":
        if not args.quiet:
            print("  [SKIP] Not Windows — patch not needed.")
        return

    try:
        dll_path = find_torch_dll()
    except FileNotFoundError as e:
        if not args.quiet:
            print(f"  [SKIP] {e}")
        return

    if args.revert:
        revert_patch(dll_path)
        return

    if args.check:
        status = check_status(dll_path)
        labels = {
            "needs_patch": "[!] NEEDS PATCHING — Triton/vllm will crash without this fix",
            "already_patched": "[OK] Already patched",
            "not_applicable": "[OK] Pattern not found — PyTorch version may not need patching",
        }
        print(f"  {labels[status]}")
        print(f"       DLL: {dll_path}")
        return

    # Default: apply patch (quiet-safe)
    status = check_status(dll_path)

    if status == "already_patched":
        if not args.quiet:
            print(f"  [OK] Triton DLL patch already applied.")
        return

    if status == "not_applicable":
        if not args.quiet:
            print(f"  [OK] PyTorch version does not need Triton DLL patch.")
        return

    # Needs patching
    print("  Applying Triton DLL patch (fixes 14x vllm slowdown on Windows)...")
    apply_patch(dll_path)


if __name__ == "__main__":
    main()
