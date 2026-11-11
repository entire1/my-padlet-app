import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  Columns,
  Move,
  Heart,
  MessageSquare,
  Pin,
  Trash2,
  Edit3,
  MoreVertical,
  Share2,
  Download,
  Image as ImageIcon,
  CheckSquare,
  Link2,
  Tag,
  X,
  Check,
  Palette,
  Sparkles,
  ArrowRight,
  Printer,
  Copy,
  SlidersHorizontal,
  ChevronDown,
  ExternalLink,
  FolderPlus,
  Layers,
  Globe,
  Wifi
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'padlet-clone-app';

if (typeof __firebase_config !== 'undefined' && __firebase_config) {
  try {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase init error:', err);
  }
}

// --- INITIAL DEFAULT DATA (한글 적용) ---
const DEFAULT_BOARDS = [
  {
    id: 'board-1',
    title: '🚀 팀 브레인스토밍 & 프로젝트 보드',
    description: '아이디어, 자료 조사, 그리고 할 일을 함께 공유하는 협업 공간입니다.',
    layout: 'grid', // 'grid' | 'kanban' | 'canvas'
    bgType: 'gradient',
    bgValue: 'from-slate-900 via-indigo-950 to-slate-900',
    columns: ['할 일 (To Do)', '진행 중', '완료'],
    posts: [
      {
        id: 'post-1',
        title: '🎨 브랜드 아이덴티티 개편',
        content: '핵심 비주얼 에셋을 새롭게 업데이트합니다. 세련된 컬러 팔레트와 모던한 타이포그래피를 검토 중입니다.',
        column: '진행 중',
        color: '#fef3c7', // amber-100
        tags: ['디자인', '중요'],
        likes: 12,
        pinned: true,
        x: 40,
        y: 40,
        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
          caption: '디자인 무드보드 컨셉'
        },
        checklist: [
          { id: 'c1', text: '컬러 대비 검토', done: true },
          { id: 'c2', text: '로고 벡터 추출', done: false },
          { id: 'c3', text: '폰트 가이드 작성', done: false }
        ],
        comments: [
          { id: 'cm1', author: '김철수', text: '컬러톤이 아주 따뜻하고 좋네요!', timestamp: '오전 10:15' },
          { id: 'cm2', author: '이영희', text: '내일 회의 때 이 안으로 발표합시다.', timestamp: '오전 11:02' }
        ]
      },
      {
        id: 'post-2',
        title: '⚡ 실시간 동기화 기능 명세서',
        content: '여러 사용자가 동시에 접속했을 때 변경 사항이 즉시 반영되도록 웹소켓 연동 아키텍처를 검토합니다.',
        column: '할 일 (To Do)',
        color: '#e0f2fe', // sky-100
        tags: ['개발', '백엔드'],
        likes: 8,
        pinned: false,
        x: 380,
        y: 60,
        media: {
          type: 'link',
          url: 'https://developer.mozilla.org',
          title: 'MDN 웹소켓 공식 문서',
          description: '실시간 API 구현을 위한 참고 가이드라인입니다.'
        },
        checklist: [],
        comments: [
          { id: 'cm3', author: '박민수', text: 'Redis pub/sub 구조도 함께 고려해보면 좋겠어요.', timestamp: '어제' }
        ]
      },
      {
        id: 'post-3',
        title: '📊 3분기 유저 피드백 정리',
        content: '고객 인터뷰 주요 결과: 85%가 간편한 메뉴 탐색을 원했고, 40%가 다크 모드 지원을 요청했습니다.',
        column: '완료',
        color: '#f0fdf4', // green-100
        tags: ['리서치', '기획'],
        likes: 15,
        pinned: false,
        x: 120,
        y: 380,
        checklist: [
          { id: 'c4', text: '인터뷰 녹취록 정리 완료', done: true },
          { id: 'c5', text: '경영진 공유 보고서 발송', done: true }
        ],
        comments: []
      }
    ]
  }
];

const BG_OPTIONS = [
  { label: '인디고 나이트', type: 'gradient', value: 'from-slate-900 via-indigo-950 to-slate-900' },
  { label: '선셋 글로우', type: 'gradient', value: 'from-rose-900 via-purple-900 to-slate-900' },
  { label: '에메랄드 포레스트', type: 'gradient', value: 'from-emerald-950 via-teal-900 to-slate-900' },
  { label: '미니멀 라이트', type: 'gradient', value: 'from-slate-100 via-gray-100 to-slate-200' },
  { label: '소프트 피치', type: 'gradient', value: 'from-orange-100 via-amber-50 to-rose-100' },
  { label: '딥 시안', type: 'solid', value: 'bg-cyan-950' },
  { label: '퓨어 다크', type: 'solid', value: 'bg-gray-950' }
];

const CARD_COLORS = [
  { label: '클린 화이트', bg: '#ffffff', border: '#e2e8f0' },
  { label: '따뜻한 앰버', bg: '#fef3c7', border: '#fde68a' },
  { label: '스카이 블루', bg: '#e0f2fe', border: '#bae6fd' },
  { label: '프레시 그린', bg: '#dcfce7', border: '#bbf7d0' },
  { label: '로즈 핑크', bg: '#ffe4e6', border: '#fecdd3' },
  { label: '라벤더', bg: '#f3e8ff', border: '#e9d5ff' },
  { label: '차콜 다크', bg: '#1e293b', border: '#334155', isDark: true }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Board State
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem('padlet_boards');
    return saved ? JSON.parse(saved) : DEFAULT_BOARDS;
  });
  const [activeBoardId, setActiveBoardId] = useState(() => {
    return boards[0]?.id || 'board-1';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // New Post Form State
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    column: '',
    color: '#ffffff',
    tagsInput: '',
    mediaType: 'none',
    mediaUrl: '',
    mediaCaption: '',
    mediaTitle: '',
    checklistText: ''
  });

  // New Board Form State
  const [boardForm, setBoardForm] = useState({
    title: '',
    description: '',
    layout: 'grid',
    bgValue: BG_OPTIONS[0].value,
    bgType: BG_OPTIONS[0].type
  });

  // --- 1. FIREBASE AUTH SETUP ---
  useEffect(() => {
    if (!auth) return;

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Firebase Auth error:', err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setIsFirebaseConnected(true);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. FIREBASE REAL-TIME SYNC ---
  useEffect(() => {
    if (!user || !db) return;

    const boardsRef = collection(db, 'artifacts', appId, 'public', 'data', 'boards');

    const unsubscribe = onSnapshot(
      boardsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteBoards = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          setBoards(remoteBoards);
        } else {
          DEFAULT_BOARDS.forEach((b) => {
            setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'boards', b.id), b);
          });
        }
      },
      (error) => {
        console.error('Firestore Real-time sync error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Save to LocalStorage as fallback
  useEffect(() => {
    localStorage.setItem('padlet_boards', JSON.stringify(boards));
  }, [boards]);

  // Sync state helper
  const syncBoardToCloud = async (updatedBoard) => {
    if (db && user) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'boards', updatedBoard.id),
          updatedBoard
        );
      } catch (err) {
        console.error('Cloud sync failed:', err);
      }
    } else {
      setBoards((prev) => prev.map((b) => (b.id === updatedBoard.id ? updatedBoard : b)));
    }
  };

  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0] || DEFAULT_BOARDS[0];

  // Helper: Get all unique tags in current board
  const availableTags = Array.from(
    new Set((activeBoard?.posts || []).flatMap((p) => p.tags || []))
  );

  // Helper: Filter posts based on search & tag
  const filteredPosts = (activeBoard?.posts || []).filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesTag = selectedTag === 'ALL' || (post.tags && post.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Board Actions
  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardForm.title.trim()) return;

    const newBoard = {
      id: `board-${Date.now()}`,
      title: boardForm.title,
      description: boardForm.description,
      layout: boardForm.layout,
      bgType: boardForm.bgType,
      bgValue: boardForm.bgValue,
      columns: ['할 일 (To Do)', '진행 중', '완료'],
      posts: []
    };

    if (db && user) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'boards', newBoard.id), newBoard);
    } else {
      setBoards([...boards, newBoard]);
    }

    setActiveBoardId(newBoard.id);
    setIsNewBoardModalOpen(false);
    setBoardForm({
      title: '',
      description: '',
      layout: 'grid',
      bgValue: BG_OPTIONS[0].value,
      bgType: BG_OPTIONS[0].type
    });
  };

  const handleUpdateLayout = (layout) => {
    const updated = { ...activeBoard, layout };
    syncBoardToCloud(updated);
  };

  const handleDeleteBoard = async (id) => {
    if (boards.length <= 1) {
      alert('최소 1개의 보드는 유지해야 합니다!');
      return;
    }
    if (confirm('정말로 이 보드를 삭제하시겠습니까?')) {
      if (db && user) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'boards', id));
      } else {
        const nextBoards = boards.filter((b) => b.id !== id);
        setBoards(nextBoards);
      }
      const remaining = boards.filter((b) => b.id !== id);
      if (remaining.length > 0) setActiveBoardId(remaining[0].id);
    }
  };

  // Post Actions
  const handleSavePost = (e) => {
    e.preventDefault();
    if (!postForm.title.trim() && !postForm.content.trim()) return;

    const parsedTags = postForm.tagsInput
      ? postForm.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    let mediaObj = null;
    if (postForm.mediaType === 'image' && postForm.mediaUrl) {
      mediaObj = {
        type: 'image',
        url: postForm.mediaUrl,
        caption: postForm.mediaCaption || '첨부 이미지'
      };
    } else if (postForm.mediaType === 'link' && postForm.mediaUrl) {
      mediaObj = {
        type: 'link',
        url: postForm.mediaUrl,
        title: postForm.mediaTitle || postForm.mediaUrl,
        description: '웹 링크 첨부'
      };
    }

    const checklistItems = postForm.checklistText
      ? postForm.checklistText
          .split('\n')
          .filter((line) => line.trim())
          .map((item, idx) => ({ id: `c-${Date.now()}-${idx}`, text: item.trim(), done: false }))
      : [];

    let updatedPosts;
    if (editingPost) {
      updatedPosts = activeBoard.posts.map((p) =>
        p.id === editingPost.id
          ? {
              ...p,
              title: postForm.title,
              content: postForm.content,
              column: postForm.column || activeBoard.columns[0],
              color: postForm.color,
              tags: parsedTags,
              media: mediaObj || p.media,
              checklist: checklistItems.length > 0 ? checklistItems : p.checklist
            }
          : p
      );
    } else {
      const newPost = {
        id: `post-${Date.now()}`,
        title: postForm.title || '제목 없는 메모',
        content: postForm.content,
        column: postForm.column || activeBoard.columns[0] || '할 일 (To Do)',
        color: postForm.color,
        tags: parsedTags,
        likes: 0,
        pinned: false,
        x: Math.floor(Math.random() * 200) + 50,
        y: Math.floor(Math.random() * 200) + 50,
        media: mediaObj,
        checklist: checklistItems,
        comments: []
      };
      updatedPosts = [newPost, ...activeBoard.posts];
    }

    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
    closePostModal();
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      content: post.content,
      column: post.column,
      color: post.color,
      tagsInput: (post.tags || []).join(', '),
      mediaType: post.media?.type || 'none',
      mediaUrl: post.media?.url || '',
      mediaCaption: post.media?.caption || '',
      mediaTitle: post.media?.title || '',
      checklistText: (post.checklist || []).map((c) => c.text).join('\n')
    });
    setIsNewPostModalOpen(true);
  };

  const closePostModal = () => {
    setIsNewPostModalOpen(false);
    setEditingPost(null);
    setPostForm({
      title: '',
      content: '',
      column: activeBoard?.columns[0] || '할 일 (To Do)',
      color: '#ffffff',
      tagsInput: '',
      mediaType: 'none',
      mediaUrl: '',
      mediaCaption: '',
      mediaTitle: '',
      checklistText: ''
    });
  };

  const handleDeletePost = (postId) => {
    const updatedPosts = activeBoard.posts.filter((p) => p.id !== postId);
    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
  };

  const handleToggleLike = (postId) => {
    const updatedPosts = activeBoard.posts.map((p) =>
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    );
    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
  };

  const handleTogglePin = (postId) => {
    const updatedPosts = activeBoard.posts.map((p) =>
      p.id === postId ? { ...p, pinned: !p.pinned } : p
    );
    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
  };

  const handleToggleChecklist = (postId, itemId) => {
    const updatedPosts = activeBoard.posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        checklist: p.checklist.map((c) =>
          c.id === itemId ? { ...c, done: !c.done } : c
        )
      };
    });
    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
  };

  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) return;
    const newComment = {
      id: `cm-${Date.now()}`,
      author: user ? `사용자 (${user.uid.slice(0, 4)})` : '익명',
      text: commentText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedPosts = activeBoard.posts.map((p) =>
      p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
    );
    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
  };

  const handleMoveColumn = (postId, newColumn) => {
    const updatedPosts = activeBoard.posts.map((p) =>
      p.id === postId ? { ...p, column: newColumn } : p
    );
    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
  };

  const handleUpdateCanvasPos = (postId, newX, newY) => {
    const updatedPosts = activeBoard.posts.map((p) =>
      p.id === postId ? { ...p, x: newX, y: newY } : p
    );
    syncBoardToCloud({ ...activeBoard, posts: updatedPosts });
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeBoard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeBoard.title.replace(/[^a-z0-9가-힣]/gi, '_').toLowerCase()}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const sortedPosts = [...filteredPosts].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-300 ${activeBoard.bgType === 'gradient' ? `bg-gradient-to-br ${activeBoard.bgValue}` : activeBoard.bgValue}`}>
      
      {/* --- TOP NAVBAR --- */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-inner relative">
            <Layers className="w-6 h-6 text-white" />
            {isFirebaseConnected && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <select
                value={activeBoardId}
                onChange={(e) => setActiveBoardId(e.target.value)}
                className="bg-slate-800/90 text-slate-100 text-base font-bold rounded-lg px-2.5 py-1 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsNewBoardModalOpen(true)}
                title="새 보드 만들기"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDeleteBoard(activeBoardId)}
                title="현재 보드 삭제"
                className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="text-xs text-slate-400 max-w-xs truncate">
                {activeBoard.description || '실시간 협업 패들렛 공간'}
              </p>
              {isFirebaseConnected ? (
                <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.2 rounded-full flex items-center gap-1 font-semibold">
                  <Wifi className="w-2.5 h-2.5" /> 실시간 동기화 중
                </span>
              ) : (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.2 rounded-full border border-slate-700">
                  로컬 모드
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Switches & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center space-x-1">
            <button
              onClick={() => handleUpdateLayout('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeBoard.layout === 'grid'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>격자형</span>
            </button>
            <button
              onClick={() => handleUpdateLayout('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeBoard.layout === 'kanban'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>칸반보드</span>
            </button>
            <button
              onClick={() => handleUpdateLayout('canvas')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeBoard.layout === 'canvas'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>자유배치</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden sm:block" />

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">공유</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">인쇄/요약</span>
          </button>

          <button
            onClick={() => {
              setPostForm((prev) => ({ ...prev, column: activeBoard.columns[0] || '할 일 (To Do)' }));
              setIsNewPostModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>카드 추가</span>
          </button>
        </div>
      </header>

      {/* --- FILTER & SEARCH BAR --- */}
      <section className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="내용 또는 태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-full">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedTag('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
              selectedTag === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            모든 태그
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-6 overflow-x-auto relative min-h-[70vh]">
        {sortedPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-slate-800/50 rounded-full text-slate-400 mb-3 border border-slate-700">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">등록된 카드가 없습니다</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              {searchQuery || selectedTag !== 'ALL'
                ? '검색 필터를 초기화하여 모든 카드를 확인해보세요.'
                : '새로운 카드를 추가하여 시작해 보세요!'}
            </p>
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow-md"
            >
              + 카드 만들기
            </button>
          </div>
        )}

        {/* LAYOUT 1: MASONRY / GRID VIEW */}
        {activeBoard.layout === 'grid' && sortedPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                columns={activeBoard.columns}
                onLike={() => handleToggleLike(post.id)}
                onPin={() => handleTogglePin(post.id)}
                onEdit={() => openEditPost(post)}
                onDelete={() => handleDeletePost(post.id)}
                onToggleChecklist={(itemId) => handleToggleChecklist(post.id, itemId)}
                onAddComment={(text) => handleAddComment(post.id, text)}
                onMoveColumn={(col) => handleMoveColumn(post.id, col)}
              />
            ))}
          </div>
        )}

        {/* LAYOUT 2: KANBAN BOARD VIEW */}
        {activeBoard.layout === 'kanban' && (
          <div className="flex space-x-4 overflow-x-auto pb-6 items-start min-h-[60vh]">
            {activeBoard.columns.map((colName) => {
              const colPosts = sortedPosts.filter((p) => p.column === colName);
              return (
                <div
                  key={colName}
                  className="w-80 shrink-0 bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex flex-col max-h-[80vh] shadow-xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 px-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-200">{colName}</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                        {colPosts.length}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setPostForm((prev) => ({ ...prev, column: colName }));
                        setIsNewPostModalOpen(true);
                      }}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
                    {colPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        columns={activeBoard.columns}
                        onLike={() => handleToggleLike(post.id)}
                        onPin={() => handleTogglePin(post.id)}
                        onEdit={() => openEditPost(post)}
                        onDelete={() => handleDeletePost(post.id)}
                        onToggleChecklist={(itemId) => handleToggleChecklist(post.id, itemId)}
                        onAddComment={(text) => handleAddComment(post.id, text)}
                        onMoveColumn={(col) => handleMoveColumn(post.id, col)}
                      />
                    ))}
                    {colPosts.length === 0 && (
                      <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
                        이 칸에 카드가 없습니다
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LAYOUT 3: FREEFORM CANVAS VIEW */}
        {activeBoard.layout === 'canvas' && (
          <div className="relative w-full h-[80vh] border border-slate-800/80 bg-slate-950/40 rounded-2xl overflow-auto p-4 backdrop-blur-xs">
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
            {sortedPosts.map((post) => (
              <DraggableCanvasPost
                key={post.id}
                post={post}
                columns={activeBoard.columns}
                onLike={() => handleToggleLike(post.id)}
                onPin={() => handleTogglePin(post.id)}
                onEdit={() => openEditPost(post)}
                onDelete={() => handleDeletePost(post.id)}
                onToggleChecklist={(itemId) => handleToggleChecklist(post.id, itemId)}
                onAddComment={(text) => handleAddComment(post.id, text)}
                onMoveColumn={(col) => handleMoveColumn(post.id, col)}
                onUpdatePos={(x, y) => handleUpdateCanvasPos(post.id, x, y)}
              />
            ))}
          </div>
        )}
      </main>

      {/* --- MODAL: CREATE / EDIT POST --- */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                {editingPost ? '카드 수정하기' : '새 카드 작성'}
              </h3>
              <button
                onClick={closePostModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">제목</label>
                <input
                  type="text"
                  placeholder="카드 제목을 입력하세요..."
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">내용 / 설명</label>
                <textarea
                  rows={3}
                  placeholder="상세한 내용이나 생각을 적어보세요..."
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  카드 색상
                </label>
                <div className="flex items-center space-x-2 overflow-x-auto py-1">
                  {CARD_COLORS.map((c) => (
                    <button
                      key={c.bg}
                      type="button"
                      onClick={() => setPostForm({ ...postForm, color: c.bg })}
                      className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 shrink-0 ${
                        postForm.color === c.bg ? 'ring-2 ring-indigo-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c.bg, borderColor: c.border }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Column Select */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">칸반 분류 (컬럼)</label>
                <select
                  value={postForm.column}
                  onChange={(e) => setPostForm({ ...postForm, column: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {activeBoard.columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  placeholder="디자인, 긴급, 개발"
                  value={postForm.tagsInput}
                  onChange={(e) => setPostForm({ ...postForm, tagsInput: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Attach Media */}
              <div className="border border-slate-800 rounded-xl p-3 bg-slate-800/40">
                <label className="block text-slate-300 font-semibold mb-2">미디어 첨부</label>
                <div className="flex space-x-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setPostForm({ ...postForm, mediaType: 'none' })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      postForm.mediaType === 'none' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    없음
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostForm({ ...postForm, mediaType: 'image' })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                      postForm.mediaType === 'image' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>이미지</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostForm({ ...postForm, mediaType: 'link' })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition ${
                      postForm.mediaType === 'link' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>링크</span>
                  </button>
                </div>

                {postForm.mediaType === 'image' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="이미지 URL 주소 입력"
                      value={postForm.mediaUrl}
                      onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="이미지 설명 (선택사항)"
                      value={postForm.mediaCaption}
                      onChange={(e) => setPostForm({ ...postForm, mediaCaption: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
                    />
                  </div>
                )}

                {postForm.mediaType === 'link' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="웹사이트 URL (https://...)"
                      value={postForm.mediaUrl}
                      onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
                    />
                    <input
                      type="text"
                      placeholder="링크 제목 (선택사항)"
                      value={postForm.mediaTitle}
                      onChange={(e) => setPostForm({ ...postForm, mediaTitle: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100"
                    />
                  </div>
                )}
              </div>

              {/* Checklist Input */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                  체크리스트 항목 (줄바꿈으로 구분)
                </label>
                <textarea
                  rows={2}
                  placeholder="할 일 항목 1&#10;할 일 항목 2"
                  value={postForm.checklistText}
                  onChange={(e) => setPostForm({ ...postForm, checklistText: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closePostModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
                >
                  {editingPost ? '수정 완료' : '카드 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE NEW BOARD --- */}
      {isNewBoardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-indigo-400" />
                새 보드 만들기
              </h3>
              <button
                onClick={() => setIsNewBoardModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">보드 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 프로젝트 로드맵, 디자인 영감"
                  value={boardForm.title}
                  onChange={(e) => setBoardForm({ ...boardForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">보드 설명</label>
                <input
                  type="text"
                  placeholder="보드의 목적을 간단히 적어주세요..."
                  value={boardForm.description}
                  onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">기본 보기 모드</label>
                <select
                  value={boardForm.layout}
                  onChange={(e) => setBoardForm({ ...boardForm, layout: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="grid">격자형 (Masonry)</option>
                  <option value="kanban">칸반 컬럼형</option>
                  <option value="canvas">자유 배치 캔버스</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">배경 테마</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {BG_OPTIONS.map((bg) => (
                    <button
                      key={bg.label}
                      type="button"
                      onClick={() => setBoardForm({ ...boardForm, bgValue: bg.value, bgType: bg.type })}
                      className={`p-2 rounded-xl text-left border flex items-center justify-between transition ${
                        boardForm.bgValue === bg.value
                          ? 'border-indigo-500 bg-slate-800 ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-slate-200 font-medium">{bg.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full ${
                          bg.type === 'gradient' ? `bg-gradient-to-br ${bg.value}` : bg.value
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewBoardModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition"
                >
                  보드 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: SHARE & EXPORT --- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                보드 공유 및 내보내기
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">공유 링크</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://padlet-clone.app/board/${activeBoard.id}`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 select-all"
                  />
                  <button
                    onClick={() => alert('링크가 복사되었습니다!')}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shrink-0"
                    title="링크 복사"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-slate-400 mb-2">데이터 내보내기</label>
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition"
                >
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-indigo-400" />
                    <div className="text-left">
                      <div className="font-semibold text-slate-200">JSON 파일로 다운로드</div>
                      <div className="text-[10px] text-slate-400">보드 전체 데이터를 파일로 저장합니다</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 -rotate-90" />
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: PRINT / TEXT SUMMARY VIEW --- */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl max-h-[85vh] overflow-y-auto print:max-h-none">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                인쇄 및 요약 뷰어
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                >
                  인쇄하기
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="text-slate-500 hover:text-slate-800 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Content */}
            <div className="mt-6 space-y-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{activeBoard.title}</h1>
                <p className="text-sm text-slate-600 mt-1">{activeBoard.description}</p>
                <p className="text-xs text-slate-400 mt-2">
                  총 카드 수: {activeBoard.posts.length}개 | 생성일: {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-4">
                {activeBoard.posts.map((post, idx) => (
                  <div key={post.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-slate-800">
                        {idx + 1}. {post.title}
                      </h4>
                      <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                        분류: {post.column}
                      </span>
                    </div>
                    {post.content && <p className="text-xs text-slate-700 mt-2 whitespace-pre-line">{post.content}</p>}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex space-x-1 mt-2">
                        {post.tags.map((t) => (
                          <span key={t} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {post.checklist && post.checklist.length > 0 && (
                      <div className="mt-3 pl-3 border-l-2 border-slate-300 space-y-1">
                        {post.checklist.map((c) => (
                          <div key={c.id} className="text-xs flex items-center space-x-1.5">
                            <span className={c.done ? 'line-through text-slate-400' : 'text-slate-700'}>
                              [{c.done ? 'V' : ' '}] {c.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: POST CARD (GRID / KANBAN) ---
function PostCard({
  post,
  columns,
  onLike,
  onPin,
  onEdit,
  onDelete,
  onToggleChecklist,
  onAddComment,
  onMoveColumn
}) {
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (commentInput.trim()) {
      onAddComment(commentInput);
      setCommentInput('');
    }
  };

  const isDarkBg = post.color === '#1e293b';

  return (
    <div
      className={`group relative rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-200 border flex flex-col justify-between ${
        isDarkBg ? 'text-slate-100 border-slate-700' : 'text-slate-800 border-slate-200/80'
      }`}
      style={{ backgroundColor: post.color || '#ffffff' }}
    >
      {/* Pin Badge */}
      {post.pinned && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-md z-10" title="상단 고정됨">
          <Pin className="w-3.5 h-3.5 fill-current" />
        </div>
      )}

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-sm leading-snug">{post.title}</h3>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-black/10 backdrop-blur-xs p-1 rounded-lg">
            <button
              onClick={onPin}
              title={post.pinned ? '고정 해제' : '상단 고정'}
              className="p-1 hover:bg-black/10 rounded transition text-slate-600 hover:text-amber-500"
            >
              <Pin className={`w-3.5 h-3.5 ${post.pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={onEdit}
              title="카드 편집"
              className="p-1 hover:bg-black/10 rounded transition text-slate-600 hover:text-indigo-600"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              title="카드 삭제"
              className="p-1 hover:bg-black/10 rounded transition text-slate-600 hover:text-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Details */}
        {post.content && (
          <p className={`text-xs mb-3 whitespace-pre-line leading-relaxed ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
            {post.content}
          </p>
        )}

        {/* Media Attachments */}
        {post.media && (
          <div className="mb-3 rounded-xl overflow-hidden border border-black/10 bg-black/5">
            {post.media.type === 'image' && (
              <div>
                <img
                  src={post.media.url}
                  alt={post.media.caption || '첨부 이미지'}
                  className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300"
                />
                {post.media.caption && (
                  <p className="text-[10px] p-1.5 text-center opacity-7 font-medium">
                    {post.media.caption}
                  </p>
                )}
              </div>
            )}

            {post.media.type === 'link' && (
              <a
                href={post.media.url}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 flex items-start space-x-2 hover:bg-black/10 transition block"
              >
                <Link2 className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold truncate flex items-center gap-1">
                    {post.media.title}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </div>
                  <div className="text-[10px] opacity-70 truncate">{post.media.url}</div>
                </div>
              </a>
            )}
          </div>
        )}

        {/* Checklist */}
        {post.checklist && post.checklist.length > 0 && (
          <div className="mb-3 space-y-1 bg-black/5 p-2 rounded-xl">
            {post.checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-center space-x-2 text-xs cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleChecklist(item.id)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span className={item.done ? 'line-through opacity-50' : 'font-medium'}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 opacity-80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Column Switch, Likes & Comments */}
      <div className="pt-2 border-t border-black/10 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          {/* Likes */}
          <button
            onClick={onLike}
            className="flex items-center space-x-1 hover:opacity-80 transition group/like"
            title="좋아요"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 group-hover/like:scale-125 transition-transform" />
            <span className="font-semibold text-[11px]">{post.likes || 0}</span>
          </button>

          {/* Comments Count Switcher */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 hover:opacity-80 transition"
            title="댓글 보기"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-[11px]">
              {post.comments ? post.comments.length : 0}
            </span>
          </button>

          {/* Column Quick Switcher */}
          {columns && columns.length > 1 && (
            <select
              value={post.column}
              onChange={(e) => onMoveColumn(e.target.value)}
              className="bg-black/5 hover:bg-black/10 text-[10px] font-semibold rounded-lg px-1.5 py-0.5 border-none focus:ring-0 cursor-pointer"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-2 space-y-2 pt-2 border-t border-black/10">
            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {(post.comments || []).map((cm) => (
                <div key={cm.id} className="bg-black/5 p-1.5 rounded-lg text-[11px]">
                  <div className="flex justify-between font-bold text-[10px] opacity-70">
                    <span>{cm.author}</span>
                    <span>{cm.timestamp}</span>
                  </div>
                  <div className="mt-0.5">{cm.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitComment} className="flex items-center gap-1">
              <input
                type="text"
                placeholder="댓글을 입력하세요..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full bg-black/5 text-xs rounded-lg px-2 py-1 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-lg font-bold hover:bg-indigo-500"
              >
                등록
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: DRAGGABLE CANVAS POST ---
function DraggableCanvasPost({ post, onUpdatePos, ...props }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: post.x || 50, y: post.y || 50 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onUpdatePos(position.x, position.y);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, onUpdatePos]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className={`w-72 z-20 transition-shadow ${isDragging ? 'shadow-2xl scale-105 z-30' : ''}`}
    >
      <PostCard post={post} {...props} />
    </div>
  );
}