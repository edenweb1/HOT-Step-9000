"""Tests for acestep.api.lireek.lireek_db — SQLite storage module."""

import json
import tempfile
from pathlib import Path

import pytest

from acestep.api.lireek import lireek_db


@pytest.fixture(autouse=True)
def _temp_db(tmp_path: Path):
    """Use a temporary database for every test."""
    db_path = tmp_path / "test_lireek.db"
    lireek_db.set_db_path(db_path)
    lireek_db.init_db()
    yield
    # Reset is implicit — tmp_path is cleaned up by pytest


# ── Schema ────────────────────────────────────────────────────────────────────

class TestInitDb:
    def test_creates_database_file(self, tmp_path: Path):
        db_path = tmp_path / "sub" / "nested" / "test.db"
        lireek_db.set_db_path(db_path)
        lireek_db.init_db()
        assert db_path.exists()

    def test_idempotent(self):
        # Calling init_db a second time should not raise
        lireek_db.init_db()


# ── Artists ───────────────────────────────────────────────────────────────────

class TestArtists:
    def test_create_and_retrieve(self):
        artist = lireek_db.get_or_create_artist("The Beatles")
        assert artist["name"] == "The Beatles"
        assert artist["id"] is not None

    def test_case_insensitive_dedup(self):
        a1 = lireek_db.get_or_create_artist("The Beatles")
        a2 = lireek_db.get_or_create_artist("the beatles")
        assert a1["id"] == a2["id"]

    def test_list_artists(self):
        lireek_db.get_or_create_artist("Artist A")
        lireek_db.get_or_create_artist("Artist B")
        artists = lireek_db.list_artists()
        names = [a["name"] for a in artists]
        assert "Artist A" in names
        assert "Artist B" in names

    def test_list_artists_includes_lyrics_set_count(self):
        artist = lireek_db.get_or_create_artist("Counter Test")
        assert any(
            a["lyrics_set_count"] == 0 for a in lireek_db.list_artists()
            if a["id"] == artist["id"]
        )

    def test_delete_artist(self):
        artist = lireek_db.get_or_create_artist("Delete Me")
        assert lireek_db.delete_artist(artist["id"]) is True
        assert lireek_db.delete_artist(artist["id"]) is False  # Already gone

    def test_delete_cascades_to_lyrics_sets(self):
        artist = lireek_db.get_or_create_artist("Cascade Test")
        lireek_db.save_lyrics_set(artist["id"], "Album", 5, [{"title": "Song", "album": "Album", "lyrics": "la la"}])
        lireek_db.delete_artist(artist["id"])
        assert lireek_db.get_lyrics_sets(artist["id"]) == []


# ── Lyrics Sets ───────────────────────────────────────────────────────────────

class TestLyricsSets:
    def _make_artist(self):
        return lireek_db.get_or_create_artist("Test Artist")

    def test_save_and_retrieve(self):
        artist = self._make_artist()
        songs = [{"title": "Song 1", "album": "Album", "lyrics": "words words"}]
        result = lireek_db.save_lyrics_set(artist["id"], "Album", 10, songs)
        assert result["total_songs"] == 1
        assert result["album"] == "Album"

    def test_get_lyrics_set_includes_songs(self):
        artist = self._make_artist()
        songs = [{"title": "Song 1", "album": "A", "lyrics": "text"}]
        ls = lireek_db.save_lyrics_set(artist["id"], "A", 10, songs)
        full = lireek_db.get_lyrics_set(ls["id"])
        assert full is not None
        assert full["songs"] == songs
        assert full["total_songs"] == 1

    def test_get_lyrics_sets_list_omits_songs(self):
        artist = self._make_artist()
        lireek_db.save_lyrics_set(artist["id"], "A", 10, [{"title": "S", "album": "A", "lyrics": "x"}])
        sets = lireek_db.get_lyrics_sets(artist["id"])
        assert len(sets) == 1
        assert "songs" not in sets[0]
        assert sets[0]["total_songs"] == 1

    def test_delete_lyrics_set(self):
        artist = self._make_artist()
        ls = lireek_db.save_lyrics_set(artist["id"], "A", 10, [])
        assert lireek_db.delete_lyrics_set(ls["id"]) is True
        assert lireek_db.get_lyrics_set(ls["id"]) is None

    def test_remove_song_from_set(self):
        artist = self._make_artist()
        songs = [
            {"title": "Keep", "album": "A", "lyrics": "keep"},
            {"title": "Remove", "album": "A", "lyrics": "remove"},
        ]
        ls = lireek_db.save_lyrics_set(artist["id"], "A", 10, songs)
        updated = lireek_db.remove_song_from_set(ls["id"], 1)
        assert updated is not None
        assert len(updated["songs"]) == 1
        assert updated["songs"][0]["title"] == "Keep"


# ── Profiles ──────────────────────────────────────────────────────────────────

class TestProfiles:
    def _setup(self):
        artist = lireek_db.get_or_create_artist("Profile Artist")
        ls = lireek_db.save_lyrics_set(artist["id"], "Album", 5, [])
        return ls

    def test_save_and_retrieve(self):
        ls = self._setup()
        profile_data = {"themes": ["love"], "raw_summary": "A love song artist"}
        result = lireek_db.save_profile(ls["id"], "gemini", "gemini-2.0-flash", profile_data)
        assert result["provider"] == "gemini"

        retrieved = lireek_db.get_profile(result["id"])
        assert retrieved is not None
        assert retrieved["profile_data"]["themes"] == ["love"]

    def test_list_profiles_for_set(self):
        ls = self._setup()
        lireek_db.save_profile(ls["id"], "gemini", "m1", {"raw_summary": "a"})
        lireek_db.save_profile(ls["id"], "openai", "m2", {"raw_summary": "b"})
        profiles = lireek_db.get_profiles(ls["id"])
        assert len(profiles) == 2

    def test_delete_profile(self):
        ls = self._setup()
        p = lireek_db.save_profile(ls["id"], "gemini", "m", {})
        assert lireek_db.delete_profile(p["id"]) is True
        assert lireek_db.get_profile(p["id"]) is None


# ── Generations ───────────────────────────────────────────────────────────────

class TestGenerations:
    def _setup(self):
        artist = lireek_db.get_or_create_artist("Gen Artist")
        ls = lireek_db.save_lyrics_set(artist["id"], "Album", 5, [])
        profile = lireek_db.save_profile(ls["id"], "gemini", "m", {})
        return ls, profile

    def test_save_with_metadata(self):
        _, profile = self._setup()
        gen = lireek_db.save_generation(
            profile_id=profile["id"],
            provider="gemini",
            model="flash",
            lyrics="[Verse 1]\nHello world",
            title="Test Song",
            bpm=120,
            key="C Major",
            caption="pop, catchy",
            duration=200,
        )
        assert gen["title"] == "Test Song"
        assert gen["bpm"] == 120

    def test_refinement_chain(self):
        _, profile = self._setup()
        parent = lireek_db.save_generation(
            profile_id=profile["id"], provider="gemini", model="m", lyrics="original"
        )
        child = lireek_db.save_generation(
            profile_id=profile["id"], provider="openai", model="m2",
            lyrics="refined", parent_generation_id=parent["id"],
        )
        assert child["parent_generation_id"] == parent["id"]

    def test_get_generations_by_profile(self):
        _, profile = self._setup()
        lireek_db.save_generation(profile["id"], "g", "m", "a")
        lireek_db.save_generation(profile["id"], "g", "m", "b")
        gens = lireek_db.get_generations(profile_id=profile["id"])
        assert len(gens) == 2

    def test_get_all_with_context(self):
        _, profile = self._setup()
        lireek_db.save_generation(profile["id"], "g", "m", "lyrics")
        rows = lireek_db.get_all_generations_with_context()
        assert len(rows) >= 1
        assert "artist_name" in rows[0]
        assert "album" in rows[0]

    def test_update_metadata(self):
        _, profile = self._setup()
        gen = lireek_db.save_generation(profile["id"], "g", "m", "text")
        lireek_db.update_generation_metadata(gen["id"], bpm=140, key="Am", caption="rock", duration=300)
        # Verify via get_generations
        gens = lireek_db.get_generations(profile_id=profile["id"])
        updated = [g for g in gens if g["id"] == gen["id"]][0]
        assert updated["bpm"] == 140
        assert updated["key"] == "Am"

    def test_delete_generation(self):
        _, profile = self._setup()
        gen = lireek_db.save_generation(profile["id"], "g", "m", "bye")
        assert lireek_db.delete_generation(gen["id"]) is True
        assert lireek_db.delete_generation(gen["id"]) is False

    def test_purge(self):
        _, profile = self._setup()
        lireek_db.save_generation(profile["id"], "g", "m", "a")
        lireek_db.save_generation(profile["id"], "g", "m", "b")
        result = lireek_db.purge_profiles_and_generations()
        assert result["generations_deleted"] == 2
        assert result["profiles_deleted"] == 1


# ── Album Presets ─────────────────────────────────────────────────────────────

class TestAlbumPresets:
    def _setup(self):
        artist = lireek_db.get_or_create_artist("Preset Artist")
        ls = lireek_db.save_lyrics_set(artist["id"], "Album", 5, [])
        return ls

    def test_upsert_and_retrieve(self):
        ls = self._setup()
        preset = lireek_db.upsert_album_preset(
            ls["id"],
            adapter_path="/adapters/test.safetensors",
            adapter_scales={"scale": 0.8, "group_scales": {"self_attn": 1.0, "cross_attn": 0.5, "mlp": 0.7}},
            matchering_ref_path="/refs/reference.wav",
        )
        assert preset["adapter_path"] == "/adapters/test.safetensors"
        assert preset["adapter_scales"]["scale"] == 0.8

    def test_upsert_updates_existing(self):
        ls = self._setup()
        lireek_db.upsert_album_preset(ls["id"], adapter_path="/old")
        updated = lireek_db.upsert_album_preset(ls["id"], adapter_path="/new")
        assert updated["adapter_path"] == "/new"

    def test_get_nonexistent_returns_none(self):
        assert lireek_db.get_album_preset(99999) is None

    def test_delete_preset(self):
        ls = self._setup()
        lireek_db.upsert_album_preset(ls["id"], adapter_path="/x")
        assert lireek_db.delete_album_preset(ls["id"]) is True
        assert lireek_db.get_album_preset(ls["id"]) is None


# ── Audio Generations ─────────────────────────────────────────────────────────

class TestAudioGenerations:
    def _setup(self):
        artist = lireek_db.get_or_create_artist("Audio Artist")
        ls = lireek_db.save_lyrics_set(artist["id"], "Album", 5, [])
        profile = lireek_db.save_profile(ls["id"], "g", "m", {})
        gen = lireek_db.save_generation(profile["id"], "g", "m", "lyrics")
        return gen

    def test_save_and_retrieve(self):
        gen = self._setup()
        ag = lireek_db.save_audio_generation(gen["id"], "job-uuid-123")
        assert ag["hotstep_job_id"] == "job-uuid-123"

        results = lireek_db.get_audio_generations(gen["id"])
        assert len(results) == 1
        assert results[0]["hotstep_job_id"] == "job-uuid-123"

    def test_multiple_audio_per_generation(self):
        gen = self._setup()
        lireek_db.save_audio_generation(gen["id"], "job-1")
        lireek_db.save_audio_generation(gen["id"], "job-2")
        results = lireek_db.get_audio_generations(gen["id"])
        assert len(results) == 2


# ── Settings ──────────────────────────────────────────────────────────────────

class TestSettings:
    def test_get_default(self):
        assert lireek_db.get_setting("nonexistent", "fallback") == "fallback"

    def test_set_and_get(self):
        lireek_db.set_setting("api_key", "sk-test-123")
        assert lireek_db.get_setting("api_key") == "sk-test-123"

    def test_upsert_overwrites(self):
        lireek_db.set_setting("key", "old")
        lireek_db.set_setting("key", "new")
        assert lireek_db.get_setting("key") == "new"

    def test_get_all_settings(self):
        lireek_db.set_setting("a", "1")
        lireek_db.set_setting("b", "2")
        all_settings = lireek_db.get_all_settings()
        assert all_settings["a"] == "1"
        assert all_settings["b"] == "2"
