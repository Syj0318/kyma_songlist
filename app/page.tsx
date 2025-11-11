"use client";
import { useMemo, useState, useEffect, useRef } from "react";

const typeColors: Record<string, { bg: string; text: string; selectedBg: string; selectedText: string }> = {
  'POP': { bg: 'bg-sky-100', text: 'text-sky-800', selectedBg: 'bg-sky-800', selectedText: 'text-sky-200' },
  'R&B': { bg: 'bg-purple-100', text: 'text-purple-800', selectedBg: 'bg-purple-800', selectedText: 'text-purple-200' },
  'KPOP': { bg: 'bg-pink-100', text: 'text-pink-800', selectedBg: 'bg-pink-800', selectedText: 'text-pink-200' },
  '발라드': { bg: 'bg-gray-100', text: 'text-gray-800', selectedBg: 'bg-gray-800', selectedText: 'text-gray-200' },
  '뮤지컬': { bg: 'bg-teal-100', text: 'text-teal-800', selectedBg: 'bg-teal-800', selectedText: 'text-teal-200' },
  'JPOP': { bg: 'bg-orange-100', text: 'text-orange-800', selectedBg: 'bg-orange-800', selectedText: 'text-orange-200' },
  'OST': { bg: 'bg-indigo-100', text: 'text-indigo-800', selectedBg: 'bg-indigo-800', selectedText: 'text-indigo-200' }
};

const tagColors: Record<string, { bg: string; text: string; selectedBg: string; selectedText: string }> = {
  숙제곡: { bg: 'bg-blue-100', text: 'text-blue-800', selectedBg: 'bg-blue-800', selectedText: 'text-blue-200' },
  경연곡: { bg: 'bg-yellow-100', text: 'text-yellow-800', selectedBg: 'bg-yellow-800', selectedText: 'text-yellow-200' },
};

interface Song {
  id: string;
  title: string;
  artist: string;
  type: string[];
  tag: string[];
}

export default function SongListPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("title");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // visible count (사용자가 왼쪽에 미리 보이는 가수 개수 지정)
  const [visibleArtistCount, setVisibleArtistCount] = useState<number>(15);

  // modal
  const [showArtistModal, setShowArtistModal] = useState(false);

  useEffect(() => {
    fetch("/data/song.json")
      .then((res) => res.json())
      .then((data: Song[]) => setSongs(data))
      .catch((err) => {
        console.error("Failed to load songs.json:", err);
        setSongs([]);
      });
  }, []);

  // 타입, 태그 집계
  const allTypes = useMemo(() => {
    const typeCount: Record<string, number> = {};
    songs.forEach((s) => s.type.forEach((t) => (typeCount[t] = (typeCount[t] || 0) + 1)));
    return Object.entries(typeCount).sort(([a], [b]) => a.localeCompare(b));
  }, [songs]);

  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    songs.forEach((s) => s.tag.forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)));
    return Object.entries(tagCount).sort(([, aC], [, bC]) => bC - aC || 0);
  }, [songs]);

  // 가수 집계: 기본은 곡 많은 순, 하지만 selectedArtist가 있고 그 가수가 현재 보이는 범위(visibleArtistCount) 밖이면 맨 위로 올림
  const allArtists = useMemo(() => {
    const artistCount: Record<string, number> = {};
    songs.forEach((s) => {
      artistCount[s.artist] = (artistCount[s.artist] || 0) + 1;
    });

    let sorted = Object.entries(artistCount)
      .sort(([, aC], [, bC]) => bC - aC || 0);

    // 선택된 가수가 있고, 그 가수가 현재 보이는 범위 안에 없다면 맨 위로 올린다.
    if (selectedArtist) {
      const visibleSlice = sorted.slice(0, visibleArtistCount).map(([a]) => a);
      if (!visibleSlice.includes(selectedArtist)) {
        const selectedEntry = sorted.find(([a]) => a === selectedArtist);
        if (selectedEntry) {
          sorted = [selectedEntry, ...sorted.filter(([a]) => a !== selectedArtist)];
        }
      }
    }
    return sorted;
  }, [songs, selectedArtist, visibleArtistCount]);

  // 필터링된 노래
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs
      .filter((song) => {
        const matchesQuery = song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q);
        const matchesType = selectedType ? song.type.includes(selectedType) : true;
        const matchesArtist = selectedArtist ? song.artist === selectedArtist : true;
        const matchesTag = selectedTag ? song.tag.includes(selectedTag) : true;
        return matchesQuery && matchesType && matchesArtist && matchesTag;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "artist") return a.artist.localeCompare(b.artist);
        return 0;
      });
  }, [songs, query, selectedType, selectedArtist, selectedTag, sort]);

  // 화면에 보이는 가수 목록 (왼쪽 필터에 렌더할 것)
  const visibleArtists = allArtists.slice(0, Math.max(1, Math.min(50, visibleArtistCount))); // 안전범위 1~50

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide text-black flex items-center justify-center">
            <div 
              className="relative w-full max-w-[800px] min-w-[400px] h-[220px]"
            >
              <img 
                src="/kyma111.png" 
                alt="음악 아이콘" 
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </h1>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* LEFT: filters */}
          <aside className="md:w-1/3 bg-white rounded-2xl shadow-sm p-4 h-fit">
            {/* 장르 */}
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">🎵 장르</h2>
              <div className="flex flex-wrap gap-2">
                {allTypes.map(([t, count]) => (
                  <button
                    key={t}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition
                      ${selectedType === t ? `${typeColors[t].selectedBg} ${typeColors[t].selectedText}` : `${typeColors[t].bg} ${typeColors[t].text}`}`}
                    onClick={() => setSelectedType(selectedType === t ? null : t)}
                  >
                    {t} <span className={`${selectedType === t ? `text-slate-200` : `text-slate-800`}`}>• {count}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 가수 (visible count 조절 UI 포함) */}
            <section className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-700">🎤 가수</h2>

                {/* 보이는 가수 수 조절 */}
                {/* <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">보이는 수</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={visibleArtistCount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || "5", 10);
                      if (!Number.isNaN(v)) setVisibleArtistCount(Math.max(1, Math.min(50, v)));
                    }}
                    className="w-14 text-sm border rounded px-2 py-1"
                    aria-label="보이는 가수 수"
                  />
                </div> */}
              </div>

              <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto">
                {visibleArtists.map(([a, count]) => (
                  <button
                    key={a}
                    className={`text-xs px-3 py-1 border border-slate-300 rounded-lg font-medium transition ${selectedArtist === a ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    onClick={() => setSelectedArtist(selectedArtist === a ? null : a)}
                  >
                    {a} <span className={`${selectedArtist === a ? `text-slate-200` : `text-slate-800`}`}>• {count}</span>
                  </button>
                ))}
              </div>

              <div className="text-right mt-2">
                <button
                  onClick={() => setShowArtistModal(true)}
                  className="mt-2 w-full rounded-lg bg-white text-slate-600 font-medium py-2 hover:bg-slate-100 text-sm transition-all duration-200 hover:shadow-md"
                >
                  전체보기 (+{allArtists.length-15})
                </button>
              </div>
            </section>

            {/* 태그 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">🏷️ 태그</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map(([t, count]) => (
                  <button
                    key={t}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition
                      ${selectedTag === t ? `${tagColors[t].selectedBg} ${tagColors[t].selectedText}` : `${tagColors[t].bg} ${tagColors[t].text}`}`}
                    onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  >
                    {t} <span className={`${selectedTag === t ? `text-slate-200` : `text-slate-800`}`}>• {count}</span>
                  </button>
                ))}
              </div>
            </section>

            <p className="text-sm md:text-base text-gray-600 mt-6">노래책 내 곡 완곡 300개입니다.</p>
          </aside>

          {/* RIGHT: search + list */}
          <section className="flex-1 bg-white rounded-2xl shadow-sm p-4">
            <div className="bg-white p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-sm text-slate-600">
                총 <span className="font-semibold">{songs.length}</span>곡 중 <span className="font-semibold">{filtered.length}</span>곡
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <input
                  className="flex-1 min-w-[155px] h-12 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 text-center"
                  placeholder="제목 또는 가수 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  className="w-25 h-12 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="title">제목순</option>
                  <option value="artist">가수순</option>
                </select>
              </div>
            </div>

            <ul className="grid gap-3 max-h-[500px] overflow-y-auto">
              {filtered.length === 0 && <li className="text-center text-slate-500 py-8">검색 결과가 없습니다.</li>}
              {filtered.map((song) => (
                <li key={song.id} className="flex-1 min-w-0 bg-white p-4 rounded-xl shadow-sm border border-slate-300 flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-black truncate">{song.title}</div>
                    <div className="text-sm text-slate-600">{song.artist}</div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 ml-4 flex-shrink-0 max-w-[30%]">
                    {song.type?.map((t, i) => (
                      <span key={`type-${i}`} className={`text-xs px-2 py-1 rounded-lg border ${typeColors[t].bg|| "bg-slate-100"} ${typeColors[t].text|| "text-slate-700"}`}>{t}</span>
                    ))}
                    {song.tag.map((t, i) => (
                      <span key={`tag-${i}`} className={`text-xs px-2 py-1 rounded-lg border ${tagColors[t].bg|| "bg-slate-100"} ${tagColors[t].text|| "text-slate-700"}`}>{t}</span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* 전체보기 모달 (가수) */}
      {showArtistModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-[90%] max-h-[80vh] border border-slate-200 relative flex flex-col">
            {/* 닫기 */}
            <button className="absolute top-3 right-4 text-2xl text-slate-500 hover:text-slate-800 font-bold" onClick={() => setShowArtistModal(false)} aria-label="닫기">×</button>

            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">전체 가수 목록</h3>

            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-2 pb-2">
                {allArtists.map(([artist, count]) => (
                  <button
                    key={artist}
                    className={`text-xs px-3 py-1 border border-slate-300 rounded-lg font-medium transition ${selectedArtist === artist ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                    onClick={() => {
                      // 팝업에서 클릭: selected 설정 + 팝업 닫기
                      // allArtists useMemo에서 selectedArtist 및 visibleArtistCount 참고하여,
                      // 보이는 범위 밖이면 자동으로 맨 위로 이동 처리된다.
                      setSelectedArtist(artist);
                      setShowArtistModal(false);
                    }}
                  >
                    {artist} <span className="text-slate-500">• {count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-slate-500">
        <p>2025 키마 노래책 |{' '}
          <a href="https://docs.google.com/spreadsheets/d/1PynKSvYhNF_5QaGxKA1L62e4dW44TppwDl-DipuG1_U/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
            구글 시트 링크
          </a>
        </p>
      </footer>
    </main>
  );
}
