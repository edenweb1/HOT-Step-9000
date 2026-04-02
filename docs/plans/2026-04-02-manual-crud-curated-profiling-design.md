# Manual CRUD + Curated Profiling — Design Document

## Goal

Add manual artist/album/lyrics management to Lyric Studio (without requiring Genius), and enable curated cross-album profiling where users pick specific songs from multiple albums to build a combined profile.

## Context

Currently, the only way to add data to Lyric Studio is via the Genius fetch pipeline. This limits the system to artists/albums that exist on Genius with complete lyrics. Users need to:
1. Add artists/albums/lyrics manually for material not on Genius
2. Profile curated selections of songs across multiple albums by the same artist

## Design Decisions

1. **Add buttons use dropdown menus** — The existing "Add Artist" / "Add Album" `+` buttons get a dropdown: "Fetch from Genius" vs "Add Manually". Cleaner than separate buttons.
2. **Curated sets are lyrics_sets** — A curated cross-album selection is stored as a regular `lyrics_set` with `album = "[Curated Selection]"`. All downstream flows (profiling, generation, refinement) work unchanged.
3. **No DB schema changes** — The existing schema already supports `image_url` on both artists and lyrics_sets, nullable album names, and songs as JSON arrays.

## Architecture

### Feature 1: Manual CRUD

**Data flow (same as Genius, minus the scraping):**
```
User input → API endpoint → get_or_create_artist() + save_lyrics_set() → DB
```

**New API endpoints:**
- `POST /api/lireek/artists/create` — `{name, image_url?}` → creates artist
- `POST /api/lireek/lyrics-sets/create` — `{artist_id, album?, image_url?, songs: [{title, lyrics}]}` → creates lyrics_set
- `POST /api/lireek/lyrics-sets/{id}/add-song` — `{title, lyrics}` → appends song to JSON array

**New UI modals:**
- `AddArtistModal` — name + optional image URL
- `AddAlbumModal` — album name (optional, for "loose lyrics") + optional image URL
- `AddSongModal` — song title + lyrics textarea

### Feature 2: Curated Cross-Album Profiling

**Data flow:**
```
User selects songs across albums → API creates curated lyrics_set → normal build-profile flow
```

**New API endpoint:**
- `POST /api/lireek/artists/{artist_id}/curated-profile` — `{selections: [{lyrics_set_id, song_indices: [int]}], provider, model}` → creates curated lyrics_set + builds profile

**New UI:**
- `CuratedProfileModal` — shows all albums for an artist with expandable song lists + checkboxes, then "Build Profile" button
- Button visible on albums page when artist has 2+ albums
