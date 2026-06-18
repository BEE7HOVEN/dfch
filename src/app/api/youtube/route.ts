export const runtime = "edge";

const CHANNEL_ID = "UCid-t3mDuI574dotclfPQSA";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export async function GET() {
  try {
    const res = await fetch(RSS_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "application/atom+xml,application/xml,text/xml,application/rss+xml",
      },
    });

    const text = await res.text();

    if (!text || !text.includes("<entry>")) {
      return Response.json([], {
        headers: { "Cache-Control": "public, s-maxage=300" },
      });
    }

    const entries = text.split("<entry>").slice(1);
    const videos = entries.slice(0, 12).map((entry) => {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
      const published =
        entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
      return {
        id,
        title,
        published,
        thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
      };
    });

    return Response.json(videos, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json([], { status: 200 });
  }
}
