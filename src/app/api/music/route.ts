import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // 1. Try Deezer
    try {
        const deezerRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 3600 }
        });
        if (deezerRes.ok) {
            const deezerData = await deezerRes.json();
            if (deezerData.data && deezerData.data.length > 0) {
                const withPreview = deezerData.data.find((t: any) => Boolean(t.preview)) || deezerData.data[0];
                if (withPreview && withPreview.preview) {
                    return NextResponse.json({
                        source: 'deezer',
                        preview: withPreview.preview,
                        title: withPreview.title,
                        artist: withPreview.artist?.name,
                        album_art: withPreview.album?.cover_medium,
                        data: deezerData.data
                    });
                }
            }
        }
    } catch (e) {
        console.error('Deezer search error:', e);
    }

    // 2. Fallback to iTunes Search API
    try {
        const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=5`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            next: { revalidate: 3600 }
        });
        if (itunesRes.ok) {
            const itunesData = await itunesRes.json();
            if (itunesData.results && itunesData.results.length > 0) {
                const track = itunesData.results.find((t: any) => Boolean(t.previewUrl)) || itunesData.results[0];
                if (track && track.previewUrl) {
                    return NextResponse.json({
                        source: 'itunes',
                        preview: track.previewUrl,
                        title: track.trackName,
                        artist: track.artistName,
                        album_art: track.artworkUrl100,
                        data: [{
                            preview: track.previewUrl,
                            title: track.trackName,
                            artist: { name: track.artistName }
                        }]
                    });
                }
            }
        }
    } catch (e) {
        console.error('iTunes search error:', e);
    }

    return NextResponse.json({ error: 'No preview found' }, { status: 404 });
}
