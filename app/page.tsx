
"use client";
import { useMemo, useState, useEffect } from 'react';

const typeColors: Record<string, string> = { 
  'POP': 'bg-sky-200 text-sky-800',
  'R&B': 'bg-purple-200 text-purple-800',
  'KPOP': 'bg-pink-200 text-pink-800',
  '발라드': 'bg-gray-200 text-gray-800',
  '뮤지컬': 'bg-teal-200 text-teal-800',
  'JPOP': 'bg-orange-200 text-orange-800',
  'OST': 'bg-indigo-200 text-indigo-800',
};

const tagColors: Record<string, string> = {
  '숙제곡': 'bg-blue-200 text-blue-800',
  '경연곡': 'bg-yellow-200 text-yellow-800',
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
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/song.json')
      .then(res => res.json())
      .then((data: Song[]) => setSongs(data))
      .catch(err => {
        console.error("Failed to load songs.json:", err);
        setSongs([]);
      });
  }, []);


  const allTypes = useMemo(() => {
    const typesSet = new Set<string>();
    songs.forEach(song => song.type.forEach(t => typesSet.add(t)));
    return Array.from(typesSet).sort();
  }, [songs]);

  const allArtists = useMemo(() => {
    const artistCount: Record<string, number> = {};
    songs.forEach(song => {
      artistCount[song.artist] = (artistCount[song.artist] || 0) + 1;
    });
    return Object.entries(artistCount)
      .filter(([_, count]) => count >= 2)
      .map(([artist]) => artist)
      .sort();
  }, [songs]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    songs.forEach(song => song.tag.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [songs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs
      .filter(song => {
        const matchesQuery =
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q);
        const matchesType = selectedType ? song.type.includes(selectedType) : true;
        const matchesArtist = selectedArtist ? song.artist === selectedArtist : true;
        const matchesTag = selectedTag ? song.tag.includes(selectedTag) : true;
        return matchesQuery && matchesType && matchesArtist && matchesTag;
      })
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        if (sort === 'artist') return a.artist.localeCompare(b.artist);
        return 0;
      });
  }, [query, sort, songs, selectedType, selectedArtist, selectedTag]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide text-black flex items-center justify-center">
            {/* 아이콘을 화면 비율로 설정 */}
            <div className="relative" style={{ width: '70vw', height: '25vh' }}>
              <img 
                src="/kyma.png" 
                alt="음악 아이콘" 
                className="absolute inset-0 w-full h-full object-contain" 
              />
            </div>
          </h1>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {/* 왼쪽: 필터 영역 */}
          <aside className="md:w-1/3 bg-white rounded-2xl shadow-sm p-4 h-fit">
            {/* 카테고리 */}
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">🎵 장르</h2>
              <div className="flex flex-wrap gap-2">
                {allTypes.map((t) => (
                  <button
                    key={t}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition
                      ${selectedType === t ? 'ring-2 ring-indigo-400 scale-105' : ''} 
                      ${typeColors[t] || 'bg-slate-100 text-slate-700'}`}
                    onClick={() => setSelectedType(selectedType === t ? null : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            {/* 가수 */}
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">🎤 가수</h2>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                {allArtists.map((a) => (
                  <button
                    key={a}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition
                      ${selectedArtist === a ? 'ring-2 ring-indigo-400 scale-105' : ''} 
                      bg-slate-100 text-slate-700`}
                    onClick={() => setSelectedArtist(selectedArtist === a ? null : a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </section>

            {/* 태그 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-2">🏷️ 태그</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <button
                    key={t}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition
                      ${selectedTag === t ? 'ring-2 ring-pink-400 scale-105' : ''} 
                      ${tagColors[t] || 'bg-slate-100 text-slate-700'}`}
                    onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
            <p className="text-sm md:text-base text-gray-600 mt-6">
              노래책 내 곡 완곡 300개입니다. 
            </p>
            <p  className="text-sm md:text-base text-gray-600">
              제목 뒤 ※ 표기가 붙은 곡은 허위매물입니다.
            </p>

          </aside>

          {/* 오른쪽: 검색 + 정렬 + 리스트 */}
          <section className="flex-1">
            {/* 검색창 & 정렬 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-sm text-slate-600">
                총 <span className="font-semibold">{songs.length}</span>곡 중{" "}
                <span className="font-semibold">{filtered.length}</span>곡
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <input
                  className="flex-[6] h-12 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="제목 또는 가수 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  className="flex-[4] h-12 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="title">제목순</option>
                  <option value="artist">가수순</option>
                </select>
              </div>
            </div>

            {/* 노래 리스트 */}
            <ul className="grid gap-3 max-h-[550px] overflow-y-auto">
              {filtered.length === 0 && (
                <li className="text-center text-slate-500 py-8">검색 결과가 없습니다.</li>
              )}
              {filtered.map((song) => (
                <li
                  key={song.id}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-black mb-1">{song.title}</div>
                    <div className="text-sm text-slate-600 mb-1">{song.artist}</div>
                    {/* <div className="flex flex-wrap gap-2 mb-1">
                      {song.type.map((t, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full border ${typeColors[t] || 'bg-slate-100 text-slate-700'}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div> */}
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-1">
                      {song.type.map((t, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full border ${typeColors[t] || 'bg-slate-100 text-slate-700'}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                      {song.tag.map((t, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full border ${tagColors[t] || 'bg-slate-100 text-slate-700'}`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                  </div>
                  {/* <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                    {song.tag.map((t, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full border ${tagColors[t] || 'bg-slate-100 text-slate-700'}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div> */}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
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