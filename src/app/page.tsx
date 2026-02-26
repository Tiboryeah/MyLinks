"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
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
  const status = useDiscordStatus(discordId);

  // Generate random positions for multiple bats ONLY on the left side
  const bats = useMemo(() => [
    { id: 1, top: '10%', left: '5%', size: 130, speed: 0.06, delay: '0s' },
    { id: 2, top: '20%', left: '15%', size: 90, speed: 0.04, delay: '1.2s' },
    { id: 3, top: '40%', left: '8%', size: 110, speed: 0.05, delay: '2.5s' },
    { id: 4, top: '60%', left: '20%', size: 70, speed: 0.03, delay: '0.8s' },
    { id: 5, top: '75%', left: '4%', size: 100, speed: 0.07, delay: '3.1s' },
    { id: 6, top: '85%', left: '18%', size: 85, speed: 0.04, delay: '1.5s' },
  ], []);

  // Parallax Effect
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

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
    }
  }, []);

  // Initial View Counter Fetch
  useEffect(() => {
    const getInitialViews = async () => {
      try {
        // We use the count endpoint to see current total
        const response = await fetch('https://api.counterapi.dev/v1/tiboryeah-mylink/views');
        const data = await response.json();
        // If data.count exists, use it. If not (meaning first time ever), set to 0.
        if (data && typeof data.count === 'number') {
          setViews(data.count);
        } else {
          setViews(0);
        }
      } catch (error) {
        console.error("Error fetching views:", error);
        setViews(0); // Fallback to 0 if API fails
      }
    };

    getInitialViews();
  }, []);

  const handleEnter = async () => {
    setEntered(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }

    // Increment views only when the user clicks "enter"
    try {
      const response = await fetch('https://api.counterapi.dev/v1/tiboryeah-mylink/views/up');
      const data = await response.json();
      if (data && typeof data.count === 'number') {
        setViews(data.count);
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
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
      {/* Multiple Parallax Bats */}
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
