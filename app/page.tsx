"use client";
import { useMemo, useState, useEffect } from 'react';

const typeColors: Record<string, string> = { 
  'POP': 'bg-sky-200 text-sky-800',         // 밝고 경쾌
  'R&B': 'bg-purple-200 text-purple-800',   // 부드럽고 감성
  'KPOP': 'bg-pink-200 text-pink-800',      // K-POP 느낌
  '발라드': 'bg-gray-200 text-gray-800',    // 차분함
  '뮤지컬': 'bg-teal-200 text-teal-800',    // OST/뮤지컬용
  'JPOP': 'bg-orange-200 text-orange-800',  // 일본 팝 느낌
  '경연곡': 'bg-yellow-200 text-yellow-800', // 경연/공연용
  'OST': 'bg-indigo-200 text-indigo-800',   // 영화/드라마 OST
};

interface Song {
  id: string;
  title: string;
  artist: string;
  type: string[];
}

export default function SongListPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('title');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/song.json')
      .then(res => res.json())
      .then((data: Song[]) => setSongs(data))
      .catch(err => {
        console.error("Failed to load songs.json:", err);
        setSongs([]);
      });
  }, []);

  // 모든 타입을 가져오기
  const allTypes = useMemo(() => {
    const typesSet = new Set<string>();
    songs.forEach(song => song.type.forEach(t => typesSet.add(t)));
    return Array.from(typesSet).sort();
  }, [songs]);

  // 검색 및 필터링 로직
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs
      .filter(song => {
        const matchesQuery =
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q);
        const matchesType = selectedType ? song.type.includes(selectedType) : true;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => {
        if (sort === 'title') return a.title.localeCompare(b.title);
        if (sort === 'artist') return a.artist.localeCompare(b.artist);
        return 0;
      });
  }, [query, sort, songs, selectedType]);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide text-black">
            <span className="text-pink-500">키마</span> 노래책
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            검색과 필터가 가능한 심플한 노래 리스트
          </p>
        </header>

        <section className="bg-white p-4 rounded-2xl shadow-sm mb-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-slate-600 mb-4 md:mb-0">
            총 <span className="font-semibold">{songs.length}</span>곡 중 <span className="font-semibold">{filtered.length}</span>곡
          </div>
          <div className="flex flex-row gap-3 md:gap-4 w-full md:w-auto">
            <input
              className="flex-1 h-12 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="제목, 가수로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="h-12 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="title">제목 순</option>
              <option value="artist">가수 이름 순</option>
            </select>
          </div>
        </section>

        {/* 타입 필터 */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            {allTypes.map((t) => (
              <button
                key={t}
                className={`text-xs px-3 py-1 rounded-full border font-medium
                  ${selectedType === t ? 'ring-2 ring-offset-1 ring-indigo-400' : ''} 
                  ${typeColors[t] || 'bg-slate-100 text-slate-700'}`}
                onClick={() => setSelectedType(selectedType === t ? null : t)}
              >
                {t}
              </button>
            ))}
            {selectedType && (
              <button
                className="text-xs px-3 py-1 rounded-full border bg-red-200 text-red-800"
                onClick={() => setSelectedType(null)}
              >
                필터 해제
              </button>
            )}
          </div>
        </section>

        {/* 노래 리스트 */}
        <section>
          <ul className="grid gap-3 max-h-[500px] overflow-y-auto">
            {filtered.length === 0 && (
              <li className="text-center text-slate-500 py-8">검색 결과가 없습니다.</li>
            )}
            {filtered.map((song) => (
              <li key={song.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg text-black">{song.title}</div>
                  <div className="text-sm text-slate-600">{song.artist}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {song.type.map((t, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full border ${typeColors[t] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
