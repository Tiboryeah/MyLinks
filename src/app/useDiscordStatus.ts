"use client";

import { useState, useEffect } from 'react';

export interface DiscordStatus {
    status: 'online' | 'idle' | 'dnd' | 'offline';
    discord_status: 'online' | 'idle' | 'dnd' | 'offline';
    activities: {
        type: number;
        name: string;
        application_id?: string;
        state?: string;
        details?: string;
        emoji?: {
            name: string;
            id?: string;
            animated?: boolean;
        };
        assets?: {
            large_image?: string;
            large_text?: string;
            small_image?: string;
            small_text?: string;
        };
    }[];
    discord_user: {
        username: string;
        global_name: string;
        avatar: string;
        id: string;
        discriminator: string;
        public_flags?: number;
        primary_guild?: {
            id: string;
            name: string;
            icon: string;
            badge: string;
            tag: string;
            identity_guild_id: string;
        };
    };
    spotify: {
        track_id: string;
        song: string;
        artist: string;
        album_art_url: string;
        album: string;
    } | null;
    listening_to_spotify: boolean;
}

export interface DiscordProfile {
    user: {
        id: string;
        username: string;
        global_name: string;
        avatar: string;
        banner: string | null;
        banner_color: string | null;
        accent_color: number | null;
        bio: string | null;
        public_flags: number;
    };
    badges: {
        id: string;
        description: string;
        icon: string;
    }[];
}

export function useDiscordData(userId: string) {
    const [status, setStatus] = useState<DiscordStatus | null>(null);
    const [profile, setProfile] = useState<DiscordProfile | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
                const json = await res.json();
                if (json.success) setStatus(json.data);
            } catch (err) {
                console.error("Error fetching Lanyard:", err);
            }
        };

        const fetchProfile = async () => {
            try {
                const res = await fetch(`https://dcdn.dstn.to/profile/${userId}`);
                const json = await res.json();
                // Some wrappers return { user, badges, ... } directly
                if (json.user) setProfile(json);
            } catch (err) {
                console.error("Error fetching DCDN profile:", err);
            }
        };

        fetchStatus();
        fetchProfile();

        const statusInterval = setInterval(fetchStatus, 30000);
        return () => clearInterval(statusInterval);
    }, [userId]);

    return { status, profile };
}
