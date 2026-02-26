"use client";

import { useState, useEffect, useRef } from 'react';
import { useDiscordStatus } from './useDiscordStatus';
import {
  Instagram,
  Github,
  Twitch,
  Eye,
  Volume2,
  VolumeX,
  Music,
  Gamepad2,
  Globe
} from 'lucide-react';

// Custom Bat Icon (SVG)
const BatIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    width="150"
    height="150"
    fill="currentColor"
    className="bat-parallax bat-float"
    style={style}
  >
    <path d="M12 4.5C10.5 4.5 9 5.5 8 7c-1-1.5-2.5-2.5-4-2.5-1.5 0-3 1-3 3 0 4 5 10 11 12 6-2 11-8 11-12 0-2-1.5-3-3-3-1.5 0-3 1-4 2.5-1-1.5-2.5-2.5-4-2.5z" />
    <path d="M12 2L10.5 5h3L12 2zM4 6c0 0 2 0 4 2s0 4 0 4-4-2-4-6zm16 0c0 0-2 0-4 2s0 4 0 4 4-2 4-6zM2 10s3 1 5 1 5-1 5-1 3 1 5 1 5-1 5-1-2 5-10 7-10-7-10-7z" />
  </svg>
);

// Reverting to the first SVG Steam Icon version
const SteamIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0a12 12 0 0 0-11.94 10.74l4.2 1.73a3.56 3.56 0 0 1 3.25-.43l2.84-4.14a3.57 3.57 0 1 1 2.37.1l-2.8 4.1a3.56 3.56 0 0 1-1.34 3.73l-.04.03a3.56 3.56 0 1 1-6.17-1.16l-4.32-1.78A12 12 0 1 0 12 0zM7.5 15.63a2.07 2.07 0 1 0 0-4.14 2.07 2.07 0 0 0 0 4.14zM16.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
  </svg>
);

// Typewriter Component
const Typewriter = ({ text }: { text: string }) => {
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

  return <h1 className="username">{displayText}</h1>;
}

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [views, setViews] = useState<number | string>("...");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const discordId = "952780497761730560";
  const status = useDiscordStatus(discordId);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 25,
        y: (e.clientY - window.innerHeight / 2) / 25,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
    }
  }, []);

  // Functional View Counter
  useEffect(() => {
    const fetchViews = async () => {
      try {
        // Using CounterAPI (Free & No Key required for simple tracking)
        // Namespace: tiboryeah-mylink, Key: views
        const response = await fetch('https://api.counterapi.dev/v1/tiboryeah-mylink/views/up');
        const data = await response.json();
        if (data.count) {
          setViews(data.count);
        }
      } catch (error) {
        console.error("Error updating views:", error);
        setViews("Error");
      }
    };

    fetchViews();
  }, []);

  const handleEnter = () => {
    setEntered(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(!muted);
    if (audioRef.current) {
      audioRef.current.muted = !muted;
    }
  };

  return (
    <main className="main-container">
      {/* Parallax Bat */}
      <BatIcon style={{
        transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        top: '15%',
        left: '20%'
      }} />

      {/* Background overlay with image */}
      <div
        className="background-overlay"
        style={{ backgroundImage: `url('/background.png')` }}
      />

      {/* Landing Overlay */}
      <div
        className={`landing-overlay ${entered ? 'hidden' : ''}`}
        onClick={handleEnter}
      >
        <p className="click-text">click to enter ...</p>
      </div>

      {/* Profile Card */}
      <div className={`profile-card ${entered ? 'visible' : ''}`}>
        <div className="avatar-container">
          <img
            src={status?.discord_user ? `https://cdn.discordapp.com/avatars/${status.discord_user.id}/${status.discord_user.avatar}.png?size=256` : "https://github.com/Tiboryeah.png"}
            alt="Avatar"
            className="avatar"
          />
        </div>

        <Typewriter text="tiboryeah" />

        <div className="status-badge">
          <Gamepad2 size={14} />
          <span>Ｔｉｂｏｒｙ#Vayne</span>
          <span>•</span>
          <span>Heaven</span>
        </div>

        {/* Discord Presence Widget */}
        {status && (
          <div className="discord-widget">
            <div style={{ position: 'relative' }}>
              <img
                src={`https://cdn.discordapp.com/avatars/${status.discord_user.id}/${status.discord_user.avatar}.png?size=64`}
                alt="Discord Avatar"
                style={{ width: '48px', height: '48px', borderRadius: '12px' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: status.status === 'online' ? '#3ba55c' : status.status === 'dnd' ? '#ed4245' : status.status === 'idle' ? '#faa61a' : '#747f8d',
                border: '3px solid #1a1a1a'
              }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{status.discord_user.username}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                {status.listening_to_spotify ? `Listening to ${status.spotify.song}` : (status.activities?.[0]?.name ? `Playing ${status.activities[0].name}` : "Haciendo cosas cuestionables")}
              </p>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="links-grid">
          <a title="Instagram" href="https://www.instagram.com/tiboryeah/" target="_blank" rel="noopener noreferrer" className="social-link"><Instagram /></a>
          <a title="Twitch" href="https://www.twitch.tv/tiboryeah" target="_blank" rel="noopener noreferrer" className="social-link"><Twitch /></a>
          <a title="Github" href="https://github.com/Tiboryeah" target="_blank" rel="noopener noreferrer" className="social-link"><Github /></a>
          <a title="Spotify" href="https://open.spotify.com/user/xq8d18vl2powesh433wwh17hu?si=71884595247c4314" target="_blank" rel="noopener noreferrer" className="social-link"><Music /></a>
          <a title="Steam" href="https://steamcommunity.com/id/tiboryeah/" target="_blank" rel="noopener noreferrer" className="social-link"><SteamIcon /></a>
          <a title="NSFW Site" href="https://tiboryeah.github.io/kokoro-3-souls/" target="_blank" rel="noopener noreferrer" className="social-link nsfw-tag"><Globe /></a>
        </div>
      </div>

      {/* Tatepon Corner Image */}
      <img src="/tatepon.png" alt="Tatepon" className="tatepon-corner" />

      {/* Real-time Views Counter */}
      <div className="views-counter">
        <Eye size={14} />
        <span>{views}</span>
      </div>

      {/* Audio Controls */}
      <div
        style={{ position: 'fixed', top: '24px', left: '24px', cursor: 'pointer', zIndex: 200 }}
        onClick={toggleMute}
      >
        {muted ? <VolumeX className="click-text" /> : <Volume2 className="click-text" />}
      </div>

      <audio
        ref={audioRef}
        src="/everlong.mp3"
        loop
        muted={muted}
      />
    </main>
  );
}
