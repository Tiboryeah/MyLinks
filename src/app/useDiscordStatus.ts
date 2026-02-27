"use client";

import { useState, useEffect } from 'react';

export interface DiscordStatus {
    status: 'online' | 'idle' | 'dnd' | 'offline';
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
    };
    spotify: {
        track_id: string;
        timestamps: {
            start: number;
            end: number;
        };
        song: string;
        artist: string;
        album_art_url: string;
        album: string;
    } | null;
    listening_to_spotify: boolean;
}

export function useDiscordStatus(userId: string) {
    const [data, setData] = useState<DiscordStatus | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchStatus = async () => {
            try {
                const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            } catch (err) {
                console.error("Error fetching Discord status:", err);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, [userId]);

    return data;
}
