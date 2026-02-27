"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sword, Shield, RotateCcw } from 'lucide-react';
import { Howl } from 'howler';

interface PataponMinigameProps {
    onClose: () => void;
}

type Command = "WALK" | "ATTACK" | "DEFEND" | "RETREAT" | null;

const DRUM_MAP: Record<string, { x: string, color: string, keyName: string }> = {
    'A': { x: '0%', color: '#4ade80', keyName: '[A]' },      // PATA
    'D': { x: '33.33%', color: '#f87171', keyName: '[D]' },  // PON
    'S': { x: '66.66%', color: '#38bdf8', keyName: '[S]' },  // DON
    'W': { x: '100%', color: '#eab308', keyName: '[W]' },    // CHAKA
};

const DrumIcon = ({ type, active, size = 60 }: { type: string, active: boolean, size?: number }) => {
    if (!type || !DRUM_MAP[type]) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>;

    return (
        <div
            className={`drum-sprite ${active ? 'active-beat' : ''}`}
            style={{
                width: size,
                height: size,
                backgroundImage: `url('/descarga.png')`,
                backgroundSize: '400% 200%',
                backgroundPosition: `${DRUM_MAP[type].x} 100%`,
                filter: active ? `drop-shadow(0 0 10px ${DRUM_MAP[type].color})` : 'none'
            }}
        />
    );
};

export default function PataponMinigame({ onClose }: PataponMinigameProps) {
    const [inputBuffer, setInputBuffer] = useState<string[]>([]);
    const [combo, setCombo] = useState(0);
    const [dogaeenHp, setDogaeenHp] = useState(100);
    const [tateponHp, setTateponHp] = useState(50);
    const [message, setMessage] = useState("Keep the Rhythm! (Wait for the beat)");

    const [heroX, setHeroX] = useState(20);
    const [dogaeenX, setDogaeenX] = useState(80);

    const [heroState, setHeroState] = useState<"IDLE" | "WALK" | "ATTACK" | "DEFEND" | "HURT" | "RETREAT">("IDLE");
    const [dogaeenState, setDogaeenState] = useState<"IDLE" | "ATTACK" | "HURT">("IDLE");
    const [gameOver, setGameOver] = useState<"WIN" | "LOSE" | null>(null);

    const [isActionPhase, setIsActionPhase] = useState(false);

    const [beatFlash, setBeatFlash] = useState(false);
    const [timerDisplay, setTimerDisplay] = useState("00:00");

    const [hitIcons, setHitIcons] = useState<{ id: number, type: string, x: number, y: number }[]>([]);

    const soundsRef = useRef<Record<string, Howl>>({});
    const bgmRef = useRef<Howl | null>(null);
    const victoryBgmRef = useRef<Howl | null>(null);
    const prevTimeRef = useRef(Date.now());
    const startTimeRef = useRef(Date.now());

    useEffect(() => {
        bgmRef.current = new Howl({ src: ['/patapon-battle.m4a'], loop: true, volume: 0.2 });
        bgmRef.current.play();

        victoryBgmRef.current = new Howl({ src: ['/patapon-victory.m4a'], volume: 0.3 });

        soundsRef.current = {
            W: new Howl({ src: ['/sounds/chaka.mp3'], volume: 1.0 }),
            A: new Howl({ src: ['/sounds/pata.mp3'], volume: 1.0 }),
            S: new Howl({ src: ['/sounds/don.mp3'], volume: 1.0 }),
            D: new Howl({ src: ['/sounds/pon.mp3'], volume: 1.0 })
        };

        startTimeRef.current = Date.now();
        prevTimeRef.current = Date.now();

        return () => {
            bgmRef.current?.unload();
            victoryBgmRef.current?.unload();
            Object.values(soundsRef.current).forEach(h => h.unload());
        };
    }, []);

    useEffect(() => {
        if (gameOver === "WIN") {
            bgmRef.current?.stop();
        }
    }, [gameOver]);

    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - startTimeRef.current;

            const mins = Math.floor(elapsed / 60000).toString().padStart(2, '0');
            const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
            setTimerDisplay(`${mins}:${secs}`);

            if ((elapsed % 500) < 100) {
                setBeatFlash(true);
                setTimeout(() => setBeatFlash(false), 150);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [gameOver]);

    const playSound = (key: string) => {
        if (soundsRef.current[key]) {
            soundsRef.current[key].play();
        }
    };

    const checkCommand = useCallback((buffer: string[]) => {
        const seq = buffer.join("");
        if (seq === "AAAD") return "WALK";
        if (seq === "DDAD") return "ATTACK";
        if (seq === "WWAD") return "DEFEND";
        if (seq === "ADSW") return "RETREAT";
        return null;
    }, []);

    const executeCommand = useCallback((cmd: Command) => {
        if (!cmd) return;

        setIsActionPhase(true);
        setCombo(c => c + 1);

        if (cmd === "WALK") {
            setMessage("PATA PATA PATA PON!");
            setHeroState("WALK");
            setTimeout(() => {
                setHeroX(prev => Math.min(prev + 12, dogaeenX - 10));
            }, 1000);
        }
        else if (cmd === "ATTACK") {
            setMessage("PON PON PATA PON!");
            setHeroState("ATTACK");

            setTimeout(() => {
                if (dogaeenX - heroX <= 30) {
                    setDogaeenState("HURT");
                    setDogaeenHp(prev => {
                        const newHp = Math.max(0, prev - (Math.random() * 8 + 15));
                        if (newHp === 0) setGameOver("WIN");
                        return newHp;
                    });
                    setTimeout(() => setDogaeenState("IDLE"), 500);
                } else {
                    setMessage("Too far! Get closer!");
                }
            }, 1000);
        } else if (cmd === "DEFEND") {
            setMessage("CHAKA CHAKA PATA PON!");
            setHeroState("DEFEND");
        } else if (cmd === "RETREAT") {
            setMessage("PATA PON DON CHAKA!");
            setHeroState("RETREAT");
            setTimeout(() => {
                setHeroX(prev => Math.max(10, prev - 15));
            }, 1000);
        }

        setTimeout(() => {
            setIsActionPhase(false);
            setHeroState("IDLE");
            setMessage("Your turn! Drum to the beat!");
            setInputBuffer([]);
            setHitIcons([]);
            prevTimeRef.current = Date.now();
        }, 2000);
    }, [dogaeenX, heroX]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameOver || isActionPhase) return;

        const key = e.key.toUpperCase();
        if (!["W", "A", "S", "D"].includes(key)) return;

        playSound(key);

        const now = Date.now();
        const delta = now - prevTimeRef.current;

        let newBuffer = [...inputBuffer];

        if (delta > 850) {
            newBuffer = [key];
            setMessage("Listening...");
            setHitIcons([{ id: Date.now(), type: key, x: 0, y: 0 }]);
        } else if (delta >= 200 && delta <= 800) {
            newBuffer.push(key);
            setHitIcons(prev => [...prev, { id: Date.now(), type: key, x: prev.length * 70, y: 0 }]);
        } else {
            setCombo(0);
            setMessage("Miss! Rhythm broken!");
            newBuffer = [];
            setHitIcons([]);

            const bgm = bgmRef.current;
            if (bgm) {
                bgm.volume(0.05);
                setTimeout(() => bgm.volume(0.2), 500);
            }
        }

        prevTimeRef.current = now;
        setInputBuffer(newBuffer);

        if (newBuffer.length === 4) {
            const cmd = checkCommand(newBuffer);
            if (cmd) {
                executeCommand(cmd);
            } else {
                setCombo(0);
                setMessage("Unknown sequence.");
                setTimeout(() => {
                    setInputBuffer([]);
                    setHitIcons([]);
                }, 500);
            }
        }
    }, [gameOver, isActionPhase, inputBuffer, checkCommand, executeCommand]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (gameOver) return;
        const interval = setInterval(() => {
            if (isActionPhase) return;

            if (dogaeenX - heroX <= 35) {
                setDogaeenState("ATTACK");
                setTimeout(() => {
                    setTateponHp(prev => {
                        let dmg = 15;
                        if (heroState === "DEFEND") dmg = 3;
                        if (heroState === "RETREAT") dmg = 0;
                        const newHp = Math.max(0, prev - dmg);
                        if (newHp === 0) setGameOver("LOSE");
                        return newHp;
                    });
                    setHeroState(prev => prev === "DEFEND" ? "DEFEND" : "HURT");
                    setTimeout(() => {
                        setDogaeenState("IDLE");
                        setHeroState(prev => prev === "HURT" ? "IDLE" : prev);
                    }, 500);
                }, 800);
            } else {
                setDogaeenX(prev => Math.max(prev - 4, heroX + 15));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [gameOver, dogaeenX, heroX, isActionPhase, heroState]);

    const handleRestart = () => {
        victoryBgmRef.current?.stop();
        bgmRef.current?.stop();
        bgmRef.current?.play();

        setCombo(0);
        setDogaeenHp(100);
        setTateponHp(50);
        setHeroX(20);
        setDogaeenX(80);
        setGameOver(null);
        setHeroState("IDLE");
        setDogaeenState("IDLE");
        setInputBuffer([]);
        setIsActionPhase(false);
        setHitIcons([]);
        setMessage("Drum to the beat!");
        startTimeRef.current = Date.now();
        prevTimeRef.current = Date.now();
    };

    return (
        <div className={`patapon-minigame-overlay ${beatFlash ? 'beat-flash' : ''}`}>
            <div className={`patapon-minigame-container custom-bg`}>
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                {gameOver === "WIN" && (
                    <div className="game-over-screen win">
                        <img src="/victoria.png" alt="Victory!" className="victory-img" />
                        <p>Mission Complete!</p>
                        <div className="game-over-actions">
                            <button className="restart-btn" onClick={handleRestart}><RotateCcw className="inline-icon" /> Restart</button>
                            <button className="return-btn" onClick={onClose}>Return to Profile</button>
                        </div>
                    </div>
                )}
                {gameOver === "LOSE" && (
                    <div className="game-over-screen lose">
                        <h2>DEFEAT!</h2>
                        <p>The Hero fell...</p>
                        <div className="game-over-actions">
                            <button className="restart-btn" onClick={handleRestart}><RotateCcw className="inline-icon" /> Try Again</button>
                            <button className="return-btn" onClick={onClose}>Return to Profile</button>
                        </div>
                    </div>
                )}

                <div className="game-header">
                    <div className="header-stats">
                        <div className="timer">{timerDisplay}</div>
                        <div className="combo-counter">Combo: {combo}</div>
                    </div>
                </div>

                <div className="battlefield">
                    <div className="ground-line"></div>

                    <div className="battle-messages">
                        <h3 className="message-text" style={{ color: isActionPhase ? '#ffed4a' : 'white' }}>{message}</h3>
                        <div className="hit-icons-container">
                            {hitIcons.map((hit) => (
                                <div key={hit.id} className="hit-icon-wrapper fade-in-out">
                                    <DrumIcon type={hit.type} active={isActionPhase} size={50} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="character-side hatampon-side" style={{ left: `${heroX - 8}%`, position: 'absolute', bottom: '20px', zIndex: 1 }}>
                        <img src="/characters_extra/patapon_18.png" alt="Hatampon" style={{ width: '45px', height: 'auto' }} />
                    </div>

                    <div className="character-side patapon-side" style={{ left: `${heroX}%`, position: 'absolute', bottom: '20px', zIndex: 2 }}>
                        <div className={`health-bar-container`}>
                            <div className="health-bar" style={{ width: `${(tateponHp / 50) * 100}%`, background: '#4ade80' }} />
                        </div>
                        <img
                            src="/hero.webp"
                            alt="Hero"
                            className={`fighter-img hero-${heroState.toLowerCase()}`}
                            style={{ width: '50px', height: 'auto' }}
                        />
                    </div>

                    <div className="character-side dogaeen-side" style={{ left: `${dogaeenX}%`, position: 'absolute', bottom: '20px' }}>
                        <div className={`health-bar-container`}>
                            <div className="health-bar" style={{ width: `${(dogaeenHp / 100) * 100}%`, background: '#ef4444' }} />
                        </div>
                        <img
                            src="/Dogaeen_imagen.webp"
                            alt="Dogaeen"
                            className={`fighter-img dogaeen-${dogaeenState.toLowerCase()}`}
                            style={{ width: '220px', height: 'auto' }}
                        />
                    </div>
                </div>

                <div className="controls-guide">
                    <h4>Sound & Key Legend:</h4>
                    <div className="sound-legend">
                        <div className="legend-item"><DrumIcon type="A" active={false} size={25} /> <span style={{ color: '#4ade80' }}>PATA</span> = Tecla A</div>
                        <div className="legend-item"><DrumIcon type="D" active={false} size={25} /> <span style={{ color: '#f87171' }}>PON</span> = Tecla D</div>
                        <div className="legend-item"><DrumIcon type="S" active={false} size={25} /> <span style={{ color: '#38bdf8' }}>DON</span> = Tecla S</div>
                        <div className="legend-item"><DrumIcon type="W" active={false} size={25} /> <span style={{ color: '#eab308' }}>CHAKA</span> = Tecla W</div>
                    </div>

                    <h4 style={{ marginTop: '10px' }}>Commands:</h4>
                    <div className="commands-sprites">
                        <div className="cmd-item"><span>Walk:</span> A-A-A-D</div>
                        <div className="cmd-item"><span>Attack:</span> D-D-A-D</div>
                        <div className="cmd-item"><span>Defend:</span> W-W-A-D</div>
                        <div className="cmd-item"><span>Retreat:</span> A-D-S-W</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
