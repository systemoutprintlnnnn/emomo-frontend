import { useState, useCallback, useEffect, useRef } from 'react';
import { Header, SearchHero, MemeGrid, MemeModal } from './components';
import { searchMemes, getMemes } from './api';
import type { Meme } from './types';
import './App.css';

// Demo memes for development (when API is not available)
const DEMO_MEMES: Meme[] = [
  {
    id: '1',
    source_type: 'chinesebqb',
    source_id: 'demo-1',
    storage_key: 'demo/1.jpg',
    original_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
    width: 300,
    height: 300,
    format: 'jpg',
    is_animated: false,
    file_size: 50000,
    vlm_description: '一只橘色的猫咪，眼神慵懒地看着镜头，非常可爱',
    tags: ['猫', '可爱', '橘猫'],
    category: '猫咪',
    score: 0.95,
    created_at: '2024-01-01',
  },
  {
    id: '2',
    source_type: 'chinesebqb',
    source_id: 'demo-2',
    storage_key: 'demo/2.jpg',
    original_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=400&fit=crop',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&h=400&fit=crop',
    width: 300,
    height: 400,
    format: 'jpg',
    is_animated: false,
    file_size: 60000,
    vlm_description: '一只金毛犬，张大嘴巴像在笑，非常开心的样子',
    tags: ['狗', '开心', '金毛'],
    category: '狗狗',
    score: 0.89,
    created_at: '2024-01-02',
  },
  {
    id: '3',
    source_type: 'chinesebqb',
    source_id: 'demo-3',
    storage_key: 'demo/3.jpg',
    original_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=350&h=250&fit=crop',
    url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=350&h=250&fit=crop',
    width: 350,
    height: 250,
    format: 'jpg',
    is_animated: false,
    file_size: 45000,
    vlm_description: '一只蓝色眼睛的白猫，优雅地坐着',
    tags: ['猫', '白猫', '优雅'],
    category: '猫咪',
    score: 0.87,
    created_at: '2024-01-03',
  },
  {
    id: '4',
    source_type: 'chinesebqb',
    source_id: 'demo-4',
    storage_key: 'demo/4.gif',
    original_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=280&h=280&fit=crop',
    url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=280&h=280&fit=crop',
    width: 280,
    height: 280,
    format: 'gif',
    is_animated: true,
    file_size: 120000,
    vlm_description: '一只哈士奇，歪着头看镜头，表情很滑稽',
    tags: ['狗', '哈士奇', '滑稽'],
    category: '狗狗',
    score: 0.82,
    created_at: '2024-01-04',
  },
  {
    id: '5',
    source_type: 'chinesebqb',
    source_id: 'demo-5',
    storage_key: 'demo/5.jpg',
    original_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=320&h=380&fit=crop',
    url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=320&h=380&fit=crop',
    width: 320,
    height: 380,
    format: 'jpg',
    is_animated: false,
    file_size: 55000,
    vlm_description: '一只黑白相间的猫，睁大眼睛，表情很惊讶',
    tags: ['猫', '惊讶', '黑白猫'],
    category: '猫咪',
    score: 0.78,
    created_at: '2024-01-05',
  },
  {
    id: '6',
    source_type: 'chinesebqb',
    source_id: 'demo-6',
    storage_key: 'demo/6.jpg',
    original_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=350&fit=crop',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=350&fit=crop',
    width: 300,
    height: 350,
    format: 'jpg',
    is_animated: false,
    file_size: 48000,
    vlm_description: '一只金毛幼犬，趴在地上，眼神无辜',
    tags: ['狗', '幼犬', '无辜'],
    category: '狗狗',
    score: 0.75,
    created_at: '2024-01-06',
  },
  {
    id: '7',
    source_type: 'chinesebqb',
    source_id: 'demo-7',
    storage_key: 'demo/7.jpg',
    original_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=280&h=320&fit=crop',
    url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=280&h=320&fit=crop',
    width: 280,
    height: 320,
    format: 'jpg',
    is_animated: false,
    file_size: 42000,
    vlm_description: '一只橘猫，闭着眼睛，看起来很满足',
    tags: ['猫', '满足', '睡觉'],
    category: '猫咪',
    score: 0.72,
    created_at: '2024-01-07',
  },
  {
    id: '8',
    source_type: 'chinesebqb',
    source_id: 'demo-8',
    storage_key: 'demo/8.jpg',
    original_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=340&h=280&fit=crop',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=340&h=280&fit=crop',
    width: 340,
    height: 280,
    format: 'jpg',
    is_animated: false,
    file_size: 52000,
    vlm_description: '一只柴犬，咧嘴笑，表情很开心',
    tags: ['狗', '柴犬', '笑'],
    category: '狗狗',
    score: 0.68,
    created_at: '2024-01-08',
  },
];

function App() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [recommendedMemes, setRecommendedMemes] = useState<Meme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const hasFetchedRef = useRef(false);

  // 加载推荐表情（首屏）
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadRecommendedMemes = async () => {
      try {
        const response = await getMemes(12, 0);
        setRecommendedMemes(response.results);
      } catch (error) {
        console.error('Failed to load recommended memes:', error);
        // 使用 demo 数据作为后备
        setRecommendedMemes(DEMO_MEMES.slice(0, 8));
      } finally {
        setIsLoadingRecommended(false);
      }
    };
    loadRecommendedMemes();
  }, []);

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
      // Use demo data as fallback
      const filtered = DEMO_MEMES.filter(
        (m) =>
          m.vlm_description?.toLowerCase().includes(query.toLowerCase()) ||
          m.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          m.category?.toLowerCase().includes(query.toLowerCase())
      );
      setMemes(filtered.length > 0 ? filtered : DEMO_MEMES);
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
            isLoading={isLoadingRecommended}
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
