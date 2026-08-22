"use client";

import { useState, useEffect, useRef } from 'react';

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
        avatar_decoration_data?: {
            asset: string;
            sku_id?: string;
        };
        collectibles?: {
            nameplate?: {
                asset: string;
                sku_id?: string;
                palette?: string;
                label?: string;
            };
        } | null;
        display_name_styles?: {
            colors: number[];
            font_id?: number;
            effect_id?: number;
        } | null;
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
        timestamps?: {
            start: number;
            end: number;
        };
    } | null;
    listening_to_spotify: boolean;
}

export interface DiscordProfileData {
    id: string;
    username: string;
    global_name: string;
    avatar: string;
    avatarURL: string;
    avatarDecorationURL: string | null;
    nameplateURL?: string | null;
    nameplateVideoURL?: string | null;
    banner: string | null;
    bannerURL: string | null;
    banner_color: string;
    accent_color: number | null;
    badges: {
        id: string;
        description: string;
        icon: string;
    }[];
    clan: {
        tag: string;
        badge: string;
        badgeURL: string | null;
        identity_guild_id: string;
    } | null;
    bio?: string | null;
    connected_accounts?: {
        type: string;
        name: string;
        verified?: boolean;
    }[];
    display_name_styles?: {
        colors: string[];
        font_id?: number;
        effect_id?: number;
    } | null;
    theme_colors?: string[];
    collectibles?: any;
    profile_effect?: any;
    createdAt?: string;
    memberSince?: string;
    flags?: string[];
}

export function useDiscordData(userId: string) {
    const [status, setStatus] = useState<DiscordStatus | null>(null);
    const [profile, setProfile] = useState<DiscordProfileData | null>(null);
    const [lanyardMonitored, setLanyardMonitored] = useState<boolean>(true);
    const wsRef = useRef<WebSocket | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const profileRefreshRef = useRef<() => void>(() => {});

    // 1. Fetch Profile (JAPI / Discord enriched profile)
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        let profileRequestInFlight = false;
        let liveRequestInFlight = false;

        const fetchProfile = async () => {
            if (profileRequestInFlight) return;
            profileRequestInFlight = true;
            try {
                const res = await fetch(`/api/discord?id=${userId}&refresh=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data: DiscordProfileData = await res.json();
                    if (!cancelled) setProfile(data);
                }
            } catch (err) {
                console.error("Error fetching Discord Profile:", err);
            } finally {
                profileRequestInFlight = false;
            }
        };

        const fetchLiveProfile = async () => {
            if (liveRequestInFlight) return;
            liveRequestInFlight = true;
            try {
                const res = await fetch(`/api/discord?id=${userId}&live=true&refresh=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data: Partial<DiscordProfileData> = await res.json();
                    if (!cancelled) setProfile(current => current ? { ...current, ...data } : current);
                }
            } catch (err) {
                console.error("Error fetching live Discord profile fields:", err);
            } finally {
                liveRequestInFlight = false;
            }
        };

        profileRefreshRef.current = fetchLiveProfile;
        fetchProfile();
        // Poll every 30s — picks up badge changes, new effects, avatar/banner updates
        const liveProfileInterval = setInterval(() => {
            if (document.visibilityState === 'visible') fetchLiveProfile();
        }, 1000);
        const fullProfileInterval = setInterval(() => {
            if (document.visibilityState === 'visible') fetchProfile();
        }, 30000);
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') {
                fetchLiveProfile();
                fetchProfile();
            }
        };
        const refreshOnFocus = () => {
            fetchLiveProfile();
            fetchProfile();
        };
        window.addEventListener('focus', refreshOnFocus);
        document.addEventListener('visibilitychange', refreshWhenVisible);
        return () => {
            cancelled = true;
            profileRefreshRef.current = () => {};
            clearInterval(liveProfileInterval);
            clearInterval(fullProfileInterval);
            window.removeEventListener('focus', refreshOnFocus);
            document.removeEventListener('visibilitychange', refreshWhenVisible);
        };
    }, [userId]);

    // 2. Real-time Lanyard via WebSocket with REST Polling Fallback
    useEffect(() => {
        if (!userId) return;

        let isUnmounted = false;
        let reconnectTimeout: NodeJS.Timeout | null = null;

        const setupWebSocket = () => {
            try {
                const ws = new WebSocket("wss://api.lanyard.rest/socket");
                wsRef.current = ws;

                ws.onopen = () => {
                    // Connected to Lanyard socket
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        const { op, d, t } = message;

                        if (op === 1) {
                            // Hello packet: Send initialize and start heartbeat
                            const heartbeatInterval = d.heartbeat_interval;
                            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
                            heartbeatIntervalRef.current = setInterval(() => {
                                if (ws.readyState === WebSocket.OPEN) {
                                    ws.send(JSON.stringify({ op: 3 }));
                                }
                            }, heartbeatInterval);

                            // Subscribe to user
                            ws.send(JSON.stringify({
                                op: 2,
                                d: {
                                    subscribe_to_id: userId
                                }
                            }));
                        } else if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
                            if (!isUnmounted && d) {
                                setStatus(d);
                                setLanyardMonitored(true);
                                // Presence packets carry the freshest user fields.
                                // Also refresh non-presence fields such as bio/banner/badges.
                                profileRefreshRef.current();
                            }
                        }
                    } catch (e) {
                        console.error("Error parsing Lanyard WS message:", e);
                    }
                };

                ws.onerror = (err) => {
                    console.warn("Lanyard WS warning, falling back to REST:", err);
                };

                ws.onclose = () => {
                    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
                    if (!isUnmounted) {
                        reconnectTimeout = setTimeout(setupWebSocket, 10000);
                    }
                };
            } catch (e) {
                console.error("Lanyard WS init error:", e);
            }
        };

        // REST fallback check
        const fetchRestStatus = async () => {
            try {
                const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
                const json = await res.json();
                if (json.success && json.data) {
                    setStatus(json.data);
                    setLanyardMonitored(true);
                } else if (json.error?.code === "user_not_monitored") {
                    setLanyardMonitored(false);
                }
            } catch (err) {
                // Ignore transient errors
            }
        };

        fetchRestStatus();
        setupWebSocket();
        // The socket is primary; polling also acts as a watchdog if a connection
        // remains technically open but stops delivering presence events.
        const restInterval = setInterval(fetchRestStatus, 15000);
        const refreshStatusWhenVisible = () => {
            if (document.visibilityState === 'visible') fetchRestStatus();
        };
        window.addEventListener('online', fetchRestStatus);
        window.addEventListener('focus', fetchRestStatus);
        document.addEventListener('visibilitychange', refreshStatusWhenVisible);

        return () => {
            isUnmounted = true;
            clearInterval(restInterval);
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
            window.removeEventListener('online', fetchRestStatus);
            window.removeEventListener('focus', fetchRestStatus);
            document.removeEventListener('visibilitychange', refreshStatusWhenVisible);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [userId]);

    return { status, profile, lanyardMonitored };
}
