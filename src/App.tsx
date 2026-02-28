import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Clock, Edit2, Trash2, Plus, Check, X, Camera, Image as ImageIcon, Sparkles, Map, Download, Loader2, Bot, CheckCircle, AlertTriangle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// --- FIREBASE SETUP CỦA BẠN ---
const firebaseConfig = {
  apiKey: "AIzaSyBkqtmCYTSZ0T7xPwrBIfuSPAzyAG7WgBk",
  authDomain: "love-diary-3c82d.firebaseapp.com",
  projectId: "love-diary-3c82d",
  storageBucket: "love-diary-3c82d.firebasestorage.app",
  messagingSenderId: "332713958485",
  appId: "1:332713958485:web:164862278027326bb1c8dc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPER FUNCTIONS ---
const getZodiacSign = (dateString: any) => {
  if (!dateString) return "Chưa rõ";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day <= 19) || (month === 12 && day >= 22)) return "Ma Kết ♑";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Bảo Bình ♒";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Song Ngư ♓";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Bạch Dương ♈";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Kim Ngưu ♉";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Song Tử ♊";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cự Giải ♋";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Sư Tử ♌";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Xử Nữ ♍";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Thiên Bình ♎";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Bọ Cạp ♏";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Nhân Mã ♐";
  return "Chưa rõ";
};

const calculateDays = (startDate: any) => {
  if (!startDate) return 0;
  const start = new Date(startDate) as any;
  const today = new Date() as any;
  const diffTime = Math.abs(today - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Hàm nén ảnh trước khi tải lên Cloud
const compressImage = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  });
};

// --- GEMINI AI SETUP ---
const callGeminiAPI = async (prompt: string) => {
  const apiKey = "AIzaSyBSZD_3aC-VhtGBCaPW1RJIGss-uMfVxEE";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  const backoff = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i <= backoff.length; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      if (i === backoff.length) return "Đã có lỗi xảy ra. Thử lại sau nhé!";
      await delay(backoff[i]);
    }
  }
};

const FloatingBackground = () => {
  const icons = ['🐧', '🦕', '🦖', '💖', '✨'];
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      left: `${Math.random() * 100}vw`,
      animationDuration: `${15 + Math.random() * 20}s`,
      animationDelay: `-${Math.random() * 20}s`,
      fontSize: `${1.5 + Math.random() * 1.5}rem`,
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(110vh) rotate(0deg) scale(0.8); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-20vh) rotate(360deg) scale(1.2); opacity: 0; }
        }
        .floating-item {
          position: absolute;
          animation-name: floatUp;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
      {elements.map((el) => (
        <div key={el.id} className="floating-item" style={{ left: el.left, animationDuration: el.animationDuration, animationDelay: el.animationDelay, fontSize: el.fontSize }}>
          {el.icon}
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isDbReady, setIsDbReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState('2023-01-01');
  const [isEditingStart, setIsEditingStart] = useState(false);
  
  const [profiles, setProfiles] = useState<any>({
    person1: { name: 'Người ấy', dob: '2000-05-15', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    person2: { name: 'Mình', dob: '1999-11-20', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' }
  });
  const [editingProfile, setEditingProfile] = useState<string | null>(null);

  const [wishes, setWishes] = useState<any[]>([]);
  const [newWish, setNewWish] = useState({ author: '', text: '' });

  const [memories, setMemories] = useState<any[]>([]);
  const [newMemory, setNewMemory] = useState({ imageUrl: '', date: '', text: '' });
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  const [bucketList, setBucketList] = useState<any[]>([]);
  const [newBucketItem, setNewBucketItem] = useState('');

  const [viewingMemory, setViewingMemory] = useState<any>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        setAuthError(null);
      } catch (err: any) {
        console.error("Auth error:", err);
        if (err.code === 'auth/configuration-not-found' || err.message.includes('configuration-not-found')) {
           setAuthError("Bạn chưa bật quyền Đăng nhập Ẩn danh (Anonymous) trên Firebase!");
        } else if (err.code === 'auth/unauthorized-domain') {
           setAuthError("Tên miền hiện tại chưa được cấp quyền trong Firebase Authentication.");
        } else {
           setAuthError(`Lỗi Firebase: ${err.message}`);
        }
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && authError) {
        setIsDbReady(false);
      }
    });
    
    return () => unsubscribe();
  }, [authError]);

  useEffect(() => {
    if (!user) return;

    // 1. Đồng bộ Cài đặt & Thông tin
    const unsubSettings = onSnapshot(
      collection(db, 'love_settings'),
      (snapshot) => {
        let found = false;
        snapshot.forEach((docSnap) => {
          if (docSnap.id === 'main') {
            const data = docSnap.data();
            if (data.startDate) setStartDate(data.startDate);
            if (data.profiles) setProfiles(data.profiles);
            found = true;
          }
        });
        if (!found) {
          setDoc(doc(db, 'love_settings', 'main'), { startDate, profiles });
        }
        setIsDbReady(true);
      },
      (err) => {
        console.error(err);
        setAuthError("Lỗi đọc dữ liệu Firestore. Bạn đã cấp quyền Rules chưa?");
      }
    );

    // 2. Đồng bộ Lời nhắn
    const unsubWishes = onSnapshot(
      collection(db, 'love_wishes'),
      (snapshot) => {
        const w: any[] = [];
        snapshot.forEach(d => w.push({ id: d.id, ...d.data() }));
        w.sort((a, b) => b.timestamp - a.timestamp);
        setWishes(w);
      },
      (err) => console.error(err)
    );

    // 3. Đồng bộ Kỉ niệm
    const unsubMemories = onSnapshot(
      collection(db, 'love_memories'),
      (snapshot) => {
        const m: any[] = [];
        snapshot.forEach(d => m.push({ id: d.id, ...d.data() }));
        m.sort((a, b) => b.timestamp - a.timestamp);
        setMemories(m);
      },
      (err) => console.error(err)
    );

    // 4. Đồng bộ Bucket List
    const unsubBucket = onSnapshot(
      collection(db, 'love_bucketList'),
      (snapshot) => {
        const b: any[] = [];
        snapshot.forEach(d => b.push({ id: d.id, ...d.data() }));
        b.sort((a, b) => a.timestamp - b.timestamp);
        setBucketList(b);
      },
      (err) => console.error(err)
    );

    return () => { unsubSettings(); unsubWishes(); unsubMemories(); unsubBucket(); };
  }, [user]);

  // --- HANDLERS LƯU DỮ LIỆU LÊN ĐÁM MÂY ---
  const updateSettings = async (newProfiles: any, newStartDate: any) => {
    if (!user) return;
    await setDoc(doc(db, 'love_settings', 'main'), {
      profiles: newProfiles || profiles,
      startDate: newStartDate || startDate
    }, { merge: true });
  };

  const saveStartDate = () => {
    updateSettings(null, startDate);
    setIsEditingStart(false);
  };

  const handleProfileChange = (person: string, field: string, value: string) => {
    const updatedProfiles = {
      ...profiles,
      [person]: { ...profiles[person], [field]: value }
    };
    setProfiles(updatedProfiles);
    updateSettings(updatedProfiles, null);
  };

  const handleProfileImageUpload = async (person: string, e: any) => {
    const file = e.target.files[0];
    if (file) {
      showToast('Đang tải ảnh lên đám mây... ☁️');
      const base64 = await compressImage(file, 400);
      handleProfileChange(person, 'avatar', base64);
      showToast('Cập nhật avatar thành công! ✨');
    }
  };

  const handleAddWish = async () => {
    if (newWish.author && newWish.text && user) {
      const id = Date.now().toString();
      const today = new Date().toISOString().split('T')[0];
      await setDoc(doc(db, 'love_wishes', id), {
        ...newWish,
        date: today,
        timestamp: Date.now()
      });
      setNewWish({ author: '', text: '' });
      showToast('Đã gửi lời nhắn thành công! 💕');
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (user) await deleteDoc(doc(db, 'love_wishes', id));
  };

  const handleMemoryImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      showToast('Đang xử lý ảnh... 🖼️');
      const base64 = await compressImage(file, 800);
      setNewMemory({ ...newMemory, imageUrl: base64 });
    }
  };

  const handleAddMemory = async () => {
    if (newMemory.imageUrl && newMemory.date && newMemory.text && user) {
      const id = Date.now().toString();
      await setDoc(doc(db, 'love_memories', id), {
        imageUrl: newMemory.imageUrl,
        date: newMemory.date,
        text: newMemory.text,
        timestamp: Date.now()
      });
      setNewMemory({ imageUrl: '', date: '', text: '' });
      setIsAddingMemory(false);
      showToast('Đã lưu kỉ niệm mới vào đám mây! ✨');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (user) await deleteDoc(doc(db, 'love_memories', id));
  };

  const handleToggleBucket = async (id: string, currentStatus: boolean) => {
    if (user) {
      await setDoc(doc(db, 'love_bucketList', id), {
        completed: !currentStatus
      }, { merge: true });
    }
  };

  const handleAddBucketItem = async () => {
    if (newBucketItem.trim() && user) {
      const id = Date.now().toString();
      await setDoc(doc(db, 'love_bucketList', id), {
        text: newBucketItem,
        completed: false,
        timestamp: Date.now()
      });
      setNewBucketItem('');
    }
  };

  const handleDeleteBucketItem = async (id: string) => {
    if (user) await deleteDoc(doc(db, 'love_bucketList', id));
  };

  const handleDownloadImage = (e: any, memory: any) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = memory.imageUrl;
    link.download = `love-memory-${memory.date}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã tải ảnh về máy! 📥');
  };

  const handleGenerateMessage = async () => {
    if (!newWish.author) {
      setNewWish(prev => ({ ...prev, text: "Hãy chọn tên bạn trước khi nhờ AI viết nhé! 💕" }));
      return;
    }
    setIsGeneratingMessage(true);
    const prompt = `Bạn là một trợ lý tình yêu dễ thương. Hãy viết một câu chúc hoặc lời nhắn tình yêu thật ngọt ngào, lãng mạn, ngắn gọn (dưới 25 từ) bằng tiếng Việt cho người yêu. Lời nhắn này là từ người tên "${newWish.author}". Có thể thêm vài emoji đáng yêu (như 🐧, 🦖, 💖). Chỉ trả về nội dung lời nhắn.`;
    const result = await callGeminiAPI(prompt);
    setNewWish(prev => ({ ...prev, text: result?.replace(/^"|"$/g, '').trim() || '' }));
    setIsGeneratingMessage(false);
  };

  const handleGenerateBucketIdea = async () => {
    setIsGeneratingIdea(true);
    const prompt = `Gợi ý 1 hoạt động hẹn hò, đi chơi, hoặc việc làm chung lãng mạn, thú vị, độc đáo cho cặp đôi (dưới 15 từ) bằng tiếng Việt để thêm vào danh sách Bucket List. Ví dụ: "Cùng nhau đi cắm trại ngắm sao", "Nấu một bữa tối lãng mạn". Chỉ trả về nội dung hoạt động, không cần giải thích.`;
    const result = await callGeminiAPI(prompt);
    setNewBucketItem(result?.replace(/^"|"$/g, '').trim() || '');
    setIsGeneratingIdea(false);
  };

  // --- ERROR & LOADING UI ---
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 p-6">
        <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-red-100 text-center animate-in zoom-in-95">
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl font-extrabold text-red-600 mb-3">Ối, Lỗi Xác Thực!</h2>
          <p className="text-gray-700 mb-6 font-medium text-lg leading-relaxed">{authError}</p>
          
          <div className="text-left bg-red-50/80 p-6 rounded-3xl text-sm text-red-900 space-y-3 border border-red-200">
            <p className="font-bold text-base flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Cách khắc phục nhanh:</p>
            <ol className="list-decimal list-inside space-y-2 ml-1">
              <li>Mở tab mới, vào <b>Firebase Console</b>.</li>
              <li>Truy cập dự án <b>love-diary-3c82d</b> của bạn.</li>
              <li>Chọn menu <b>Authentication</b> bên trái.</li>
              <li>Chuyển sang tab <b>Sign-in method</b>.</li>
              <li>Tìm mục <b>Anonymous</b> và chuyển sang <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Enable</span>.</li>
              <li>Lưu lại và <button onClick={() => window.location.reload()} className="text-blue-500 font-bold hover:underline">tải lại trang này</button>.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
        <Heart className="w-16 h-16 text-pink-500 animate-pulse fill-current mb-4" />
        <p className="text-pink-500 font-bold text-lg animate-pulse tracking-wide">Đang kết nối trái tim...</p>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-50 to-purple-100 font-sans text-gray-800 pb-20">
      <FloatingBackground />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/40 shadow-sm px-4 md:px-8 py-3 flex justify-between items-center h-16 md:h-20">
        <div className="flex items-center cursor-pointer h-full" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-10 md:h-12 w-auto object-contain mr-3" 
            onError={(e: any) => { e.target.src = "https://placehold.co/100x100/ff6b6b/white?text=Logo"; }} 
          />
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 text-2xl md:text-3xl">
            Love Diary
          </span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm md:text-base font-bold text-gray-600">
          <a href="#profiles" className="hover:text-pink-500 transition-colors">Profile</a>
          <a href="#wishes" className="hover:text-pink-500 transition-colors">Messages</a>
          <a href="#memories" className="hover:text-pink-500 transition-colors">Memories</a>
          <a href="#bucketlist" className="hover:text-pink-500 transition-colors">Bucket List</a>
        </div>
      </nav>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-24 right-4 md:right-8 z-50 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-pink-100 flex items-center animate-in slide-in-from-right-8 fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="font-medium text-gray-700">{toast}</span>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 md:pt-36">
        
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4 drop-shadow-sm pb-2" style={{ fontFamily: 'cursive, sans-serif' }}>
            Chuyện đôi mình 💕
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">Khắc ghi từng khoảnh khắc, gói trọn cả yêu thương ✨</p>
        </div>

        {/* PROFILES */}
        <div id="profiles" className="relative grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12 mb-16">
          {['person1', 'person2'].map((personKey) => (
            <div key={personKey} className="bg-white/60 hover:bg-white/80 transition-all duration-300 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/60 relative overflow-hidden group hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingProfile(editingProfile === personKey ? null : personKey)}
                  className="p-2.5 bg-white/90 rounded-full text-gray-500 hover:text-pink-500 shadow-md transition-colors"
                >
                  {editingProfile === personKey ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative mb-5">
                  <img 
                    src={profiles[personKey].avatar} 
                    alt="Avatar" 
                    className="w-36 h-36 rounded-full object-cover border-[6px] border-white shadow-lg transition-transform duration-500 group-hover:scale-105"
                  />
                  {editingProfile === personKey && (
                    <label className="absolute bottom-2 right-2 bg-pink-500 text-white p-2.5 rounded-full cursor-pointer hover:bg-pink-600 shadow-lg transition-transform hover:scale-110">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProfileImageUpload(personKey, e)} />
                    </label>
                  )}
                </div>

                {editingProfile === personKey ? (
                  <div className="w-full space-y-3 mt-2">
                    <input 
                      type="text" 
                      value={profiles[personKey].name} 
                      onChange={(e) => handleProfileChange(personKey, 'name', e.target.value)}
                      className="w-full text-center text-xl font-bold bg-white/70 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                    <input 
                      type="date" 
                      value={profiles[personKey].dob} 
                      onChange={(e) => handleProfileChange(personKey, 'dob', e.target.value)}
                      className="w-full text-center text-gray-600 bg-white/70 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-extrabold text-gray-800 mb-2">{profiles[personKey].name}</h3>
                    <div className="flex flex-col items-center text-gray-600 space-y-1.5 mt-2 bg-white/50 px-6 py-3.5 rounded-3xl w-full border border-white/40">
                      <div className="flex items-center font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Sinh nhật: {new Date(profiles[personKey].dob).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center font-medium">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-500" /> {getZodiacSign(profiles[personKey].dob)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* HEART IN THE MIDDLE */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-full shadow-2xl border-2 border-pink-100 flex items-center justify-center transition-transform hover:scale-110">
            <Heart className="w-10 h-10 md:w-12 md:h-12 text-pink-500 fill-current animate-pulse drop-shadow-md" />
          </div>
        </div>

        {/* DAYS COUNTER */}
        <div className="text-center mb-16 relative">
          <div className="inline-block bg-white/70 backdrop-blur-md rounded-[3rem] px-10 py-8 shadow-2xl border border-white/60 transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Heart className="text-red-400 animate-pulse w-6 h-6 fill-current opacity-80" />
              <span className="text-xl font-semibold text-gray-600 uppercase tracking-wider">Đã bên nhau</span>
              <Heart className="text-red-400 animate-pulse w-6 h-6 fill-current opacity-80" />
            </div>
            <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-red-400 to-purple-500 my-4 drop-shadow-sm">
              {calculateDays(startDate)}
            </div>
            <div className="text-xl text-gray-500 font-bold tracking-widest uppercase">Ngày</div>
            
            <div className="mt-6 flex items-center justify-center text-sm text-gray-600 bg-white/60 py-2.5 px-6 rounded-full inline-flex border border-white/50 shadow-sm">
              <Calendar className="w-4 h-4 mr-2 text-pink-500" />
              {isEditingStart ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-b-2 border-pink-400 focus:outline-none text-gray-700 font-medium pb-1"
                  />
                  <button onClick={saveStartDate} className="text-green-500 hover:text-green-600 ml-2"><Check className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Bắt đầu từ: {new Date(startDate).toLocaleDateString('vi-VN')}</span>
                  <button onClick={() => setIsEditingStart(true)} className="text-gray-400 hover:text-pink-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MESSAGES & WISHES */}
        <div id="wishes" className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/60 mb-16 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
            <Heart className="w-7 h-7 mr-3 text-pink-500 fill-current" /> Lời nhắn gửi cho nhau
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-pink-50/70 p-5 rounded-[2rem] border border-pink-100 shadow-inner">
            <select 
              value={newWish.author} 
              onChange={(e) => setNewWish({...newWish, author: e.target.value})}
              className="px-5 py-3 rounded-2xl bg-white border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700 font-medium"
            >
              <option value="">Ai đang viết?</option>
              <option value={profiles.person1.name}>{profiles.person1.name}</option>
              <option value={profiles.person2.name}>{profiles.person2.name}</option>
            </select>
            
            <div className="flex-1 relative flex items-center">
              <input 
                type="text" 
                placeholder="Viết một lời chúc ngọt ngào..." 
                value={newWish.text}
                onChange={(e) => setNewWish({...newWish, text: e.target.value})}
                className="w-full px-5 py-3 pr-12 rounded-2xl bg-white border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-700"
                onKeyPress={(e) => e.key === 'Enter' && handleAddWish()}
              />
              <button
                onClick={handleGenerateMessage}
                disabled={isGeneratingMessage}
                title="✨ Nhờ AI viết lời ngọt ngào"
                className="absolute right-2 p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all disabled:opacity-50"
              >
                {isGeneratingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
              </button>
            </div>

            <button 
              onClick={handleAddWish}
              disabled={!newWish.author || !newWish.text}
              className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Gửi
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {wishes.map((wish) => (
              <div key={wish.id} className="bg-white/90 p-5 rounded-[2rem] shadow-sm border border-gray-100 relative group hover:shadow-md transition-all hover:-translate-y-1">
                <button 
                  onClick={() => handleDeleteWish(wish.id)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="font-bold text-pink-500 mb-2 text-lg">{wish.author}</div>
                <p className="text-gray-700 italic leading-relaxed">"{wish.text}"</p>
                <div className="text-xs font-medium text-gray-400 mt-4 text-right flex items-center justify-end">
                  <Clock className="w-3 h-3 mr-1" /> {new Date(wish.date).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MEMORY GALLERY */}
        <div id="memories" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center bg-white/70 backdrop-blur-md py-3 px-8 rounded-[2rem] shadow-xl border border-white/60">
              <ImageIcon className="w-7 h-7 mr-3 text-blue-500" /> Góc kỉ niệm
            </h2>
            <button 
              onClick={() => setIsAddingMemory(!isAddingMemory)}
              className="bg-white/90 backdrop-blur-md hover:bg-pink-100 text-pink-500 p-4 rounded-full shadow-lg transition-all hover:-translate-y-1 hover:scale-105 border border-white/60"
            >
              {isAddingMemory ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>

          {isAddingMemory && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/60 mb-10 animate-in fade-in slide-in-from-top-4">
              <h3 className="font-bold text-xl mb-6 text-gray-800">Thêm kỉ niệm mới ✨</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-2 border-dashed border-pink-300 rounded-[2rem] flex flex-col items-center justify-center p-6 bg-pink-50/50 text-center min-h-[250px] relative overflow-hidden group hover:bg-pink-50/80 transition-colors">
                  {newMemory.imageUrl ? (
                    <img src={newMemory.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <Camera className="w-8 h-8 text-pink-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-4">Tải ảnh kỉ niệm từ thiết bị</p>
                    </>
                  )}
                  <label className="bg-gradient-to-r from-pink-400 to-pink-500 text-white px-6 py-2.5 rounded-full cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all relative z-10 font-medium mt-4">
                    Chọn ảnh
                    <input type="file" accept="image/*" className="hidden" onChange={handleMemoryImageUpload} />
                  </label>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Ngày tháng</label>
                    <input 
                      type="date" 
                      value={newMemory.date}
                      onChange={(e) => setNewMemory({...newMemory, date: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-white/70 border border-white focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Câu chuyện kỉ niệm</label>
                    <textarea 
                      rows={3}
                      value={newMemory.text}
                      onChange={(e) => setNewMemory({...newMemory, text: e.target.value})}
                      placeholder="Hôm nay chúng mình đã..."
                      className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-white focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none shadow-sm"
                    />
                  </div>
                  <button 
                    onClick={handleAddMemory}
                    disabled={!newMemory.imageUrl || !newMemory.date || !newMemory.text}
                    className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none text-lg mt-2"
                  >
                    Lưu lại khoảnh khắc
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memories.map((memory) => (
              <div 
                key={memory.id} 
                onClick={() => setViewingMemory(memory)}
                className="bg-white/80 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl border border-white/60 group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={memory.imageUrl} alt="Memory" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteMemory(memory.id); }}
                      className="bg-white/20 hover:bg-red-500 text-white p-2.5 rounded-full backdrop-blur-md transition-all hover:scale-110 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-white/50 to-white/10">
                  <div className="flex items-center text-xs font-bold text-pink-500 mb-3 bg-pink-50/80 px-3 py-1.5 rounded-full self-start shadow-sm border border-pink-100">
                    <Clock className="w-3.5 h-3.5 mr-1.5 inline" /> {new Date(memory.date).toLocaleDateString('vi-VN')}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm font-medium line-clamp-3">{memory.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BUCKET LIST */}
        <div id="bucketlist" className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/60 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-3 flex items-center">
            <Map className="w-7 h-7 mr-3 text-green-500" /> Danh sách ước muốn
          </h2>
          <p className="text-gray-500 mb-6 text-base font-medium ml-1">Những điều chúng mình sẽ cùng nhau thực hiện ✈️</p>
          
          <div className="space-y-4 mb-8">
            {bucketList.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border shadow-sm group hover:-translate-y-0.5 ${item.completed ? 'bg-green-50/70 border-green-200' : 'bg-white/80 border-white hover:border-pink-200 hover:shadow-md'}`}>
                <div className="flex items-center cursor-pointer flex-1" onClick={() => handleToggleBucket(item.id, item.completed)}>
                  <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center mr-4 transition-colors duration-300 ${item.completed ? 'bg-green-400 border-green-400 shadow-sm' : 'border-gray-300 group-hover:border-pink-300'}`}>
                    {item.completed && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-base font-medium transition-all duration-300 ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {item.text}
                  </span>
                </div>
                <button onClick={() => handleDeleteBucketItem(item.id)} className="text-gray-300 hover:text-red-400 p-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 bg-white/50 p-2 rounded-[1.5rem] border border-white/50 shadow-inner">
            <div className="flex-1 relative flex items-center">
              <input 
                type="text" 
                value={newBucketItem}
                onChange={(e) => setNewBucketItem(e.target.value)}
                placeholder="Thêm mục tiêu mới..."
                className="w-full px-5 py-3 pr-12 rounded-2xl bg-transparent border-0 focus:outline-none text-gray-700 font-medium placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleAddBucketItem()}
              />
              <button
                onClick={handleGenerateBucketIdea}
                disabled={isGeneratingIdea}
                title="✨ Gợi ý ý tưởng hẹn hò từ AI"
                className="absolute right-2 p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-xl transition-all disabled:opacity-50"
              >
                {isGeneratingIdea ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
              </button>
            </div>
            <button 
              onClick={handleAddBucketItem}
              disabled={!newBucketItem.trim()}
              className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center"
            >
              <Plus className="w-5 h-5 font-bold" />
            </button>
          </div>
        </div>

        {/* IMAGE ZOOM MODAL */}
        {viewingMemory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingMemory(null)}>
            <div 
              className="bg-white rounded-[2.5rem] overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row relative shadow-2xl animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setViewingMemory(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-500 text-white p-2.5 rounded-full transition-colors backdrop-blur-md shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full md:w-3/5 bg-black/5 flex items-center justify-center min-h-[40vh] md:min-h-[60vh] relative group overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-xl z-0">
                  <img src={viewingMemory.imageUrl} alt="Blur background" className="w-full h-full object-cover opacity-30" />
                </div>
                <img src={viewingMemory.imageUrl} alt="Memory Zoom" className="max-w-full max-h-[50vh] md:max-h-[85vh] object-contain relative z-10 shadow-2xl" />
              </div>
              
              <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col bg-white overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Chi tiết kỉ niệm ✨</h3>
                <div className="flex items-center text-sm font-bold text-pink-500 mb-6 bg-pink-50 inline-flex px-4 py-2 rounded-2xl self-start shadow-sm border border-pink-100">
                  <Clock className="w-4 h-4 mr-2 inline" /> {new Date(viewingMemory.date).toLocaleDateString('vi-VN')}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed flex-1 mb-8 whitespace-pre-line">{viewingMemory.text}</p>
                
                <button 
                  onClick={(e) => handleDownloadImage(e, viewingMemory)}
                  className="w-full bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center text-lg mt-auto"
                >
                  <Download className="w-6 h-6 mr-3" /> Tải ảnh về máy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-sm font-medium text-gray-500 pb-8 flex flex-col items-center justify-center space-y-3 relative z-10">
          <span>Made with ❤️ for our endless love</span>
          <span className="bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-white/60 transition-transform hover:-translate-y-1">
            dev by <strong className="text-pink-500 font-extrabold text-base">Trantus🦖</strong>
          </span>
        </div>

      </div>
    </div>
  );
}
