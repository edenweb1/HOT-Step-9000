/**
 * RecentSongsList.tsx — Shows recently generated songs across ALL Lireek artists.
 *
 * Data flow (fast path):
 *   1. GET /api/lireek/recent-songs returns rows with pre-resolved audio_url + cover_url
 *   2. We render directly — no job-history lookups, no songs-DB lookups
 *
 * MODULE-LEVEL CACHE ensures instant render on navigation.
 * Background refresh only on refreshKey change (new generation completed).
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Loader2, Music } from 'lucide-react';
import { lireekApi, RecentSong } from '../../../services/lyricStudioApi';
import { songsApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Song } from '../../../types';

interface RecentSongsListProps {
  onPlaySong: (song: Song) => void;
  refreshKey?: number;
}

// ── Module-level cache ───────────────────────────────────────────────────────

let _cachedSongs: RecentSong[] = [];
let _cachedRefreshKey = -1;
let _fetchInFlight = false;

async function _loadRecentSongs(): Promise<RecentSong[]> {
  const res = await lireekApi.getRecentSongs(30);
  // Only keep songs that have pre-resolved audio URLs
  return (res.songs || []).filter(s => !!s.audio_url);
}

// ── Component ────────────────────────────────────────────────────────────────

export const RecentSongsList: React.FC<RecentSongsListProps> = ({ onPlaySong, refreshKey = 0 }) => {
  const { token } = useAuth();
  const [songs, setSongs] = useState<RecentSong[]>(_cachedSongs);
  const [loading, setLoading] = useState(_cachedSongs.length === 0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    if (_cachedRefreshKey === refreshKey && _cachedSongs.length > 0) return;
    if (_fetchInFlight) return;
    if (_cachedSongs.length === 0) setLoading(true);

    _fetchInFlight = true;
    _loadRecentSongs().then(resolved => {
      _cachedSongs = resolved;
      _cachedRefreshKey = refreshKey;
      _fetchInFlight = false;
      if (mountedRef.current) { setSongs(resolved); setLoading(false); }
    }).catch(() => {
      _fetchInFlight = false;
      if (mountedRef.current) setLoading(false);
    });
  }, [refreshKey, token]);

  const handlePlay = useCallback(async (rs: RecentSong) => {
    const audioUrl = rs.audio_url || '';
    // Build base song
    const song: Song = {
      id: rs.hotstep_job_id,
      title: rs.song_title || 'Untitled',
      style: rs.caption || '',
      lyrics: rs.lyrics || '',
      coverUrl: rs.cover_url || rs.album_image || rs.artist_image || '',
      duration: String(rs.duration || 0),
      createdAt: new Date(rs.ag_created_at),
      tags: [],
      audioUrl,
    };

    // Look up full DB record for generationParams (originalAudioUrl for M/O toggle)
    if (audioUrl && token) {
      try {
        const { songs: dbSongs } = await songsApi.getSongsByUrls([audioUrl], token);
        const db: any = dbSongs[0];
        if (db) {
          if (db.coverUrl || db.cover_url) song.coverUrl = db.coverUrl || db.cover_url;
          if (db.generationParams) (song as any).generationParams = db.generationParams;
          if (db.duration) song.duration = String(db.duration);
        }
      } catch { /* non-fatal — play with basic info */ }
    }

    onPlaySong(song);
  }, [onPlaySong, token]);

  if (loading && songs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
        <Music className="w-5 h-5 text-zinc-600 mb-2" />
        <p className="text-xs text-zinc-500">No recent generations yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 grid-rows-4 gap-1 px-2 py-1.5 h-full">
      {songs.slice(0, 8).map((rs) => {
        const dur = rs.duration || 0;
        const mins = Math.floor(dur / 60);
        const secs = String(Math.floor(dur % 60)).padStart(2, '0');
        const coverUrl = rs.cover_url || rs.album_image || rs.artist_image || '';
        return (
          <button
            key={rs.ag_id}
            onClick={() => handlePlay(rs)}
            className="flex items-center gap-2.5 rounded-lg hover:bg-white/[0.06] transition-colors text-left group px-2 overflow-hidden"
          >
            {/* Cover art */}
            <div className="w-14 h-14 rounded-md flex-shrink-0 overflow-hidden bg-zinc-800 relative">
              {coverUrl ? (
                <img src={coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-zinc-600" />
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-200 truncate leading-snug">
                {rs.song_title || 'Untitled'}
              </p>
              <p className="text-[10px] text-zinc-500 truncate leading-snug">
                {rs.artist_name}
              </p>
              {dur > 0 && (
                <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                  {mins}:{secs}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
