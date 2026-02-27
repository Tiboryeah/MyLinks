"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
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
  Info
} from 'lucide-react';

// Typewriter Component
const Typewriter = ({ text, className, as: Tag = "h1" }: { text: string; className?: string; as?: any }) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const period = 2000;
  const [delta, setDelta] = useState(200);

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => { clearInterval(ticker) };
  }, [displayText, delta])

  const tick = () => {
    let fullText = text;
    let updatedText = isDeleting ? fullText.substring(0, displayText.length - 1) : fullText.substring(0, displayText.length + 1);

    setDisplayText(updatedText);

    if (isDeleting) {
      setDelta(100);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setDelta(period);
    } else if (isDeleting && updatedText === "") {
      setIsDeleting(false);
      setDelta(200);
    }
  };

  return <Tag className={className}>{displayText}</Tag>;
}

// Steam Icon Component
const SteamIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0a12 12 0 0 0-11.94 10.74l4.2 1.73a3.56 3.56 0 0 1 3.25-.43l2.84-4.14a3.57 3.57 0 1 1 2.37.1l-2.8 4.1a3.56 3.56 0 0 1-1.34 3.73l-.04.03a3.56 3.56 0 1 1-6.17-1.16l-4.32-1.78A12 12 0 1 0 12 0zM7.5 15.63a2.07 2.07 0 1 0 0-4.14 2.07 2.07 0 0 0 0 4.14zM16.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
  </svg>
);

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [views, setViews] = useState<number | string>("...");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const discordId = "952780497761730560";
  const { status, profile } = useDiscordData(discordId);

  const bats = useMemo(() => [
    { id: 1, top: '10%', left: '5%', size: 130, speed: 0.06, delay: '0s' },
    { id: 2, top: '20%', left: '15%', size: 90, speed: 0.04, delay: '1.2s' },
    { id: 3, top: '40%', left: '8%', size: 110, speed: 0.05, delay: '2.5s' },
    { id: 4, top: '60%', left: '20%', size: 70, speed: 0.03, delay: '0.8s' },
    { id: 5, top: '75%', left: '4%', size: 100, speed: 0.07, delay: '3.1s' },
    { id: 6, top: '85%', left: '18%', size: 85, speed: 0.04, delay: '1.5s' },
  ], []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.25;
  }, []);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch('/api/views');
        const data = await res.json();
        setViews(data.count ?? 0);
      } catch { setViews(0); }
    };
    fetchViews();
  }, []);

  const handleEnter = async () => {
    setEntered(true);
    if (audioRef.current) audioRef.current.play().catch(() => { });
    try {
      const res = await fetch('/api/views?increment=true');
      const data = await res.json();
      setViews(data.count ?? 0);
    } catch { }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
    if (audioRef.current) audioRef.current.muted = !muted;
  };

  const customStatus = status?.activities?.find(a => a.type === 4);

  return (
    <main className="main-container">
      {bats.map(bat => (
        <img
          key={bat.id}
          src="/bat.webp"
          alt="Bat"
          className="bat-parallax bat-float"
          style={{
            top: bat.top,
            left: bat.left,
            width: `${bat.size}px`,
            opacity: 0.4,
            zIndex: 1,
            animationDelay: bat.delay,
            transform: `translate(${mousePos.x * bat.speed}px, ${mousePos.y * bat.speed}px)`
          }}
        />
      ))}

      <div className="background-overlay" style={{ backgroundImage: `url('/background.png')` }} />

      <div className={`landing-overlay ${entered ? 'hidden' : ''}`} onClick={handleEnter}>
        <p className="click-text">click to enter ...</p>
      </div>

      <div className={`profile-card ${entered ? 'visible' : ''}`}>

        {/* Banner with DCDN source */}
        <div className="banner-area">
          {profile?.user?.banner ? (
            <img
              src={`https://cdn.discordapp.com/banners/${discordId}/${profile.user.banner}.png?size=600`}
              className="card-banner"
              alt="Banner"
            />
          ) : (
            <div className="card-banner-fallback" style={{ backgroundColor: profile?.user?.banner_color || '#1a1a1a' }} />
          )}
        </div>

        <div className="avatar-wrapper">
          <div className="avatar-container">
            <img
              src={status?.discord_user ? `https://cdn.discordapp.com/avatars/${status.discord_user.id}/${status.discord_user.avatar}.png?size=256` : "https://github.com/Tiboryeah.png"}
              alt="Avatar"
              className="avatar"
            />
            <div className={`status-dot ${status?.discord_status || 'offline'}`} />
          </div>

          {customStatus?.state && (
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

        <div className="profile-info-header">
          <div className="profile-names">
            <Typewriter text={profile?.user?.global_name || "Satoru Gojo"} className="display-name" />
            <div className="user-info-row">
              <span className="username-text">tiboryeah</span>
              <span className="separator">•</span>
              <span className="nickname-text">Tibo</span>

              {/* Dynamic Guild Badge from Lanyard */}
              {status?.discord_user?.primary_guild && (
                <div className="guild-badge" title="Primary Server">
                  <img
                    src={`https://cdn.discordapp.com/icons/${status.discord_user.primary_guild.identity_guild_id}/${status.discord_user.primary_guild.badge}.png`}
                    alt="guild-icon"
                    className="guild-icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span>{status.discord_user.primary_guild.tag}</span>
                </div>
              )}

              {/* Discord Badges */}
              {profile?.badges && profile.badges.length > 0 && (
                <div className="badges-inline">
                  {profile.badges.map(badge => (
                    <div key={badge.id} className="badge-item" title={badge.description}>
                      <img src={`https://cdn.discordapp.com/badge-icons/${badge.icon}.png`} alt={badge.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discord Bio */}
        {profile?.user?.bio && (
          <div className="profile-bio">
            <p>
              {profile.user.bio
                .split('\n')
                .filter(line => !line.includes('vercel.app'))
                .join('\n')
                .trim()}
            </p>
          </div>
        )}

        <div className="status-badge riot-id">
          <div className="riot-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <span className="badge-label">Riot ID:</span>
          <span className="badge-value">Ｔｉｂｏｒｙ#Vayne</span>
        </div>

        {/* Presence Widget */}
        {status ? (
          <div className="discord-widget">
            <div className="activity-info">
              {status.listening_to_spotify && status.spotify ? (
                <>
                  <img src={status.spotify.album_art_url} className="activity-img" alt="Spotify" />
                  <div className="activity-text">
                    <p className="activity-title">Listening to Spotify</p>
                    <p className="activity-name">{status.spotify.song}</p>
                    <p className="activity-detail">by {status.spotify.artist}</p>
                  </div>
                </>
              ) : status.activities.find(a => a.type !== 4) ? (() => {
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
                      <p className="activity-title">Playing A Game</p>
                      <p className="activity-name">{game.name}</p>
                      {game.details && <p className="activity-detail">{game.details}</p>}
                      {game.state && <p className="activity-detail">{game.state}</p>}
                    </div>
                  </>
                );
              })() : (
                <div className="activity-text empty">
                  <p>No activity detected...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="discord-widget">
            <div className="activity-text empty">
              <p>Fetching presence data...</p>
            </div>
          </div>
        )}

        <div className="links-grid">
          <a title="Instagram" href="https://www.instagram.com/tiboryeah/" target="_blank" rel="noopener noreferrer" className="social-link"><Instagram /></a>
          <a title="Twitch" href="https://www.twitch.tv/tiboryeah" target="_blank" rel="noopener noreferrer" className="social-link"><Twitch /></a>
          <a title="Github" href="https://github.com/Tiboryeah" target="_blank" rel="noopener noreferrer" className="social-link"><Github /></a>
          <a title="Spotify" href="https://open.spotify.com/user/xq8d18vl2powesh433wwh17hu?si=71884595247c4314" target="_blank" rel="noopener noreferrer" className="social-link"><Music /></a>
          <a title="Steam" href="https://steamcommunity.com/id/tiboryeah/" target="_blank" rel="noopener noreferrer" className="social-link"><SteamIcon /></a>
          <a title="NSFW Site" href="https://tiboryeah.github.io/kokoro-3-souls/" target="_blank" rel="noopener noreferrer" className="social-link nsfw-tag"><Globe /></a>
        </div>
      </div>

      <img src="/tatepon.png" alt="Tatepon" className="tatepon-corner" />

      <div className="views-counter">
        <Eye size={14} />
        <span>{views}</span>
      </div>

      <div style={{ position: 'fixed', top: '24px', left: '24px', cursor: 'pointer', zIndex: 200 }} onClick={toggleMute}>
        {muted ? <VolumeX className="click-text" /> : <Volume2 className="click-text" />}
      </div>

      <audio ref={audioRef} src="/everlong.mp3" loop muted={muted} />
    </main>
  );
}
