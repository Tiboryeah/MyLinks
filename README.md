# Premium MyLinks Page

A high-aesthetic social links page with Discord integration, glassmorphism, and smooth animations.

## Setup

1. **Discord Integration**:
   - Open `src/app/page.tsx`.
   - Replace the `discordId` value on line 23 with your numerical Discord snowflake ID.
   - To get your ID, enable **Developer Mode** in Discord settings, right-click your profile, and select **Copy User ID**.
   - Make sure you are in the [Lanyard Discord Server](https://discord.gg/lanyard) or have enabled the Lanyard bot for your ID to sync.

2. **Background**:
   - Replace `public/background.png` with your desired background image or video.

3. **Music**:
   - Update the `audio` tag `src` in `src/app/page.tsx` to your preferred track.

## Dev & Deployment

```bash
npm install
npm run dev
```

Deploy easily to **Vercel** by connecting your GitHub repository.
