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
  Info,
  Skull
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
  const [bgAudioSrc, setBgAudioSrc] = useState("/everlong.mp3");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const discordId = "952780497761730560";
  const { status, profile } = useDiscordData(discordId);


  const bats = useMemo(() => [
    { id: 1, top: '8%', left: '10%', size: 130, speed: 0.06, delay: '0s' },
    { id: 2, top: '20%', left: '35%', size: 90, speed: 0.04, delay: '1.2s' },
    { id: 3, top: '38%', left: '17%', size: 110, speed: 0.05, delay: '2.5s' },
    { id: 4, top: '60%', left: '45%', size: 70, speed: 0.03, delay: '0.8s' },
    { id: 5, top: '74%', left: '12%', size: 100, speed: 0.07, delay: '3.1s' },
    { id: 6, top: '85%', left: '18%', size: 85, speed: 0.04, delay: '1.5s' },
    { id: 7, top: '30%', left: '38%', size: 75, speed: 0.05, delay: '2s' },
    { id: 8, top: '5%', left: '40%', size: 85, speed: 0.06, delay: '3.5s' },
    { id: 9, top: '54%', left: '32%', size: 95, speed: 0.04, delay: '1s' },
    { id: 10, top: '92%', left: '40%', size: 105, speed: 0.07, delay: '4s' },
  ], []);

  // Ultra-stable distribution: 5x10 Grid with zero jitter to prevent any overlaps
  const pataponArmy = useMemo(() => {
    const list: any[] = [];

    // 1. Define vertical-heavy grid (5 columns x 10 rows = 50 slots)
    const slots: { t: number; l: number }[] = [];
    const cols = 5;
    const rows = 10;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        slots.push({
          t: 5 + r * 9.5, // 9.5% vertical gap ensures tall flags don't touch
          l: 2 + c * 8.5  // 8.5% horizontal gap for lateral breathing room
        });
      }
    }

    // 2. Exact Bat & Tatepon positions for precise dodging
    const exclusionZones = [
      { t: 8, l: 10, r: 8 },   // Bat 1
      { t: 20, l: 35, r: 7 },  // Bat 2
      { t: 38, l: 17, r: 8 },  // Bat 3
      { t: 60, l: 45, r: 8 },  // Bat 4
      { t: 74, l: 12, r: 8 },  // Bat 5
      { t: 85, l: 18, r: 7 },  // Bat 6
      { t: 30, l: 38, r: 7 },  // New Bat 7
      { t: 5, l: 40, r: 7 },   // New Bat 8
      { t: 54, l: 32, r: 7 },  // New Bat 9
      { t: 92, l: 40, r: 8 },  // New Bat 10
      { t: 90, l: 5, r: 12 },  // Tatepon guard
    ];

    // Filter slots that are too close to bats/elements
    let safeSlots = slots.filter(s => {
      return !exclusionZones.some(z => {
        const dist = Math.sqrt(Math.pow(s.t - z.t, 2) + Math.pow(s.l - z.l, 2));
        return dist < z.r;
      });
    });

    // 3. Sequential assignment to ensure homogeneous spread without gaps
    const validExtra = [2, 3, 4, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    const allValid = [
      ...Array.from({ length: 12 }, (_, i) => ({ id: i + 1, isExtra: false, name: `patapon_${i + 1}`, isBoss: false })),
      ...validExtra.map(id => ({ id: id + 12, isExtra: true, name: `patapon_${id}`, isBoss: id === 26 }))
    ];

    allValid.forEach((unit, idx) => {
      if (idx < safeSlots.length) {
        const slot = safeSlots[idx];
        const scale = 65;

        list.push({
          ...unit,
          top: `${slot.t}%`,
          left: `${slot.l}%`,
          size: scale,
          delay: `${idx * 0.1}s`,
        });
      }
    });

    return list;
  }, []);

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

  // Sync background music with Spotify using Deezer API for previews
  useEffect(() => {
    if (status?.listening_to_spotify && status.spotify) {
      const fetchPreview = async () => {
        try {
          const query = encodeURIComponent(`${status.spotify!.artist} ${status.spotify!.song}`);
          const response = await fetch(`/api/music?q=${query}`);
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const previewUrl = data.data[0].preview;
            if (previewUrl && previewUrl !== bgAudioSrc) {
              setBgAudioSrc(previewUrl);
            }
          }
        } catch (error) {
          console.error("Error fetching music preview:", error);
        }
      };
      fetchPreview();
    } else {
      // Revert to default or keep last if desired. Let's revert to Everlong.
      if (bgAudioSrc !== "/everlong.mp3") {
        setBgAudioSrc("/everlong.mp3");
      }
    }
  }, [status?.spotify?.track_id]);

  useEffect(() => {
    if (audioRef.current && !muted) {
      audioRef.current.play().catch(() => {
        console.log("Autoplay prevented or audio source changed.");
      });
    }
  }, [bgAudioSrc, muted]);

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

      <div
        className="ambient-glow"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          left: 'calc(50% - 300px)',
          top: 'calc(50% - 300px)'
        }}
      />


      <div className="background-overlay" style={{ backgroundImage: `url('/background.png')` }} />

      {pataponArmy.map(p => (
        <img
          key={p.id}
          src={p.isExtra ? `/characters_extra/${p.name}.png` : `/characters/${p.name}.png`}
          alt={p.name}
          className={`patapon-character ${p.isBoss ? 'patapon-boss' : ''}`}
          style={{
            position: 'fixed',
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            animationDelay: p.delay,
            zIndex: 1,
          }}
        />
      ))}

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
                    src={`https://cdn.discordapp.com/clan-badges/${status.discord_user.primary_guild.identity_guild_id}/${status.discord_user.primary_guild.badge}.png`}
                    alt="guild-icon"
                    className="guild-icon"
                    onError={(e) => {
                      // Fallback to a skull if the image fails
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
          <span className="badge-label">RIOT ID:</span>
          <span className="badge-value">ＴＲＬ Ｔｉｂｏｒｙ#Vayne</span>
        </div>

        {/* Presence Widget */}
        {status ? (
          <div className="discord-widget">
            <div className="activity-info">
              {status.listening_to_spotify && status.spotify ? (
                <>
                  <img src={status.spotify.album_art_url} className="activity-img" alt="Spotify" />
                  <div className="activity-text">
                    <p className="activity-title">Listening to Spotify <span className="sync-tag">Synced Audio</span></p>
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
                <p className="server-name">⚝ 𝒯𝒽𝑒 𝑅𝒾𝓈𝒾𝓃𝑔 𝐿𝑒𝑔𝑒𝓃𝒹𝓈 ... ⚚</p>
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

      <audio ref={audioRef} src={bgAudioSrc} loop muted={muted} />
    </main>
  );
}
