/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Book, 
  Search, 
  Bookmark, 
  Heart, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  Share2, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun,
  Settings,
  History,
  Download,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chapters, sampleVerses, Verse, Chapter } from './data/gita';
import { fetchVerseDetails, searchVerses } from './services/geminiService';
import { generateBengaliSpeech } from './services/ttsService';
import { cn } from './lib/utils';
import html2canvas from 'html2canvas';

// --- Types ---
type View = 'home' | 'chapter' | 'bookmarks' | 'favorites' | 'search' | 'settings';

export default function App() {
  // --- State ---
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [currentVerses, setCurrentVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]); // "chapter-verse"
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [readChapters, setReadChapters] = useState<number[]>([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('gita_progress');
    if (savedProgress) setReadChapters(JSON.parse(savedProgress));
  }, []);

  useEffect(() => {
    localStorage.setItem('gita_progress', JSON.stringify(readChapters));
  }, [readChapters]);

  const markChapterAsRead = (chapterId: number) => {
    if (!readChapters.includes(chapterId)) {
      setReadChapters(prev => [...prev, chapterId]);
    }
  };

  const readFullChapter = async () => {
    if (!selectedChapter) return;
    
    setIsSpeaking(true);
    for (const verse of currentVerses) {
      if (!isSpeaking) break;
      setCurrentSpeakingVerse(`${verse.chapter}-${verse.verse}`);
      
      const audioUrl = await generateBengaliSpeech(`${verse.translation}. ${verse.explanation}`);
      if (!audioUrl) continue;

      await new Promise((resolve) => {
        const audio = new Audio(audioUrl);
        audio.playbackRate = speechRate;
        audioRef.current = audio;
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
    }
    setIsSpeaking(false);
    setCurrentSpeakingVerse(null);
    markChapterAsRead(selectedChapter.id);
  };

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingVerse, setCurrentSpeakingVerse] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Effects ---
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('gita_bookmarks');
    const savedFavorites = localStorage.getItem('gita_favorites');
    const savedTheme = localStorage.getItem('gita_theme');
    
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('gita_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('gita_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gita_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gita_theme', 'light');
    }
  }, [isDarkMode]);

  // --- Handlers ---
  const handleChapterSelect = async (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentView('chapter');
    setIsLoading(true);
    
    // Check if we have sample verses
    const samples = sampleVerses.filter(v => v.chapter === chapter.id);
    if (samples.length > 0) {
      setCurrentVerses(samples);
      setIsLoading(false);
    } else {
      // Fetch first few verses using Gemini
      const v1 = await fetchVerseDetails(chapter.id, 1);
      if (v1) setCurrentVerses([v1]);
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const results = await searchVerses(searchQuery);
    setSearchResults(results);
    setIsLoading(false);
  };

  const toggleBookmark = (chapter: number, verse: number) => {
    const id = `${chapter}-${verse}`;
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleFavorite = (chapter: number, verse: number) => {
    const id = `${chapter}-${verse}`;
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const speakVerse = async (verse: Verse) => {
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (currentSpeakingVerse === `${verse.chapter}-${verse.verse}`) {
        setIsSpeaking(false);
        setCurrentSpeakingVerse(null);
        return;
      }
    }

    setIsSpeaking(true);
    setCurrentSpeakingVerse(`${verse.chapter}-${verse.verse}`);

    const audioUrl = await generateBengaliSpeech(`${verse.translation}. ${verse.explanation}`);
    if (!audioUrl) {
      setIsSpeaking(false);
      setCurrentSpeakingVerse(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.playbackRate = speechRate;
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsSpeaking(false);
      setCurrentSpeakingVerse(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingVerse(null);
      audioRef.current = null;
    };

    audio.play().catch(() => {
      setIsSpeaking(false);
      setCurrentSpeakingVerse(null);
    });
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentSpeakingVerse(null);
  };

  const shareAsImage = async (verse: Verse) => {
    const element = document.getElementById(`verse-card-${verse.chapter}-${verse.verse}`);
    if (!element) return;
    
    const canvas = await html2canvas(element, {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f0',
      scale: 2,
    });
    
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = `Gita_Verse_${verse.chapter}_${verse.verse}.png`;
    link.click();
  };

  // --- Components ---

  const Header = () => (
    <header className="sticky top-0 z-40 w-full glass-card border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-black/5 rounded-full">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-display font-bold text-spiritual-gold">গীতা অমৃত</h1>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          onClick={() => setCurrentView('search')}
          className="p-2 hover:bg-black/5 rounded-full"
        >
          <Search size={20} />
        </button>
      </div>
    </header>
  );

  const Sidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed left-0 top-0 bottom-0 w-72 glass-card z-50 p-6 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-spiritual-saffron rounded-lg flex items-center justify-center text-white font-bold">G</div>
                <h2 className="text-lg font-display font-bold">গীতা অমৃত</h2>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-black/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <SidebarItem icon={<Book size={20} />} label="অধ্যায়সমূহ" active={currentView === 'home'} onClick={() => { setCurrentView('home'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={<Bookmark size={20} />} label="বুকমার্ক" active={currentView === 'bookmarks'} onClick={() => { setCurrentView('bookmarks'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={<Heart size={20} />} label="প্রিয় শ্লোক" active={currentView === 'favorites'} onClick={() => { setCurrentView('favorites'); setIsSidebarOpen(false); }} />
              <div className="px-4 py-3">
                <div className="flex justify-between text-xs font-bold opacity-50 mb-1">
                  <span>পড়ার অগ্রগতি</span>
                  <span>{Math.round((readChapters.length / 18) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-spiritual-saffron transition-all duration-500" 
                    style={{ width: `${(readChapters.length / 18) * 100}%` }} 
                  />
                </div>
              </div>
              <SidebarItem icon={<Settings size={20} />} label="সেটিংস" active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }} />
            </nav>

            <div className="mt-auto pt-6 border-t border-black/5">
              <p className="text-xs text-center opacity-50">© ২০২৬ গীতা অমৃত - শ্রীমদ্ভগবদ্গীতা</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
        active ? "bg-spiritual-saffron text-white shadow-md" : "hover:bg-black/5"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  const ChapterList = () => (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {chapters.map((chapter) => (
        <motion.div
          key={chapter.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleChapterSelect(chapter)}
          className="glass-card p-5 rounded-2xl cursor-pointer flex items-center gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Book size={64} />
          </div>
          <div className="w-12 h-12 bg-spiritual-gold/10 text-spiritual-gold rounded-full flex items-center justify-center font-serif text-xl font-bold">
            {chapter.id}
          </div>
          <div>
            <h3 className="text-lg font-bold font-display">{chapter.name_translation}</h3>
            <p className="text-sm opacity-70 italic">{chapter.name}</p>
            <p className="text-xs mt-1 opacity-60">{chapter.verses_count} টি শ্লোক</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const VerseCard = ({ verse }: { verse: Verse }) => {
    const isBookmarked = bookmarks.includes(`${verse.chapter}-${verse.verse}`);
    const isFavorite = favorites.includes(`${verse.chapter}-${verse.verse}`);
    const isCurrentSpeaking = currentSpeakingVerse === `${verse.chapter}-${verse.verse}`;

    return (
      <motion.div 
        id={`verse-card-${verse.chapter}-${verse.verse}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass-card p-6 rounded-3xl mb-8 flex flex-col gap-6 relative",
          isCurrentSpeaking && "verse-highlight"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-spiritual-gold/10 text-spiritual-gold rounded-full text-xs font-bold">
            অধ্যায় {verse.chapter} - শ্লোক {verse.verse}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => toggleFavorite(verse.chapter, verse.verse)} className={cn("p-2 rounded-full", isFavorite ? "text-red-500" : "opacity-40")}>
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button onClick={() => toggleBookmark(verse.chapter, verse.verse)} className={cn("p-2 rounded-full", isBookmarked ? "text-spiritual-gold" : "opacity-40")}>
              <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={() => shareAsImage(verse)} className="p-2 opacity-40 hover:opacity-100">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="text-center py-4">
          <p className="text-2xl font-serif font-bold leading-relaxed whitespace-pre-line text-spiritual-gold">
            {verse.shloka}
          </p>
          <p className="text-sm mt-4 opacity-60 italic font-serif">
            {verse.transliteration}
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-black/5 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">অনুবাদ</h4>
            <p className="text-lg leading-relaxed">{verse.translation}</p>
          </div>
          
          <div className="p-4 border border-black/5 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">ব্যাখ্যা</h4>
            <p className="text-md leading-relaxed opacity-80">{verse.explanation}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => speakVerse(verse)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm",
              isCurrentSpeaking ? "bg-red-500 text-white" : "bg-spiritual-saffron text-white"
            )}
          >
            {isCurrentSpeaking ? <Pause size={20} /> : <Play size={20} />}
            {isCurrentSpeaking ? "থামান" : "শুনুন"}
          </button>
        </div>
      </motion.div>
    );
  };

  const ChapterView = () => (
    <div className="p-4 max-w-3xl mx-auto pb-32">
      <button 
        onClick={() => setCurrentView('home')}
        className="flex items-center gap-2 mb-6 opacity-60 hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={20} />
        <span>অধ্যায় তালিকায় ফিরুন</span>
      </button>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-bold text-spiritual-gold mb-2">{selectedChapter?.name_translation}</h2>
        <p className="text-lg opacity-60 italic">{selectedChapter?.name}</p>
        <div className="w-24 h-1 bg-spiritual-gold/20 mx-auto mt-4 rounded-full" />
        
        <button 
          onClick={readFullChapter}
          className="mt-6 flex items-center gap-2 mx-auto px-6 py-2 bg-spiritual-gold/10 text-spiritual-gold rounded-full font-bold hover:bg-spiritual-gold/20 transition-all"
        >
          <Volume2 size={18} />
          সম্পূর্ণ অধ্যায় শুনুন
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-spiritual-saffron border-t-transparent rounded-full animate-spin" />
          <p className="opacity-60">শ্লোক লোড হচ্ছে...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {currentVerses.map((verse, idx) => (
            <VerseCard key={idx} verse={verse} />
          ))}
          
          <div className="flex justify-center py-10">
            <button 
              onClick={async () => {
                const nextVerseNum = currentVerses.length + 1;
                if (selectedChapter && nextVerseNum <= selectedChapter.verses_count) {
                  setIsLoading(true);
                  const nextVerse = await fetchVerseDetails(selectedChapter.id, nextVerseNum);
                  if (nextVerse) setCurrentVerses(prev => [...prev, nextVerse]);
                  setIsLoading(false);
                }
              }}
              className="px-8 py-3 bg-spiritual-gold text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
            >
              পরবর্তী শ্লোক দেখুন
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const SearchView = () => (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} />
          <input 
            type="text" 
            placeholder="শ্লোক বা বিষয় খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-4 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-spiritual-saffron"
          />
        </div>
        <button 
          onClick={handleSearch}
          className="px-6 py-4 bg-spiritual-saffron text-white rounded-2xl font-bold shadow-md"
        >
          খুঁজুন
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-spiritual-saffron border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {searchResults.length > 0 ? (
            searchResults.map((verse, idx) => <VerseCard key={idx} verse={verse} />)
          ) : searchQuery && (
            <div className="text-center py-20 opacity-40">
              <Search size={64} className="mx-auto mb-4" />
              <p>কোনো ফলাফল পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const BookmarksView = () => {
    const bookmarkedVerses = sampleVerses.filter(v => bookmarks.includes(`${v.chapter}-${v.verse}`));
    
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
          <Bookmark className="text-spiritual-gold" />
          বুকমার্ক করা শ্লোক
        </h2>
        
        {bookmarkedVerses.length > 0 ? (
          <div className="space-y-6">
            {bookmarkedVerses.map((verse, idx) => <VerseCard key={idx} verse={verse} />)}
          </div>
        ) : (
          <div className="text-center py-20 opacity-40">
            <Bookmark size={64} className="mx-auto mb-4" />
            <p>আপনার কোনো বুকমার্ক নেই</p>
          </div>
        )}
      </div>
    );
  };

  const SettingsView = () => (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
        <Settings className="text-spiritual-gold" />
        সেটিংস
      </h2>

      <div className="space-y-4">
        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-spiritual-saffron/10 text-spiritual-saffron rounded-2xl">
              {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
            </div>
            <div>
              <h3 className="font-bold">ডার্ক মোড</h3>
              <p className="text-sm opacity-60">চোখের আরামের জন্য ডার্ক থিম ব্যবহার করুন</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "w-14 h-8 rounded-full relative transition-colors",
              isDarkMode ? "bg-spiritual-saffron" : "bg-black/10"
            )}
          >
            <div className={cn(
              "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
              isDarkMode ? "left-7" : "left-1"
            )} />
          </button>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-spiritual-gold/10 text-spiritual-gold rounded-2xl">
              <Volume2 size={24} />
            </div>
            <div>
              <h3 className="font-bold">ভয়েস স্পিড</h3>
              <p className="text-sm opacity-60">পড়ার গতি নিয়ন্ত্রণ করুন</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs opacity-50">ধীর</span>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="flex-1 accent-spiritual-gold"
            />
            <span className="text-xs opacity-50">দ্রুত</span>
            <span className="font-bold w-8">{speechRate}x</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-2xl">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-bold">অফলাইন রিডিং</h3>
              <p className="text-sm opacity-60">সব শ্লোক অফলাইনে পড়ার জন্য ডাউনলোড করুন</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold">ডাউনলোড</button>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView + (selectedChapter?.id || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'home' && <ChapterList />}
            {currentView === 'chapter' && <ChapterView />}
            {currentView === 'search' && <SearchView />}
            {currentView === 'bookmarks' && <BookmarksView />}
            {currentView === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Audio Controls */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-50 glass-card p-4 rounded-3xl shadow-2xl border-spiritual-saffron/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-spiritual-saffron rounded-full flex items-center justify-center text-white animate-pulse">
                <Volume2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold opacity-50 uppercase tracking-widest">এখন পড়া হচ্ছে</p>
                <p className="text-sm font-bold truncate max-w-[150px]">শ্রীমদ্ভগবদ্গীতা অমৃত</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={stopSpeech} className="p-3 bg-red-500 text-white rounded-full shadow-lg">
                <Square size={20} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Verse Notification (Simulated) */}
      <AnimatePresence>
        {currentView === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4"
          >
            <div className="glass-card p-6 rounded-3xl border-spiritual-gold/20 bg-spiritual-gold/5">
              <div className="flex items-center gap-2 mb-2 text-spiritual-gold">
                <Info size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">আজকের শ্লোক</span>
              </div>
              <p className="italic mb-4">"তোমার কেবল কর্মেই অধিকার আছে, কিন্তু কর্মফলে কখনও অধিকার নেই..."</p>
              <button 
                onClick={() => handleChapterSelect(chapters[1])}
                className="text-spiritual-gold font-bold text-sm flex items-center gap-1"
              >
                সম্পূর্ণ পড়ুন <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
