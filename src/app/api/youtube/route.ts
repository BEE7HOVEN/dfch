export const runtime = "edge";

const CHANNEL_ID = "UCid-t3mDuI574dotclfPQSA";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
// 채널의 전체 업로드 재생목록 (채널 ID의 앞 "UC"를 "UU"로 바꾼 것)
const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_ID.slice(2)}`;
// 너무 많이 불러오지 않게 막는 상한 (50개씩 20번 = 1000개)
const MAX_PAGES = 20;

type Video = {
  id: string;
  title: string;
  published: string;
  category: "sunday" | "wednesday" | "live" | null;
  thumbnail: string;
};

// 설교말씀 탭 분류. 재생목록이 갱신되지 않고 있어 영상 제목 규칙으로 나눈다.
// 예: "... l 드림숲교회 주일설교", "9월 30일 수요", "9월 27일 주일예배"
function categorize(title: string): "sunday" | "wednesday" | "live" | null {
  if (title.includes("주일설교")) return "sunday";
  if (title.includes("수요")) return "wednesday";
  if (title.includes("주일예배")) return "live";
  return null;
}

function toVideo(id: string, title: string, published: string): Video {
  return {
    id,
    title,
    published,
    category: categorize(title),
    thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  };
}

// 유튜브 데이터 API로 업로드 영상 전체를 50개씩 넘겨 가며 받는다 (호출 1번에 할당량 1).
async function fetchAllUploads(apiKey: string): Promise<Video[]> {
  const videos: Video[] = [];
  let pageToken = "";
  for (let i = 0; i < MAX_PAGES; i++) {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("playlistId", UPLOADS_PLAYLIST_ID);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
    const data: {
      nextPageToken?: string;
      items: {
        snippet: { title: string };
        contentDetails: { videoId: string; videoPublishedAt?: string };
      }[];
    } = await res.json();

    for (const item of data.items) {
      // 비공개·삭제된 영상은 게시일이 없다.
      if (!item.contentDetails.videoPublishedAt) continue;
      videos.push(toVideo(item.contentDetails.videoId, item.snippet.title, item.contentDetails.videoPublishedAt));
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return videos.sort((a, b) => b.published.localeCompare(a.published));
}

// API 키가 없을 때 쓰는 공개 피드. 최신 15개만 준다.
async function fetchRss(): Promise<Video[]> {
  const res = await fetch(RSS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "application/atom+xml,application/xml,text/xml,application/rss+xml",
    },
  });

  const text = await res.text();
  if (!text || !text.includes("<entry>")) return [];

  return text
    .split("<entry>")
    .slice(1)
    .map((entry) =>
      toVideo(
        entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "",
        entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? "",
        entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "",
      ),
    );
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  try {
    let videos: Video[] = [];
    if (apiKey) {
      try {
        videos = await fetchAllUploads(apiKey);
      } catch (e) {
        console.error(e);
      }
    }
    if (videos.length === 0) videos = await fetchRss();

    return Response.json(videos, {
      headers: {
        "Cache-Control":
          videos.length > 0
            ? "public, s-maxage=3600, stale-while-revalidate=86400"
            : "public, s-maxage=300",
      },
    });
  } catch {
    return Response.json([], { status: 200 });
  }
}
