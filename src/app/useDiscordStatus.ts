"use client";

import { useState, useEffect } from 'react';

export interface DiscordStatus {
    status: 'online' | 'idle' | 'dnd' | 'offline';
    activities: any[];
    discord_user: {
        username: string;
        avatar: string;
        id: string;
    };
    spotify: any;
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
