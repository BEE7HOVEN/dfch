import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoGrid from "@/components/VideoGrid";

const CHANNEL_ID = "UCid-t3mDuI574dotclfPQSA";
const CHANNEL_URL = "https://www.youtube.com/@군포드림숲교회";

interface VideoEntry {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
}

async function getVideos(): Promise<VideoEntry[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`,
      {
        next: { revalidate: 3600 },
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; dfch.kr/1.0)",
        },
      }
    );

    if (!res.ok) {
      console.error("YouTube RSS fetch failed:", res.status);
      return [];
    }

    const text = await res.text();
    const videos: VideoEntry[] = [];
    const entries = text.split("<entry>");
    for (let i = 1; i < entries.length && i <= 12; i++) {
      const entry = entries[i];
      const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry.match(/<media:title>([^<]+)<\/media:title>/);
      const pubMatch = entry.match(/<published>([^<]+)<\/published>/);

      if (idMatch) {
        videos.push({
          id: idMatch[1],
          title: titleMatch?.[1] || "",
          published: pubMatch?.[1] || "",
          thumbnail: `https://i.ytimg.com/vi/${idMatch[1]}/hqdefault.jpg`,
        });
      }
    }
    return videos;
  } catch (e) {
    console.error("YouTube RSS error:", e);
    return [];
  }
}

export default async function MediaPage() {
  const videos = await getVideos();

  return (
    <>
      <Header />
      <main>
        <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/hero-7.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-3xl md:text-4xl text-white font-light tracking-wider">
              미디어
            </h1>
          </div>
        </section>

        <section className="py-20 md:py-32 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-[#404040]">
                최근 영상
              </h2>
              <a
                href={CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                  <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
                </svg>
                YouTube 채널
              </a>
            </div>

            <VideoGrid videos={videos} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
