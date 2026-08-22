"use client";

import { useState, useEffect, useRef, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useDiscordData } from './useDiscordStatus';
import {
  Instagram,
  Github,
  Twitch,
  Eye,
  Volume2,
  VolumeX,
  Music,
  Gamepad2,
  Globe,
  Calendar,
  Sparkles,
  ExternalLink,
  Disc3,
  CheckCircle2,
  FileText
} from 'lucide-react';
import dynamic from 'next/dynamic';
const PataponMinigame = dynamic(() => import('./PataponMinigame'), { ssr: false });

// 48 staggered cells, deterministically shuffled so decorations cover the
// viewport without forming columns or competing for the same space.
const SCATTER_SLOTS = Array.from({ length: 48 }, (_, index) => {
  const cell = (index * 37) % 48;
  const row = Math.floor(cell / 8);
  const column = cell % 8;
  return {
    top: `${7.5 + row * 17}%`,
    left: `${6.25 + column * 12.5 + (row % 2 ? 2.5 : 0)}%`,
  };
});

const Typewriter = ({ text, className, active = true, as: Tag = "h1", style, effectId }: { text: string; className?: string; delay?: number; active?: boolean; as?: any; style?: CSSProperties; effectId?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [delta, setDelta] = useState(200);

  useEffect(() => {
    if (!active) return;

    const tick = () => {
      const fullText = text;
      const updatedText = isDeleting ? fullText.substring(0, displayText.length - 1) : fullText.substring(0, displayText.length + 1);

      setDisplayText(updatedText);

      if (isDeleting) {
        setDelta(100);
      }

      if (!isDeleting && updatedText === fullText) {
        setIsDeleting(true);
        setDelta(2000);
      } else if (isDeleting && updatedText === "") {
        setIsDeleting(false);
        setDelta(200);
      }
    };

    const timer = setTimeout(tick, delta);
    return () => clearTimeout(timer);
  }, [displayText, delta, active, isDeleting, text]);

  return <Tag className={className} style={style} data-effect={effectId}>{displayText}</Tag>;
};

const DISPLAY_NAME_FONTS: Record<number, string> = {
  1: "'Bangers', Impact, sans-serif",
  2: "'BioRhyme', Georgia, serif",
  3: "'Permanent Marker', cursive",
  4: "'Chicle', cursive",
  5: "Georgia, serif",
  6: "'MuseoModerno', sans-serif",
  7: "Georgia, serif",
  8: "'Pixelify Sans', monospace",
  9: "'Outfit', sans-serif",
  10: "'Permanent Marker', cursive",
  11: "'Outfit', sans-serif",
  12: "'Zilla Slab', serif",
  13: "'Bangers', sans-serif",
  14: "'Pixelify Sans', monospace",
  15: "'Permanent Marker', cursive",
  16: "'Caveat', cursive",
};

const DISCORD_INLINE_PATTERN = /(<a?:[A-Za-z0-9_]+:\d+>|https?:\/\/[^\s]+|\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g;

function renderDiscordInline(text: string, keyPrefix = 'bio'): ReactNode[] {
  return text.split(DISCORD_INLINE_PATTERN).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const emoji = part.match(/^<(a?):([A-Za-z0-9_]+):(\d+)>$/);
    if (emoji) {
      const [, animated, name, id] = emoji;
      return <img key={key} className="discord-bio-emoji" src={`https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'webp'}?size=48&quality=lossless`} alt={`:${name}:`} title={`:${name}:`} />;
    }
    if (/^https?:\/\//.test(part)) {
      return <a key={key} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
    }
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{renderDiscordInline(part.slice(2, -2), key)}</strong>;
    if (part.startsWith('__') && part.endsWith('__')) return <u key={key}>{renderDiscordInline(part.slice(2, -2), key)}</u>;
    if (part.startsWith('~~') && part.endsWith('~~')) return <s key={key}>{renderDiscordInline(part.slice(2, -2), key)}</s>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{renderDiscordInline(part.slice(1, -1), key)}</em>;
    if (part.startsWith('_') && part.endsWith('_')) return <em key={key}>{renderDiscordInline(part.slice(1, -1), key)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={key}>{part.slice(1, -1)}</code>;
    return <span key={key}>{part}</span>;
  });
}

function DiscordBio({ bio }: { bio: string }) {
  return <>{bio.split(/\r?\n/).map((line, index) => {
    const quote = line.match(/^\s*&gt;\s?(.*)$/) || line.match(/^\s*>\s?(.*)$/);
    return quote
      ? <blockquote key={index}>{renderDiscordInline(quote[1], `quote-${index}`)}</blockquote>
      : <div className="discord-bio-line" key={index}>{line ? renderDiscordInline(line, `line-${index}`) : <br />}</div>;
  })}</>;
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const enteredRef = useRef(false);
  const [showDecorations, setShowDecorations] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [views, setViews] = useState<number | string>("...");
  const [bgAudioSrc, setBgAudioSrc] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.25);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioTimeText, setAudioTimeText] = useState({ current: "00:00", duration: "00:30" });

  // Profile effect — plays once on entry, replays on hover
  const [profileEffect, setProfileEffect] = useState<{
    introSrc: string;
    loopSrc: string;
    introDuration: number;
    loopDuration: number;
    loopDelay: number;
  } | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const [effectPhase, setEffectPhase] = useState<'intro' | 'loop'>('intro');
  const [effectKey, setEffectKey] = useState(0);
  const effectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const effectPlayingRef = useRef(false);

  // Card scale to always fit within viewport height without scroll
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardScale, setCardScale] = useState(1);

  const [currentTrack, setCurrentTrack] = useState<{
    song: string;
    artist: string;
    albumArt: string | null;
    trackId: string | null;
    isSpotify: boolean;
  }>({
    song: "Everlong",
    artist: "Foo Fighters",
    albumArt: null,
    trackId: null,
    isSpotify: false
  });

  const lastSpotifyTrackIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.volume-control-wrapper')) {
        setIsVolumeOpen(false);
      }
    };
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const discordId = "952780497761730560";
  const { status, profile, lanyardMonitored } = useDiscordData(discordId);

  const bats = useMemo(() => [130, 90, 110, 70, 100, 85, 75, 85, 95, 105].map((size, index) => ({
    id: index + 1,
    ...SCATTER_SLOTS[index],
    size,
    delay: `${(index * 1.17) % 4.2}s`,
  })), []);

  // Ultra-stable distribution: 5x10 Grid with zero jitter to prevent any overlaps
  const pataponArmy = useMemo(() => {
    const list: any[] = [];

    const validExtra = [2, 3, 4, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    const allValid = [
      ...Array.from({ length: 12 }, (_, i) => ({ id: i + 1, isExtra: false, name: `patapon_${i + 1}`, isBoss: false })),
      ...validExtra.map(id => ({ id: id + 12, isExtra: true, name: `patapon_${id}`, isBoss: id === 26 }))
    ];

    allValid.forEach((unit, idx) => {
      if (idx + bats.length < SCATTER_SLOTS.length) {
        const slot = SCATTER_SLOTS[idx + bats.length];
        const scale = 65;

        list.push({
          ...unit,
          top: slot.top,
          left: slot.left,
          size: scale,
          delay: `${idx * 0.1}s`,
        });
      }
    });

    return list;
  }, [bats.length]);

  useEffect(() => {
    if (!entered) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [entered]);

  // Live Spotify synchronization
  useEffect(() => {
    if (!entered) return;

    let isCancelled = false;

    if (status?.listening_to_spotify && status.spotify) {
      const sp = status.spotify;
      if (sp.track_id !== lastSpotifyTrackIdRef.current) {
        lastSpotifyTrackIdRef.current = sp.track_id;
        setCurrentTrack({
          song: sp.song,
          artist: sp.artist,
          albumArt: sp.album_art_url,
          trackId: sp.track_id,
          isSpotify: true
        });

        const fetchPreview = async () => {
          try {
            const query = `${sp.artist} ${sp.song}`;
            const response = await fetch(`/api/music?q=${encodeURIComponent(query)}`);
            if (response.ok) {
              const data = await response.json();
              if (!isCancelled && data.preview) {
                setBgAudioSrc(data.preview);
              }
            }
          } catch (error) {
            console.error("Error fetching live Spotify preview:", error);
          }
        };
        fetchPreview();
      }
    } else {
      if (!lastSpotifyTrackIdRef.current && !bgAudioSrc) {
        setBgAudioSrc("/everlong.mp3");
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [status?.listening_to_spotify, status?.spotify?.track_id, entered, bgAudioSrc]);

  useEffect(() => {
    if (audioRef.current && entered) {
      if (showMinigame) {
        audioRef.current.pause();
      } else if (!muted) {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(() => {
          console.log("Autoplay prevented or audio source changed.");
        });
      }
    }
  }, [bgAudioSrc, muted, volume, showMinigame, entered]);

  // Continuous real-time playback timer (every 250ms) - Never freezes!
  useEffect(() => {
    if (!entered) return;

    const timer = setInterval(() => {
      // 1. Live Spotify with timestamps from Discord Gateway
      if (status?.listening_to_spotify && status.spotify?.timestamps?.start) {
        const { start, end } = status.spotify.timestamps;
        const now = Date.now();
        const totalDurationSecs = end ? Math.max(1, Math.round((end - start) / 1000)) : 180;
        const currentElapsedSecs = Math.max(0, Math.min(totalDurationSecs, Math.round((now - start) / 1000)));

        const pct = (currentElapsedSecs / totalDurationSecs) * 100;
        setAudioProgress(pct);
        setAudioTimeText({
          current: formatTime(currentElapsedSecs),
          duration: formatTime(totalDurationSecs)
        });
      }
      // 2. Local Audio element tracking
      else if (audioRef.current) {
        const audio = audioRef.current;
        if (!isNaN(audio.duration) && audio.duration > 0) {
          const pct = (audio.currentTime / audio.duration) * 100;
          setAudioProgress(pct);
          setAudioTimeText({
            current: formatTime(audio.currentTime),
            duration: formatTime(audio.duration)
          });
        }
      }
    }, 250);

    return () => clearInterval(timer);
  }, [entered, status?.listening_to_spotify, status?.spotify?.timestamps]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && muted) {
      setMuted(false);
    } else if (newVol === 0 && !muted) {
      setMuted(true);
    }
  };

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch('/api/views');
        const data = await res.json();
        setViews(data.count ?? 110);
      } catch { setViews(110); }
    };
    fetchViews();
  }, []);

  const handleEnter = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    setEntered(true);

    setTimeout(() => {
      setShowDecorations(true);
    }, 800);

    fetch('/api/views', { method: 'POST', cache: 'no-store' }).then(res => res.json()).then(data => {
      setViews(data.count ?? 110);
    }).catch(() => { });
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
    if (audioRef.current) audioRef.current.muted = !muted;
  };

  const customStatus = status?.activities?.find(a => a.type === 4);

  const handleOpenMinigame = () => {
    const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 1024);

    if (isMobileOrTablet) {
      alert("Patapon Minigame is only available on Desktop (Keyboard required)!");
      return;
    }
    setShowMinigame(true);
  };

  // Dynamic Avatar, Banner, and Clan
  const liveDiscordUser = status?.discord_user;
  const clanData = liveDiscordUser ? (liveDiscordUser.primary_guild || null) : (profile?.clan || null);
  const avatarUrl = liveDiscordUser ? (liveDiscordUser.avatar?.startsWith('a_') ? `https://cdn.discordapp.com/avatars/${liveDiscordUser.id}/${liveDiscordUser.avatar}.gif?size=512` : `https://cdn.discordapp.com/avatars/${liveDiscordUser.id}/${liveDiscordUser.avatar}.webp?size=512`) : (profile?.avatarURL || "https://github.com/Tiboryeah.png");
  const liveDecoration = liveDiscordUser?.avatar_decoration_data;
  const avatarDecorationUrl = liveDiscordUser
    ? (liveDecoration?.asset
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${liveDecoration.asset}.png?size=512&v=${liveDecoration.sku_id || liveDecoration.asset}`
      : null)
    : profile?.avatarDecorationURL;
  const bannerUrl = profile?.bannerURL || null;
  const resolvedDisplayName = status?.discord_user?.global_name || profile?.global_name || profile?.username || "tiboryeah";
  const liveDisplayNameStyle = liveDiscordUser?.display_name_styles;
  const displayNameStyle = liveDisplayNameStyle || profile?.display_name_styles;
  const rawDisplayNameColors = displayNameStyle?.colors || [];
  const displayNameColors = rawDisplayNameColors.length
    ? rawDisplayNameColors.map(color => typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : color)
    : ['#ffffff', '#ffffff'];
  const liveNameplateAsset = liveDiscordUser?.collectibles?.nameplate?.asset;
  const activeNameplatePalette = liveDiscordUser?.collectibles?.nameplate?.palette
    || profile?.collectibles?.nameplate?.palette
    || 'cobalt';
  const activeNameplateURL = liveDiscordUser
    ? (liveNameplateAsset ? `https://cdn.discordapp.com/assets/collectibles/${liveNameplateAsset}static.png` : null)
    : profile?.nameplateURL;
  const activeNameplateVideoURL = liveDiscordUser
    ? (liveNameplateAsset ? `https://cdn.discordapp.com/assets/collectibles/${liveNameplateAsset}asset.webm` : null)
    : profile?.nameplateVideoURL;
  const dynamicNameStyle: CSSProperties = {
    fontFamily: DISPLAY_NAME_FONTS[displayNameStyle?.font_id || 11],
    backgroundImage: `linear-gradient(90deg, ${displayNameColors.join(', ')})`,
  };

  // Load Discord profile effect — uses locally cached APNG files for speed & no CORS
  useEffect(() => {
    const skuId = profile?.profile_effect?.sku_id;
    if (!skuId) return;

    const knownEffects: Record<string, { introSrc: string; loopSrc: string; introDuration: number; loopDuration: number; loopDelay: number }> = {
      '1428438924962959421': {
        introSrc: '/effect_intro.png',
        loopSrc: '/effect_loop.png',
        introDuration: 4167,
        loopDuration: 3167,
        loopDelay: 5167,
      }
    };

    if (knownEffects[skuId]) {
      setProfileEffect(knownEffects[skuId]);
      return;
    }

    fetch(`https://discord.com/api/v10/store/published-listings/skus/${skuId}`)
      .then(r => r.json())
      .then(data => {
        const effects = data?.sku?.tenant_metadata?.collectibles?.item?.effects;
        if (!effects || effects.length < 1) return;
        const intro = effects[0];
        const loop = effects[1] || effects[0];
        setProfileEffect({
          introSrc: intro.src,
          loopSrc: loop.src,
          introDuration: intro.duration,
          loopDuration: loop.duration,
          loopDelay: loop.start || intro.duration,
        });
      })
      .catch(() => { });
  }, [profile?.profile_effect?.sku_id]);

  // Play effect ONCE on entry, then stop. Replays on hover via handleCardHover.
  const playEffect = () => {
    if (!profileEffect || effectPlayingRef.current) return;

    effectPlayingRef.current = true;
    setEffectPhase('intro');
    setShowEffect(true);
    setEffectKey(k => k + 1);
    effectTimerRef.current = setTimeout(() => {
      setEffectPhase('loop');
      setEffectKey(k => k + 1);
      effectTimerRef.current = setTimeout(() => {
        setShowEffect(false);
        effectPlayingRef.current = false;
        effectTimerRef.current = null;
      }, profileEffect.loopDuration);
    }, profileEffect.introDuration);
  };

  useEffect(() => () => {
    if (effectTimerRef.current) clearTimeout(effectTimerRef.current);
  }, []);

  useEffect(() => {
    if (!profileEffect || !entered) return;
    // Small delay so card entry animation finishes first
    const t = setTimeout(playEffect, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileEffect, entered]);

  const handleCardHover = () => {
    if (entered && profileEffect) playEffect();
  };

  // Auto-scale card to always fit viewport height — no scrolling needed
  useEffect(() => {
    if (!entered) return;

    const computeScale = () => {
      const card = cardRef.current;
      if (!card) return;
      const naturalW = card.offsetWidth;
      const effectH = profileEffect ? naturalW * (880 / 450) : 0;
      const naturalH = Math.max(card.scrollHeight, effectH);
      const availH = window.innerHeight - 32;
      const availW = window.innerWidth - 32;
      const scale = Math.min(1, availH / naturalH, availW / naturalW);
      setCardScale(Math.round(scale * 1000) / 1000);
    };

    // Run after content renders
    const t1 = setTimeout(computeScale, 200);
    const t2 = setTimeout(computeScale, 800); // re-run after profile loads
    const observer = new ResizeObserver(computeScale);
    if (cardRef.current) observer.observe(cardRef.current);
    window.addEventListener('resize', computeScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener('resize', computeScale);
    };
  }, [entered, profile, profileEffect]);


  return (
    <main className={`main-container ${entered ? 'is-entered' : ''} ${showDecorations ? 'show-decorations' : ''}`}>
      {bats.map(bat => (
        <div
          key={bat.id}
          className="bat-parallax"
          style={{
            position: 'fixed',
            top: bat.top,
            left: bat.left,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <img
            src="/bat.webp"
            alt="Bat"
            className="bat-float"
            style={{
              width: `min(${bat.size}px, 8vw, 12vh)`,
              opacity: 0.4,
              animationDelay: bat.delay
            }}
          />
        </div>
      ))}

      <div
        className="ambient-glow"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          left: 'calc(50% - 300px)',
          top: 'calc(50% - 300px)'
        }}
      />

      {/* Satoru Background in high quality WebP */}
      <div className="background-overlay" style={{ backgroundImage: `url('/satoru.webp')` }} />

      {pataponArmy.map(p => (
        <img
          key={p.id}
          src={p.isExtra ? `/characters_extra/${p.name}.webp` : `/characters/${p.name}.webp`}
          alt={p.name}
          className={`patapon-character ${p.isBoss ? 'patapon-boss' : ''}`}
          style={{
            position: 'fixed',
            top: p.top,
            left: p.left,
            width: `min(${p.size}px, 5vw, 8vh)`,
            animationDelay: p.delay,
            zIndex: 1,
            willChange: 'transform, opacity'
          }}
          loading="lazy"
          decoding="async"
        />
      ))}

      <div className={`landing-overlay ${entered ? 'exit-animation' : ''}`} onClick={handleEnter}>
        <div className="overlay-content">
          <p className="click-text">click to enter ...</p>
          <div className="glow-effect"></div>
        </div>
      </div>

      {/* Profile card wrapper — scales to fit viewport, effect extends outside */}
      <div
        ref={cardWrapperRef}
        className="profile-card-wrapper"
        style={{ transform: `scale(${cardScale})` }}
        onMouseEnter={handleCardHover}
      >
        {/* Discord Profile Effect — OUTSIDE the card so Satoru's hands show */}
        {showEffect && profileEffect && (
          <div className="profile-effect-overlay" aria-hidden="true">
            <img
              key={effectKey}
              src={effectPhase === 'intro' ? profileEffect.introSrc : profileEffect.loopSrc}
              className="profile-effect-img"
              alt=""
            />
          </div>
        )}

        <div ref={cardRef} className={`profile-card ${entered ? 'entry-animation' : ''}`}>

          {/* Banner with 2048px Resolution */}
          <div className="banner-area">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                className="card-banner"
                alt="Banner"
              />
            ) : (
              <div className="card-banner-fallback" style={{ backgroundColor: profile?.banner_color || '#1a1a1a' }} />
            )}

          </div>

          <div className="avatar-wrapper">
            <div className="avatar-container">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar"
              />
              {avatarDecorationUrl && (
                <img
                  key={avatarDecorationUrl}
                  src={avatarDecorationUrl}
                  alt="Avatar Decoration"
                  className="avatar-decoration"
                />
              )}
              <div className={`status-dot ${status?.discord_status || 'offline'}`} />
            </div>

            {/* Custom Status Speech Bubble */}
            {(customStatus?.state || customStatus?.emoji) && (
              <div className="custom-status-bubble">
                {customStatus.emoji && (
                  <span className="status-emoji">
                    {customStatus.emoji.id ? (
                      <img src={`https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? 'gif' : 'png'}`} className="emoji-img" alt="emoji" />
                    ) : customStatus.emoji.name}
                  </span>
                )}
                {customStatus.state}
              </div>
            )}
          </div>

          {/* Active Discord nameplate, shown independently below the banner */}
          {activeNameplateURL && (
            <div className="profile-nameplate-strip" data-palette={activeNameplatePalette} aria-label="Active Discord nameplate">
              <div className="nameplate-owner">
                <Typewriter
                  text={resolvedDisplayName}
                  className="nameplate-display-name"
                  active={entered}
                  as="span"
                  style={dynamicNameStyle}
                  effectId={displayNameStyle?.effect_id}
                />
              </div>
              <div className="nameplate-art">
                {activeNameplateVideoURL ? (
                  <video
                    key={activeNameplateVideoURL}
                    className="nameplate-video"
                    src={activeNameplateVideoURL}
                    poster={activeNameplateURL}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img className="nameplate-video" src={activeNameplateURL} alt="" />
                )}
              </div>
            </div>
          )}

          <div className="profile-info-header">
            <div className="profile-names">
              {!activeNameplateURL && (
                <Typewriter
                  text={resolvedDisplayName}
                  className="display-name"
                  active={entered}
                  style={dynamicNameStyle}
                  effectId={displayNameStyle?.effect_id}
                />
              )}
              <div className="user-info-row">
                <span className="username-text">@{status?.discord_user?.username || profile?.username || "tiboryeah"}</span>
                <span className="separator">•</span>
                <span className="nickname-text">Tibo</span>

                {/* Dynamic Clan / Guild Badge */}
                {clanData && (
                  <div className="guild-badge" title="Clan Tag">
                    {clanData.badge && (
                      <img
                        src={liveDiscordUser?.primary_guild
                          ? `https://cdn.discordapp.com/clan-badges/${clanData.identity_guild_id}/${clanData.badge}.png`
                          : (profile?.clan?.badgeURL || `https://cdn.discordapp.com/clan-badges/${clanData.identity_guild_id}/${clanData.badge}.png`)}
                        alt="clan-icon"
                        className="guild-icon"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.fallback-skull')) {
                            const skull = document.createElement('span');
                            skull.className = 'fallback-skull';
                            skull.innerText = '💀';
                            skull.style.fontSize = '12px';
                            parent.insertBefore(skull, e.currentTarget);
                          }
                        }}
                      />
                    )}
                    <span>{clanData.tag}</span>
                  </div>
                )}
              </div>

              {/* Dynamic Real Badges from Discord API */}
              {profile?.badges && profile.badges.length > 0 && (
                <div className="badges-container-row">
                  {profile.badges.map(badge => (
                    <div key={badge.id} className="badge-item" title={badge.description}>
                      <img src={badge.icon} alt={badge.description} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Discord Bio */}
          {profile?.bio && (
            <div className="profile-bio">
              <DiscordBio bio={profile.bio} />
            </div>
          )}

          {/* Connected Accounts from Discord Profile */}
          {profile?.connected_accounts && profile.connected_accounts.length > 0 && (
            <div className="connected-accounts-bar">
              {profile.connected_accounts.map((conn, idx) => (
                <div
                  key={idx}
                  className="connected-account-chip"
                  data-service={conn.type.toLowerCase()}
                  title={`Cuenta vinculada: ${conn.type} (${conn.name})`}
                >
                  <span className="account-service">{conn.type}</span>
                  <span className="account-name">{conn.name}</span>
                  {conn.verified && <CheckCircle2 className="account-verified" size={12} />}
                </div>
              ))}
            </div>
          )}

          {/* Riot ID Badge */}
          <div className="status-badge riot-id">
            <div className="riot-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
            <span className="badge-label">RIOT ID:</span>
            <span className="badge-value">ＴＲＬ Ｔｉｂｏｒｙ#Vayne</span>
          </div>

          {/* Live Spotify / Game Presence Widget */}
          <div className="discord-widget">
            <div className="activity-info">
              {currentTrack.isSpotify ? (
                <>
                  {currentTrack.albumArt ? (
                    <img src={currentTrack.albumArt} className="activity-img" alt={currentTrack.song} />
                  ) : (
                    <div className="activity-icon-placeholder" style={{ background: 'rgba(29, 185, 84, 0.15)', color: '#1DB954' }}>
                      <Disc3 size={28} className={entered && !muted ? "animate-spin-slow" : ""} />
                    </div>
                  )}
                  <div className="activity-text">
                    <p className="activity-title">
                      Escuchando Spotify {status?.listening_to_spotify ? (
                        <span className="sync-tag">Live Sync</span>
                      ) : (
                        <span className="sync-tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>Pausado</span>
                      )}
                    </p>
                    <p className="activity-name">{currentTrack.song}</p>
                    <p className="activity-detail">{currentTrack.artist}</p>
                    <div className="spotify-progress-bar">
                      <span className="spotify-time">{audioTimeText.current}</span>
                      <div className="spotify-track-bar">
                        <div className="spotify-track-fill" style={{ width: `${Math.max(5, audioProgress)}%` }}></div>
                      </div>
                      <span className="spotify-time">{audioTimeText.duration}</span>
                    </div>
                    {currentTrack.trackId && (
                      <a
                        href={`https://open.spotify.com/track/${currentTrack.trackId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spotify-link-btn"
                      >
                        Escuchar en Spotify <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </>
              ) : status?.activities?.find(a => a.type !== 4) ? (() => {
                const game = status.activities.find(a => a.type !== 4)!;
                return (
                  <>
                    {game.assets?.large_image ? (
                      <img
                        src={game.assets.large_image.startsWith('mp:') ? game.assets.large_image.replace('mp:', 'https://media.discordapp.net/') : `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`}
                        className="activity-img"
                        alt="Game"
                      />
                    ) : (
                      <div className="activity-icon-placeholder"><Gamepad2 size={24} /></div>
                    )}
                    <div className="activity-text">
                      <p className="activity-title">Jugando</p>
                      <p className="activity-name">{game.name}</p>
                      {game.details && <p className="activity-detail">{game.details}</p>}
                      {game.state && <p className="activity-detail">{game.state}</p>}
                    </div>
                  </>
                );
              })() : (
                <>
                  <div className="activity-icon-placeholder" style={{ background: 'rgba(29, 185, 84, 0.15)', color: '#1DB954' }}>
                    <Disc3 size={28} className={entered && !muted ? "animate-spin-slow" : ""} />
                  </div>
                  <div className="activity-text">
                    <p className="activity-title">Reproductor de Música <span className="sync-tag" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>Tema de Fondo</span></p>
                    <p className="activity-name">Everlong</p>
                    <p className="activity-detail">Foo Fighters</p>
                    <div className="spotify-progress-bar">
                      <span className="spotify-time">{audioTimeText.current}</span>
                      <div className="spotify-track-bar">
                        <div className="spotify-track-fill" style={{ width: `${Math.max(5, audioProgress)}%` }}></div>
                      </div>
                      <span className="spotify-time">{audioTimeText.duration}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Discord Server Invitations */}
          <div className="server-invites">
            <div className="server-card">
              <div className="server-info">
                <img
                  src="https://cdn.discordapp.com/icons/1269057940241907714/a_b4f51ac71594459aaf05d5ca08149e83.gif?size=64"
                  className="server-icon"
                  alt="Community Icon"
                />
                <div className="server-text">
                  <p className="server-label">Comunidad</p>
                  <p className="server-name">⚝ 𝒯𝒽𝑒 𝑅𝒾𝓈𝒾𝓃𝑔 𝐿𝑒𝑔𝑒𝓃𝒹 ... ⚚</p>
                </div>
              </div>
              <a href="https://discord.gg/RXAWpGVyUG" target="_blank" rel="noopener noreferrer" className="join-btn">Join</a>
            </div>

            <div className="server-card nsfw-server">
              <div className="server-info">
                <img
                  src="https://cdn.discordapp.com/icons/1462990622855008415/89b18b2c8abb216d7889844e83b833fe.webp?size=64"
                  className="server-icon"
                  alt="NSFW Icon"
                />
                <div className="server-text">
                  <p className="server-label">NSFW Game</p>
                  <p className="server-name">Kokoro: 3 Souls</p>
                </div>
              </div>
              <a href="https://discord.gg/xXHknDwVb6" target="_blank" rel="noopener noreferrer" className="join-btn">Join</a>
            </div>
          </div>

          <div className="links-grid">
            <a title="Instagram" href="https://www.instagram.com/tiboryeah/" target="_blank" rel="noopener noreferrer" className="social-link"><Instagram /></a>
            <a title="Twitch" href="https://www.twitch.tv/tiboryeah" target="_blank" rel="noopener noreferrer" className="social-link"><Twitch /></a>
            <a title="Github" href="https://github.com/Tiboryeah" target="_blank" rel="noopener noreferrer" className="social-link"><Github /></a>
            <a title="Spotify" href="https://open.spotify.com/user/xq8d18vl2powesh433wwh17hu?si=71884595247c4314" target="_blank" rel="noopener noreferrer" className="social-link"><Music /></a>
            <a title="CV" aria-label="Ver mi CV" href="https://tiboryeah.github.io/CV_Tibo-/" target="_blank" rel="noopener noreferrer" className="social-link"><FileText /></a>
            <a title="NSFW Site" href="https://tiboryeah.github.io/kokoro-3-souls/" target="_blank" rel="noopener noreferrer" className="social-link nsfw-tag"><Globe /></a>
          </div>
          <p className="creator-watermark">Created by tiboryeah</p>
        </div>
      </div>
      {/* end links-grid, profile-card, profile-card-wrapper */}

      <div className="absolute -bottom-4 -left-4 w-24 h-24 z-10 animate-float opacity-80 hover:opacity-100 transition-opacity cursor-pointer group" onClick={handleOpenMinigame}>
        <img
          src="/tatepon.webp"
          alt="Tatepon"
          className="tatepon-corner"
          style={{ cursor: 'pointer' }}
        />
      </div>

      {showMinigame && <PataponMinigame onClose={() => setShowMinigame(false)} />}

      <div className="views-counter">
        <Eye size={14} />
        <span>{views}</span>
      </div>

      <div
        className={`volume-control-wrapper ${isVolumeOpen ? 'expanded' : ''}`}
        onMouseEnter={() => setIsVolumeOpen(true)}
        onMouseLeave={() => setIsVolumeOpen(false)}
      >
        <button
          type="button"
          aria-label={muted || volume === 0 ? "Activar sonido" : "Silenciar sonido"}
          aria-pressed={muted || volume === 0}
          className="volume-icon-btn"
          onClick={(e) => {
            if (!isVolumeOpen && typeof window !== 'undefined' && window.innerWidth <= 768) {
              setIsVolumeOpen(true);
            } else {
              toggleMute(e);
            }
          }}
          onTouchStart={(e) => {
            if (!isVolumeOpen) {
              e.preventDefault();
              setIsVolumeOpen(true);
            }
          }}
        >
          {muted || volume === 0 ? <VolumeX className="volume-icon" /> : <Volume2 className="volume-icon" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          aria-label="Volumen"
          style={{ background: `linear-gradient(90deg, #c084fc 0%, #e9d5ff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,.13) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,.13) 100%)` }}
          onTouchStart={(e) => e.stopPropagation()}
        />
      </div>

      <audio
        ref={audioRef}
        src={bgAudioSrc || undefined}
        loop
        muted={muted}
      />
    </main>
  );
}
