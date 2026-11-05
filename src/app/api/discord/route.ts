import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { DiscordProfileFrame } from '../../useDiscordStatus';

// Cache badge icons locally for crisp quality and no CORS
// Keyed by ICON HASH (not badge id) so upgrades (e.g. 6mo→1yr Nitro) auto-update
const BADGES_DIR = path.join(process.cwd(), 'public', 'badges');

function iconHashFromUrl(url: string): string {
    // Extract hash from either:
    //   cdn.discordapp.com/badge-icons/{hash}.png
    //   cdn.discordapp.com/assets/content/{hash}
    const match = url.match(/\/([a-f0-9]{40,})/i);
    return match ? match[1] : Buffer.from(url).toString('base64').slice(0, 32);
}

async function downloadBadgeIfNeeded(id: string, url: string): Promise<string> {
    const hash = iconHashFromUrl(url);
    const localPath = path.join(BADGES_DIR, id + '_' + hash.slice(0, 12) + '.png');
    const publicPath = '/badges/' + id + '_' + hash.slice(0, 12) + '.png';

    // If this exact hash version already cached, return it immediately
    if (fs.existsSync(localPath)) {
        return publicPath;
    }

    // Delete any stale version of this badge (different hash)
    try {
        const files = fs.readdirSync(BADGES_DIR);
        for (const f of files) {
            if (f.startsWith(id + '_') && f.endsWith('.png') && f !== path.basename(localPath)) {
                fs.unlinkSync(path.join(BADGES_DIR, f));
            }
        }
    } catch (_) {}

    // Download fresh from Discord CDN
    try {
        if (!fs.existsSync(BADGES_DIR)) {
            fs.mkdirSync(BADGES_DIR, { recursive: true });
        }
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(localPath, Buffer.from(buffer));
            return publicPath;
        }
    } catch (e) {
        console.error('Failed to cache badge ' + id + ':', e);
    }

    return url;
}

const PROFILE_FRAME_COLLECTIBLE_TYPE = 3;
const FRAME_FAILURE_RETRY_MS = 60000;

// A SKU's artwork doesn't change, and the live route polls every second, so
// resolved frames are kept for the life of the instance. Failures retry later.
const frameCache = new Map<string, { frame: DiscordProfileFrame | null; retryAt: number }>();

async function resolveProfileFrame(collectibles?: { type?: number; sku_id?: string }[]): Promise<DiscordProfileFrame | null> {
    if (!Array.isArray(collectibles)) return null;
    const skuId = collectibles.find(c => c?.type === PROFILE_FRAME_COLLECTIBLE_TYPE)?.sku_id;
    if (!skuId) return null;

    const cached = frameCache.get(skuId);
    if (cached && Date.now() < cached.retryAt) return cached.frame;

    let frame: DiscordProfileFrame | null = null;
    try {
        const res = await fetch('https://discord.com/api/v10/store/published-listings/skus/' + skuId, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store'
        });
        if (res.ok) {
            const listing = await res.json();
            const item = listing?.sku?.tenant_metadata?.collectibles?.item;
            // Only top/bottom anchors are positioned by the client.
            const rawLayers: { id?: string; order?: string; anchor?: string }[] = item?.layers || [];
            const layers = rawLayers.flatMap((l): DiscordProfileFrame['layers'] => (
                l?.id && (l.anchor === 'top' || l.anchor === 'bottom')
                    ? [{
                        id: l.id,
                        order: l.order === 'front' ? 'front' : 'back',
                        anchor: l.anchor,
                        url: 'https://cdn.discordapp.com/media/v1/collectibles-shop/' + skuId + '/' + l.id + '/static'
                    }]
                    : []
            ));
            if (item?.inner_width && layers.length > 0) {
                frame = {
                    sku_id: skuId,
                    inner_width: item.inner_width,
                    overflow_top: item.overflow_top || 0,
                    overflow_bottom: item.overflow_bottom || 0,
                    overflow_horizontal: item.overflow_horizontal || 0,
                    layers
                };
            }
        }
    } catch (e) {
        console.error('Failed to resolve profile frame ' + skuId + ':', e);
    }

    frameCache.set(skuId, { frame, retryAt: frame ? Infinity : Date.now() + FRAME_FAILURE_RETRY_MS });
    return frame;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id') || '952780497761730560';
    const liveOnly = searchParams.get('live') === 'true';

    try {
        const dcdnRes = await fetch('https://dcdn.dstn.to/profile/' + userId + '?refresh=' + Date.now(), {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache' },
            cache: 'no-store'
        });

        if (dcdnRes.ok) {
            const data = await dcdnRes.json();
            const user = data.user || data;

            if (user && user.id) {
                const profileFrame = await resolveProfileFrame(data.user_profile?.collectibles);

                if (liveOnly) {
                    const nameplateAsset = user.collectibles?.nameplate?.asset || null;
                    const liveColors = user.display_name_styles?.colors?.map((color: number) => '#' + color.toString(16).padStart(6, '0')) || [];
                    return NextResponse.json({
                        id: user.id,
                        username: user.username,
                        global_name: user.global_name || user.username,
                        bio: user.bio ?? data.user_profile?.bio ?? null,
                        collectibles: user.collectibles || null,
                        nameplateURL: nameplateAsset ? 'https://cdn.discordapp.com/assets/collectibles/' + nameplateAsset + 'static.png' : null,
                        nameplateVideoURL: nameplateAsset ? 'https://cdn.discordapp.com/assets/collectibles/' + nameplateAsset + 'asset.webm' : null,
                        display_name_styles: user.display_name_styles ? {
                            colors: liveColors,
                            font_id: user.display_name_styles.font_id,
                            effect_id: user.display_name_styles.effect_id
                        } : null,
                        profile_effect: data.user_profile?.profile_effect || null,
                        profile_frame: profileFrame
                    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
                }

                const discordBadges = await Promise.all(
                    (data.badges || []).map(async (b: any) => {
                        const cdnURL = b.simple_icon_url
                            || (b.icon ? 'https://cdn.discordapp.com/badge-icons/' + b.icon + '.png?size=128' : '');

                        if (!cdnURL) return null;

                        const iconPath = await downloadBadgeIfNeeded(b.id, cdnURL);

                        return {
                            id: b.id,
                            description: b.description,
                            icon: iconPath,
                            link: b.link || null
                        };
                    })
                );

                const allBadges = discordBadges.filter(Boolean);

                let avatarDecorationURL: string | null = null;
                const deco = user.avatar_decoration_data || data.user_profile?.collectibles?.[0];
                if (deco?.asset) {
                    avatarDecorationURL = 'https://cdn.discordapp.com/avatar-decoration-presets/' + deco.asset + '.png?size=512';
                }

                const clan = user.clan || user.primary_guild || null;
                let clanBadgeURL: string | null = null;
                if (clan?.identity_guild_id && clan?.badge) {
                    clanBadgeURL = 'https://cdn.discordapp.com/clan-badges/' + clan.identity_guild_id + '/' + clan.badge + '.png';
                }

                let avatarURL = 'https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.png?size=512';
                if (user.avatar?.startsWith('a_')) {
                    avatarURL = 'https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.gif?size=512';
                }

                let bannerURL: string | null = null;
                const bannerHash = user.banner || data.user_profile?.banner;
                if (bannerHash) {
                    const ext = bannerHash.startsWith('a_') ? 'gif' : 'png';
                    bannerURL = 'https://cdn.discordapp.com/banners/' + user.id + '/' + bannerHash + '.' + ext + '?size=2048';
                }

                let memberSince = '';
                if (data.premium_since) {
                    const d = new Date(data.premium_since);
                    memberSince = d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
                }

                const displayNameColors = user.display_name_styles?.colors?.map((c: number) => '#' + c.toString(16).padStart(6, '0')) || [];
                const themeColors = data.user_profile?.theme_colors?.map((c: number) => '#' + c.toString(16).padStart(6, '0')) || ['#a203e6', '#3f1050'];

                let nameplateURL: string | null = null;
                let nameplateVideoURL: string | null = null;
                if (user.collectibles?.nameplate?.asset) {
                    nameplateURL = 'https://cdn.discordapp.com/assets/collectibles/' + user.collectibles.nameplate.asset + 'static.png';
                    nameplateVideoURL = 'https://cdn.discordapp.com/assets/collectibles/' + user.collectibles.nameplate.asset + 'asset.webm';
                }

                return NextResponse.json({
                    id: user.id,
                    username: user.username,
                    global_name: user.global_name || user.username,
                    avatar: user.avatar,
                    avatarURL,
                    avatarDecorationURL,
                    nameplateURL,
                    nameplateVideoURL,
                    banner: bannerHash,
                    bannerURL,
                    banner_color: user.banner_color || '#751caf',
                    accent_color: user.accent_color,
                    bio: user.bio || data.user_profile?.bio || null,
                    badges: allBadges,
                    clan: clan ? {
                        tag: clan.tag,
                        badge: clan.badge,
                        badgeURL: clanBadgeURL,
                        identity_guild_id: clan.identity_guild_id
                    } : null,
                    display_name_styles: user.display_name_styles ? {
                        colors: displayNameColors,
                        font_id: user.display_name_styles.font_id,
                        effect_id: user.display_name_styles.effect_id
                    } : null,
                    theme_colors: themeColors,
                    collectibles: user.collectibles || null,
                    profile_effect: data.user_profile?.profile_effect || null,
                    profile_frame: profileFrame,
                    connected_accounts: data.connected_accounts || [],
                    memberSince: memberSince || '19 ene 2026',
                    premium_since: data.premium_since
                }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
            }
        }
    } catch (e) {
        console.error('DCDN error, falling back to JAPI:', e);
    }

    try {
        const japiRes = await fetch('https://japi.rest/discord/v1/user/' + userId, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store'
        });
        if (japiRes.ok) {
            const json = await japiRes.json();
            const data = json.data;
            if (data) {
                return NextResponse.json({
                    id: data.id,
                    username: data.username,
                    global_name: data.global_name || data.username,
                    avatar: data.avatar,
                    avatarURL: data.avatarURL,
                    avatarDecorationURL: data.avatar_decoration_data?.asset ? 'https://cdn.discordapp.com/avatar-decoration-presets/' + data.avatar_decoration_data.asset + '.png?size=512' : null,
                    banner: data.banner,
                    bannerURL: data.bannerURL,
                    banner_color: data.banner_color || '#1a1a1a',
                    accent_color: data.accent_color,
                    badges: [],
                    clan: data.clan,
                    createdAt: data.createdAt
                }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
            }
        }
    } catch (err: any) {
        console.error('JAPI fallback error:', err);
    }

    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
}
