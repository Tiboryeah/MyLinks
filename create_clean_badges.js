const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processCleanBadges() {
    const outDir = path.join(__dirname, 'public', 'badges');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // 1. Retro PC Monitor: Lilac CRT monitor with screen and stand, 100% transparent background
    const retroPcSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <!-- Monitor Outer Body -->
    <rect x="8" y="8" width="48" height="38" rx="8" fill="#9f7aea" stroke="#c084fc" stroke-width="2"/>
    <!-- Monitor Inner Screen Bezel -->
    <rect x="13" y="13" width="38" height="28" rx="4" fill="#2e1065"/>
    <!-- Screen Glass Glow -->
    <rect x="15" y="15" width="34" height="24" rx="3" fill="#f5f3ff"/>
    <!-- Screen Inner Pixel Grid -->
    <rect x="18" y="18" width="28" height="18" rx="2" fill="#ddd6fe"/>
    <!-- Screen Reflection Highlight -->
    <path d="M16 16 L32 16 L16 32 Z" fill="#ffffff" opacity="0.7"/>
    <!-- Monitor Neck / Stand Base -->
    <path d="M26 46 L22 56 L42 56 L38 46 Z" fill="#7e22ce" stroke="#a855f7" stroke-width="1.5"/>
    <!-- Stand Foot -->
    <rect x="18" y="54" width="28" height="4" rx="2" fill="#6b21a8"/>
  </svg>`;

    // 2. Pixel Sword: Isometric / diagonal pixelated fantasy sword with glowing blade
    const swordSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <!-- Tip & Blade Glow -->
    <path d="M54 10 L44 20 L40 16 L50 6 C52 4 56 4 58 6 C60 8 60 12 54 10 Z" fill="#ffffff" stroke="#e9d5ff" stroke-width="1.5"/>
    <!-- Main Blade Upper -->
    <path d="M44 20 L28 36 L24 32 L40 16 Z" fill="#f3e8ff" stroke="#c084fc" stroke-width="1.5"/>
    <!-- Main Blade Lower -->
    <path d="M28 36 L22 42 L18 38 L24 32 Z" fill="#d8b4fe" stroke="#a855f7" stroke-width="1.5"/>
    <!-- Crossguard / Hilt -->
    <path d="M14 36 L24 46 L20 50 L10 40 Z" fill="#8b5cf6" stroke="#6d28d9" stroke-width="1.5"/>
    <rect x="14" y="42" width="8" height="4" rx="1" transform="rotate(-45 18 44)" fill="#c084fc"/>
    <!-- Grip & Pommel -->
    <path d="M16 48 L10 54 L6 50 L12 44 Z" fill="#6d28d9"/>
    <circle cx="8" cy="56" r="4" fill="#a855f7" stroke="#e9d5ff" stroke-width="1"/>
  </svg>`;

    // 3. Blue Gamepad: Modern ergonomic controller with D-pad, buttons and analog sticks
    const gamepadSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <!-- Controller Body -->
    <path d="M14 16 C8 16 4 21 5 30 L9 48 C10 52 14 55 18 55 C22 55 25 52 27 47 L30 40 L34 40 L37 47 C39 52 42 55 46 55 C50 55 54 52 55 48 L59 30 C60 21 56 16 50 16 L14 16 Z" fill="#2563eb" stroke="#60a5fa" stroke-width="2"/>
    <!-- Grip Texture / Highlights -->
    <path d="M12 28 C12 24 14 20 18 20" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" fill="none"/>
    <!-- D-Pad Left -->
    <rect x="15" y="27" width="6" height="14" rx="1.5" fill="#1e3a8a"/>
    <rect x="11" y="31" width="14" height="6" rx="1.5" fill="#1e3a8a"/>
    <!-- Action Buttons Right (Diamond pattern) -->
    <circle cx="48" cy="28" r="2.5" fill="#93c5fd"/>
    <circle cx="44" cy="32" r="2.5" fill="#93c5fd"/>
    <circle cx="52" cy="32" r="2.5" fill="#93c5fd"/>
    <circle cx="48" cy="36" r="2.5" fill="#93c5fd"/>
    <!-- Thumbsticks -->
    <circle cx="24" cy="38" r="4.5" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1.5"/>
    <circle cx="40" cy="38" r="4.5" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1.5"/>
    <!-- Center Guide Light -->
    <circle cx="32" cy="24" r="2.5" fill="#38bdf8" opacity="0.9"/>
  </svg>`;

    await sharp(Buffer.from(retroPcSvg)).png().toFile(path.join(outDir, 'retro_pc.png'));
    await sharp(Buffer.from(swordSvg)).png().toFile(path.join(outDir, 'rpg_sword.png'));
    await sharp(Buffer.from(gamepadSvg)).png().toFile(path.join(outDir, 'blue_gamepad.png'));

    console.log('Successfully generated 100% transparent HD PNG badges!');
}

processCleanBadges().catch(console.error);
