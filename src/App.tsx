import { useState, useCallback } from 'react';
import { Header, SearchHero, MemeGrid, MemeModal } from './components';
import { searchMemes } from './api';
import { curatedMemes } from './data/curatedMemes';
import type { Meme } from './types';
import './App.css';

function App() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const recommendedMemes = curatedMemes;
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await searchMemes(query, 20);
      setMemes(response.results);
    } catch (error) {
      console.error('Search failed:', error);
      // Use curated data as fallback
      const filtered = curatedMemes.filter(
        (m) =>
          m.vlm_description?.toLowerCase().includes(query.toLowerCase()) ||
          m.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          m.category?.toLowerCase().includes(query.toLowerCase())
      );
      setMemes(filtered.length > 0 ? filtered : curatedMemes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle logo click - reset to home
  const handleLogoClick = useCallback(() => {
    setMemes([]);
    setSearchQuery('');
    setHasSearched(false);
    setSelectedMeme(null);
  }, []);

  // Handle meme click
  const handleMemeClick = useCallback((meme: Meme) => {
    setSelectedMeme(meme);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setSelectedMeme(null);
  }, []);

  return (
    <div className="app">
      <Header onLogoClick={handleLogoClick} />

      <main className="main">
        <SearchHero
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {hasSearched ? (
          <MemeGrid
            memes={memes}
            isLoading={isLoading}
            onMemeClick={handleMemeClick}
            searchQuery={searchQuery}
            emptyMessage="没有找到相关表情包"
          />
        ) : (
          <MemeGrid
            memes={recommendedMemes}
            isLoading={false}
            onMemeClick={handleMemeClick}
            searchQuery=""
            emptyMessage=""
            title="推荐表情"
          />
        )}
      </main>

      <MemeModal
        meme={selectedMeme}
        isOpen={!!selectedMeme}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;
