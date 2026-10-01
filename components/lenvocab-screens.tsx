'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, Camera, Check, CheckCircle2, ChevronRight, Clock3, Flame, Headphones, ImagePlus, Lightbulb, LockKeyhole, Mail, Mic2, MoreHorizontal, RotateCcw, Search, Settings2, Share2, Sparkles, Volume2, X } from 'lucide-react'
import { allWords, getScene, getWord, scenes, type Word } from '@/lib/lenvocab-data'

export type Screen = 'home' | 'camera' | 'results' | 'word' | 'saved' | 'review' | 'flashcards' | 'quiz' | 'history' | 'profile' | 'onboarding' | 'auth'
export type ScanObject = { term: string; meaning: string; note: string; box: { x1: number; y1: number; x2: number; y2: number } }
export type ScanEntry = { sceneId: string; date: string; id: number; image?: string; objects?: ScanObject[] }

export type ScreenProps = {
  screen: Screen
  navigate: (screen: Screen) => void
  sceneId: string
  setSceneId: (id: string) => void
  wordId: string
  wordBack: Screen
  openWord: (id: string) => void
  saved: string[]
  toggleSaved: (id: string) => void
  history: ScanEntry[]
  scan: () => Promise<void>
  isScanning: boolean
  scanError: string | null
  setScanError: (message: string | null) => void
  scanObjects: ScanObject[] | null
  setScanObjects: (objects: ScanObject[] | null) => void
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  customImage: string | null
  setCustomImage: (url: string | null) => void
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action && <button className="text-link" onClick={onAction}>{action} <ArrowRight size={16} /></button>}</div>
}

function TopBar({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
  return <header className="top-bar"><button className="icon-button" onClick={onBack} aria-label="Quay lại"><ArrowLeft size={20} /></button><span>{title}</span><div className="top-bar-action">{action}</div></header>
}

function WordRow({ word, saved, onOpen, onSave }: { word: Word; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return <div className="word-row"><button className="word-row-main" onClick={onOpen}><span className="word-icon">{word.term.slice(0, 1).toUpperCase()}</span><span className="word-text"><strong>{word.term}</strong><small>{word.type} · {word.meaning}</small></span></button><button className={`save-icon ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Bỏ lưu ${word.term}` : `Lưu ${word.term}`} onClick={onSave}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /></button></div>
}

export function HomeScreen({ navigate, openWord, saved, toggleSaved }: ScreenProps) {
  return <div className="screen home-screen">
    <div className="home-top"><div className="brand"><span className="brand-mark"><Sparkles size={17} strokeWidth={2.5} /></span><span>lenvocab<span className="brand-dot">.</span></span></div><button className="avatar" onClick={() => navigate('profile')} aria-label="Mở hồ sơ">A</button></div>
    <div className="greeting"><span className="eyebrow">THỨ NĂM, 01 THÁNG 10</span><h1>Chào An, <span className="wave">✳</span><br/>hôm nay học gì?</h1><p>Thế giới quanh bạn luôn có điều mới để học.</p></div>
    <button className="scan-hero" onClick={() => navigate('camera')}><div className="scan-hero-copy"><span className="pill-light"><Sparkles size={13} /> HỌC TỪ THẾ GIỚI THẬT</span><strong>Chụp một tấm ảnh.<br/>Học cả thế giới.</strong><span className="scan-hero-cta">Bắt đầu quét <ArrowRight size={16} /></span></div><div className="hero-visual"><div className="hero-image"><Image src="/scenes/desk.png" alt="Bàn học với sổ tay, cốc cà phê và cây nhỏ" fill sizes="180px" /></div><span className="floating-label label-one">notebook <Check size={11} /></span><span className="floating-label label-two">mug <Check size={11} /></span><span className="focus-corner corner-tl"/><span className="focus-corner corner-br"/></div></button>
    <div className="stats-strip"><div className="stat"><span className="stat-icon flame"><Flame size={18} fill="currentColor" /></span><span><strong>7 ngày</strong><small>Chuỗi học tập</small></span></div><span className="stat-divider"/><div className="stat"><span className="stat-icon book"><BookOpen size={18} /></span><span><strong>{saved.length} từ</strong><small>Đã lưu</small></span></div></div>
    <SectionHeading eyebrow="MỘT CHÚT MỖI NGÀY" title="Ôn tập hôm nay" action="Xem thêm" onAction={() => navigate('review')} />
    <button className="review-card" onClick={() => navigate('flashcards')}><span className="review-card-art"><span>Aa</span><span className="tiny-star">✳</span></span><span className="review-card-copy"><strong>5 phút cho trí nhớ</strong><small>Ôn lại những từ bạn đã gặp</small><span>Bắt đầu ôn tập <ArrowRight size={14}/></span></span><ChevronRight size={19} className="review-chevron" /></button>
    <SectionHeading title="Từ vựng gần đây" action="Tất cả" onAction={() => navigate('saved')} />
    <div className="word-list compact">{allWords.slice(0, 2).map(word => <WordRow key={word.id} word={word} saved={saved.includes(word.id)} onOpen={() => openWord(word.id)} onSave={() => toggleSaved(word.id)} />)}</div>
    <div className="home-footnote">Mỗi điều bạn nhìn thấy là một cơ hội để học.</div>
  </div>
}

export function CameraScreen({ navigate, sceneId, setSceneId, scan, isScanning, scanError, setScanError, selectedFile, setSelectedFile, customImage, setCustomImage }: ScreenProps) {
  const scene = getScene(sceneId)
  const chooseImage = (file?: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setScanError('Chọn ảnh JPG, PNG hoặc WebP dưới 8 MB nhé.')
      return
    }
    setSelectedFile(file)
    setCustomImage(URL.createObjectURL(file))
    setScanError(null)
  }
  const useSample = (id: string) => {
    setSceneId(id)
    setSelectedFile(null)
    setCustomImage(null)
    setScanError(null)
  }
  return <div className="screen camera-screen"><TopBar title="Quét thế giới" onBack={() => navigate('home')} action={<button className="icon-button" onClick={() => navigate('history')} aria-label="Lịch sử quét"><Clock3 size={20}/></button>} />
    <div className="camera-intro"><span className="eyebrow">NHÌN · CHỤP · HỌC</span><h1>Mọi thứ đều<br/>có thể thành bài học.</h1><p>Thử cảnh mẫu với 5 vật thể đã đánh dấu, hoặc tải ảnh để AI nhận diện và ghi chú từng vật thể.</p></div>
    <div className="camera-view"><Image src={customImage ?? scene.image} alt={customImage ? 'Ảnh bạn đã chọn' : scene.title} fill sizes="(max-width: 480px) 100vw, 400px" unoptimized={!!customImage} /><div className="camera-shade"/><span className="camera-top-tag"><span className="live-dot"/> {customImage ? 'ẢNH CỦA BẠN' : 'CẢNH MẪU'}</span><span className="camera-corner c1"/><span className="camera-corner c2"/><span className="camera-corner c3"/><span className="camera-corner c4"/><div className="camera-hint"><Sparkles size={15}/> {isScanning ? 'Đang tìm các vật thể trong ảnh...' : 'Một ảnh · tối đa 5 vật thể'}</div></div>
    <div className="capture-controls"><label className="gallery-control" aria-label="Chọn ảnh hoặc chụp ảnh"><ImagePlus size={22}/><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { chooseImage(e.target.files?.[0]); e.target.value = '' }} /></label><button className="shutter" onClick={scan} disabled={isScanning} aria-label={isScanning ? 'Đang quét ảnh' : 'Quét ảnh'}><span>{isScanning ? <span className="scan-spinner"/> : <Camera size={26}/>}</span></button><button className="gallery-control" onClick={() => useSample(sceneId)} aria-label="Dùng cảnh mẫu"><RotateCcw size={21}/></button></div>
    <p className="camera-caption">{selectedFile ? `Đã chọn: ${selectedFile.name}` : 'Chọn một cảnh để thử ngay'}</p>
    {scanError && <p className="scan-error" role="alert">{scanError}</p>}
    <div className="scene-picker">{scenes.map(item => <button key={item.id} className={`scene-thumb ${sceneId === item.id && !customImage ? 'selected' : ''}`} onClick={() => useSample(item.id)} aria-label={`Chọn cảnh ${item.title}`}><Image src={item.image} alt="" fill sizes="64px"/><span>{item.title}</span></button>)}</div>
  </div>
}

export function ResultsScreen({ navigate, sceneId, customImage, scanObjects }: ScreenProps) {
  const scene = getScene(sceneId)
  const [activeIndex, setActiveIndex] = useState(0)
  const [imageRatio, setImageRatio] = useState(768 / 1376)
  const objects = scanObjects ?? []
  const active = objects[activeIndex] ?? objects[0]
  return <div className="screen results-screen"><TopBar title="Kết quả quét" onBack={() => navigate('camera')} action={<span className="practice-counter">{objects.length}/5</span>}/>
    <div className="scan-result-intro"><span className="eyebrow">{customImage ? 'NHẬN DIỆN ẢNH CỦA BẠN' : 'MINH HỌA TRÊN CẢNH MẪU'}</span><h1>{objects.length ? `${objects.length} vật thể trong ảnh` : 'Chưa tìm thấy vật thể'}</h1><p>{objects.length ? 'Chạm vào từng khung trên ảnh để xem ghi chú.' : 'Thử chụp ảnh rõ hơn hoặc chọn một cảnh khác nhé.'}</p></div>
    <div className="scan-photo" style={{ aspectRatio: imageRatio }}>
      <Image src={customImage ?? scene.image} alt={customImage ? 'Ảnh của bạn với các vùng vật thể được đánh dấu' : `${scene.title} với các vùng vật thể được đánh dấu`} fill sizes="(max-width: 480px) 100vw, 400px" unoptimized={!!customImage} onLoad={event => { const image = event.currentTarget; if (image.naturalWidth && image.naturalHeight) setImageRatio(image.naturalWidth / image.naturalHeight) }}/>
      {objects.map((object, index) => <button key={`${object.term}-${index}`} className={`object-box ${activeIndex === index ? 'active' : ''}`} style={{ left: `${object.box.x1 / 10}%`, top: `${object.box.y1 / 10}%`, width: `${(object.box.x2 - object.box.x1) / 10}%`, height: `${(object.box.y2 - object.box.y1) / 10}%` }} onClick={() => setActiveIndex(index)} aria-label={`Vật thể ${index + 1}: ${object.term}, ${object.meaning}`} aria-pressed={activeIndex === index}><span className="object-box-label"><b>{String(index + 1).padStart(2, '0')}</b> {object.term}</span></button>)}
      <span className="scan-photo-count"><Sparkles size={13}/> {objects.length} VẬT THỂ</span>
    </div>
    {active && <div className="object-detail" aria-live="polite"><span className="object-detail-number">{String(activeIndex + 1).padStart(2, '0')}</span><div><span className="eyebrow">VẬT THỂ ĐANG CHỌN</span><h2>{active.term} <span>· {active.meaning}</span></h2><p>{active.note}</p></div></div>}
    <div className="result-list-heading"><span>GHI CHÚ TỪNG VẬT THỂ</span><span>{objects.length} VẬT THỂ</span></div>
    <div className="object-list">{objects.map((object, index) => <button key={`${object.term}-note-${index}`} className={`object-note ${activeIndex === index ? 'active' : ''}`} onClick={() => setActiveIndex(index)}><span className="object-note-index">{String(index + 1).padStart(2, '0')}</span><span><strong>{object.term} <small>· {object.meaning}</small></strong><span>{object.note}</span></span><ChevronRight size={16}/></button>)}</div>
    <div className="context-note"><Lightbulb size={18}/><span>{customImage ? 'Vùng đánh dấu do AI ước lượng; hãy kiểm tra nếu vật thể bị nhận diện sai.' : 'Đây là vị trí minh họa được chuẩn bị riêng cho cảnh mẫu.'}</span></div>
    <button className="primary-button result-save" onClick={() => navigate('camera')}>Quét ảnh khác <Camera size={18}/></button>
  </div>
}

export function WordScreen({ navigate, wordId, wordBack, saved, toggleSaved }: ScreenProps) {
  const word = getWord(wordId)
  const scene = getScene(word.scene)
  const isSaved = saved.includes(word.id)
  const speak = () => { if (typeof window !== 'undefined' && 'speechSynthesis' in window) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(word.term); utterance.lang = 'en-US'; window.speechSynthesis.speak(utterance) } }
  return <div className="screen detail-screen"><TopBar title="Khám phá từ vựng" onBack={() => navigate(wordBack)} action={<button className="icon-button" onClick={() => toggleSaved(word.id)} aria-label={isSaved ? 'Bỏ lưu từ' : 'Lưu từ'}><Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} /></button>}/>
    <div className="word-feature"><span className="detail-chip">{word.level} · {word.type.toUpperCase()}</span><h1>{word.term}</h1><div className="pronunciation"><span>{word.ipa}</span><button onClick={speak} aria-label={`Nghe phát âm ${word.term}`}><Volume2 size={20}/></button></div><span className="detail-decoration">Aa.</span></div>
    <div className="detail-body"><div className="detail-block"><span className="eyebrow">NGHĨA TIẾNG VIỆT</span><h2>{word.meaning}</h2></div><div className="detail-block"><span className="eyebrow">TRONG MỘT CÂU</span><div className="example-card"><span className="quote-mark">“</span><p>{word.example}</p><small>{word.translation}</small></div></div><div className="detail-block"><span className="eyebrow">GHI NHỚ NHANH</span><div className="tip-card"><span><Lightbulb size={20}/></span><p>{word.note}</p></div></div><div className="detail-block"><span className="eyebrow">BẠN ĐÃ GẶP TỪ NÀY Ở</span><button className="source-card" onClick={() => navigate('results')}><span className="source-photo"><Image src={scene.image} alt="" fill sizes="52px" /></span><span><strong>{scene.title}</strong><small>{scene.category}</small></span><ChevronRight size={18}/></button></div><button className={`primary-button ${isSaved ? 'saved-button' : ''}`} onClick={() => toggleSaved(word.id)}>{isSaved ? <Check size={18}/> : <Bookmark size={18}/>} {isSaved ? 'Đã lưu vào bộ từ' : 'Lưu vào bộ từ của tôi'}</button></div>
  </div>
}

export function SavedScreen({ navigate, saved, toggleSaved, openWord }: ScreenProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tất cả')
  const filters = ['Tất cả', 'Đồ vật', 'Đời sống', 'Ngoài trời']
  const words = allWords.filter(word => saved.includes(word.id)).filter(word => { const category = getScene(word.scene).category; return (filter === 'Tất cả' || (filter === 'Đồ vật' ? ['Không gian sống', 'Học tập'].includes(category) : category === filter)) && `${word.term} ${word.meaning}`.toLowerCase().includes(query.toLowerCase()) })
  return <div className="screen saved-screen"><div className="standard-header"><span className="eyebrow">BỘ SƯU TẬP CỦA BẠN</span><h1>Từ vựng đã lưu<span className="heading-period">.</span></h1><p>Một góc nhỏ lưu lại những điều bạn đã học.</p></div><div className="saved-count"><span><Bookmark size={20}/></span><strong>{saved.length} từ vựng</strong><small>đang chờ bạn ôn tập</small></div><label className="search-box"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm từ vựng..." aria-label="Tìm từ vựng" /></label><div className="filter-row" aria-label="Lọc từ vựng">{filters.map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="result-list-heading"><span>DANH SÁCH TỪ</span><span>{words.length} TỪ</span></div><div className="word-list saved-list">{words.length ? words.map(word => <WordRow key={word.id} word={word} saved onOpen={() => openWord(word.id)} onSave={() => toggleSaved(word.id)} />) : <div className="empty-state"><BookOpen size={30}/><strong>Chưa có từ nào ở đây</strong><p>Thử một bộ lọc khác hoặc quét thêm thế giới quanh bạn.</p><button onClick={() => navigate('camera')}>Quét ảnh ngay <ArrowRight size={16}/></button></div>}</div><button className="primary-button" onClick={() => navigate('flashcards')}>Ôn tập bằng flashcard <ArrowRight size={18}/></button></div>
}

export function ReviewScreen({ navigate, saved }: ScreenProps) {
  return <div className="screen review-screen"><div className="standard-header"><span className="eyebrow">LUYỆN TẬP MỖI NGÀY</span><h1>Một chút hôm nay.<br/><em>Nhớ mãi mai sau.</em></h1><p>Chọn cách học phù hợp với bạn nhé.</p></div><div className="review-progress-card"><div><span className="eyebrow">TIẾN ĐỘ HỌC TẬP</span><h2>Tiếp tục giữ nhịp!</h2><p>Bạn đang xây một thói quen thật tuyệt.</p></div><span className="progress-orb"><Flame size={27} fill="currentColor"/><strong>7</strong><small>ngày</small></span><div className="week-dots">{['T2','T3','T4','T5','T6','T7','CN'].map((day, index) => <span key={day}><i className={index < 4 ? 'done' : ''}>{index < 4 ? <Check size={11}/> : ''}</i>{day}</span>)}</div></div><SectionHeading eyebrow="CHỌN CÁCH HỌC" title="Cùng bắt đầu nào" /><button className="mode-card flash-mode" onClick={() => navigate('flashcards')}><span className="mode-art"><span>hello<span>.</span></span></span><span className="mode-content"><small>01 / GHI NHỚ</small><strong>Flashcards</strong><span>Lật thẻ, ghi nhớ từ theo nhịp của bạn.</span><b>{saved.length} từ đã lưu <ArrowRight size={15}/></b></span></button><button className="mode-card quiz-mode" onClick={() => navigate('quiz')}><span className="mode-art"><span>?</span></span><span className="mode-content"><small>02 / THỬ THÁCH</small><strong>Quiz nhanh</strong><span>Kiểm tra xem bạn nhớ được bao nhiêu.</span><b>4 câu hỏi <ArrowRight size={15}/></b></span></button><div className="review-quote">“Little by little, a little becomes a lot.”</div></div>
}

export function FlashcardsScreen({ navigate, saved }: ScreenProps) {
  const words = saved.length ? saved.map(getWord) : allWords.slice(0, 4)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const word = words[index % words.length]
  const next = () => { setIndex(value => (value + 1) % words.length); setFlipped(false) }
  return <div className="screen practice-screen"><TopBar title="Flashcards" onBack={() => navigate('review')} action={<span className="practice-counter">{index + 1}/{words.length}</span>}/><div className="practice-intro"><span className="eyebrow">LẬT THẺ ĐỂ KHÁM PHÁ</span><h1>Từng từ một,<br/>tiến xa hơn.</h1></div><div className="progress-track"><span style={{ width: `${((index + 1) / words.length) * 100}%` }}/></div><button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(value => !value)} aria-label={flipped ? 'Lật xem từ tiếng Anh' : 'Lật xem nghĩa tiếng Việt'}><span className="flashcard-top"><span>{flipped ? 'NGHĨA CỦA TỪ' : 'TỪ VỰNG SỐ ' + String(index + 1).padStart(2, '0')}</span><Sparkles size={21}/></span><span className="flashcard-center"><small>{flipped ? word.term : word.type}</small><strong>{flipped ? word.meaning : word.term}</strong><span>{flipped ? word.example : word.ipa}</span></span><span className="flashcard-bottom"><RotateCcw size={16}/> Chạm để lật thẻ</span></button><p className="practice-hint">{flipped ? 'Tuyệt lắm! Sẵn sàng cho từ tiếp theo?' : 'Hãy thử nhớ nghĩa của từ trước khi lật nhé.'}</p><button className="primary-button" onClick={next}>Từ tiếp theo <ArrowRight size={18}/></button><button className="secondary-action" onClick={() => navigate('quiz')}>Thử sức với Quiz <ChevronRight size={16}/></button></div>
}

export function QuizScreen({ navigate }: ScreenProps) {
  const questions = allWords.slice(0, 4)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const word = questions[index]
  const options = [word, questions[(index + 1) % 4], questions[(index + 2) % 4], questions[(index + 3) % 4]].sort((a, b) => (a.id.charCodeAt(0) % 5) - (b.id.charCodeAt(0) % 5))
  if (done) return <div className="screen practice-screen"><TopBar title="Kết quả Quiz" onBack={() => navigate('review')}/><div className="quiz-finish"><span className="finish-icon"><Sparkles size={37}/></span><span className="eyebrow">HOÀN THÀNH RỒI!</span><h1>Bạn làm tốt lắm!</h1><p>Mỗi lần thử là một lần bạn nhớ từ lâu hơn.</p><div className="score-ring"><strong>{score}/{questions.length}</strong><span>câu đúng</span></div><button className="primary-button" onClick={() => { setIndex(0); setScore(0); setSelected(null); setDone(false) }}>Thử lại <RotateCcw size={18}/></button><button className="secondary-action" onClick={() => navigate('review')}>Quay về ôn tập <ArrowRight size={16}/></button></div></div>
  return <div className="screen practice-screen"><TopBar title="Quiz nhanh" onBack={() => navigate('review')} action={<span className="practice-counter">{index + 1}/{questions.length}</span>}/><div className="quiz-heading"><span className="eyebrow">CÂU HỎI {String(index + 1).padStart(2, '0')}</span><h1>Từ này có nghĩa là gì?</h1><p>Chọn đáp án đúng nhất nhé.</p></div><div className="progress-track"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }}/></div><div className="quiz-word"><span>ENGLISH WORD</span><strong>{word.term}</strong><small>{word.ipa}</small></div><div className="answer-list">{options.map((option, i) => { const correct = option.id === word.id; const chosen = selected === option.id; return <button key={option.id} disabled={!!selected} className={`${selected && correct ? 'correct' : ''} ${selected && chosen && !correct ? 'incorrect' : ''}`} onClick={() => { setSelected(option.id); if (correct) setScore(value => value + 1) }}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{option.meaning}</span>{selected && correct && <CheckCircle2 size={20}/ >}{selected && chosen && !correct && <X size={19}/>}</button> })}</div>{selected && <div className={`answer-feedback ${selected === word.id ? 'positive' : ''}`}>{selected === word.id ? 'Chính xác! Bạn đang làm rất tốt.' : `Gần đúng rồi! “${word.term}” nghĩa là “${word.meaning}”.`}</div>}<button className="primary-button quiz-next" disabled={!selected} onClick={() => { if (index === questions.length - 1) setDone(true); else { setIndex(value => value + 1); setSelected(null) } }}>{index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'} <ArrowRight size={18}/></button></div>
}

export function HistoryScreen({ navigate, history, setSceneId, setCustomImage, setSelectedFile, setScanObjects }: ScreenProps) {
  return <div className="screen history-screen"><div className="standard-header"><span className="eyebrow">NHỮNG GÌ BẠN ĐÃ THẤY</span><h1>Hành trình khám phá<span className="heading-period">.</span></h1><p>Mỗi tấm ảnh, một câu chuyện từ vựng.</p></div><div className="history-summary"><span><Camera size={20}/></span><strong>{history.length} lần quét</strong><small>và còn nhiều điều đang chờ bạn</small></div><div className="result-list-heading"><span>GẦN ĐÂY</span><span>THÁNG 10</span></div><div className="history-list">{history.map(entry => { const scene = getScene(entry.sceneId); return <button key={entry.id} className="history-item" onClick={() => { setSceneId(scene.id); setCustomImage(entry.image ?? null); setSelectedFile(null); setScanObjects(entry.objects ?? null); navigate(entry.objects ? 'results' : 'camera') }}><span className="history-image"><Image src={entry.image ?? scene.image} alt="" fill sizes="76px" unoptimized={!!entry.image}/></span><span className="history-copy"><small>{entry.date}</small><strong>{entry.image ? 'Ảnh của bạn' : scene.title}</strong><span>{entry.objects ? `${entry.objects.length} vật thể đã nhận diện` : 'Cảnh mẫu · Chạm để quét'}</span></span><ChevronRight size={19}/></button> })}</div><button className="primary-button" onClick={() => navigate('camera')}>Khám phá thêm <Camera size={18}/></button></div>
}

export function ProfileScreen({ navigate, saved, history }: ScreenProps) {
  const [notification, setNotification] = useState(true)
  const [sound, setSound] = useState(true)
  return <div className="screen profile-screen"><div className="standard-header"><span className="eyebrow">GÓC CỦA BẠN</span><h1>Hồ sơ của tôi<span className="heading-period">.</span></h1></div><div className="profile-identity"><span className="profile-avatar">A</span><span><strong>An Nguyễn</strong><small>Người học tò mò · Bản demo</small></span><button onClick={() => navigate('auth')} aria-label="Xem giao diện đăng nhập"><ChevronRight size={19}/></button></div><div className="profile-stats"><div><strong>07</strong><small>ngày liên tiếp</small></div><div><strong>{saved.length.toString().padStart(2, '0')}</strong><small>từ đã lưu</small></div><div><strong>{history.length.toString().padStart(2, '0')}</strong><small>ảnh đã quét</small></div></div><div className="profile-section"><span className="eyebrow">HỌC TẬP</span><button onClick={() => navigate('saved')}><Bookmark size={19}/> Từ vựng đã lưu <ChevronRight size={18}/></button><button onClick={() => navigate('history')}><Clock3 size={19}/> Lịch sử quét <ChevronRight size={18}/></button><button onClick={() => navigate('onboarding')}><Sparkles size={19}/> Xem giới thiệu ứng dụng <ChevronRight size={18}/></button></div><div className="profile-section"><span className="eyebrow">TÙY CHỈNH</span><button role="switch" aria-checked={notification} onClick={() => setNotification(value => !value)}><Settings2 size={19}/> Nhắc nhở học tập <span className={`toggle ${notification ? 'on' : ''}`}><i/></span></button><button role="switch" aria-checked={sound} onClick={() => setSound(value => !value)}><Volume2 size={19}/> Âm thanh <span className={`toggle ${sound ? 'on' : ''}`}><i/></span></button></div><div className="profile-footer"><span>lenvocab<span className="brand-dot">.</span></span><small>Một thế giới mới trong từng từ vựng.</small><small>Giao diện mẫu · v1.0</small></div></div>
}

export function OnboardingScreen({ navigate }: ScreenProps) {
  const [step, setStep] = useState(0)
  const slides = [
    { image: '/scenes/desk.png', label: '01 / KHÁM PHÁ', title: 'Học từ chính thế giới quanh bạn.', description: 'Một góc bàn, một tấm biển hay một trang sách — tất cả đều có thể trở thành bài học tiếng Anh.' },
    { image: '/scenes/kitchen.png', label: '02 / GHI NHỚ', title: 'Nhìn thấy. Hiểu rõ. Nhớ lâu.', description: 'Từ vựng đi cùng hình ảnh, phát âm và ví dụ gần gũi để bạn học thật tự nhiên.' },
    { image: '/scenes/library.png', label: '03 / TIẾN BỘ', title: 'Một chút mỗi ngày, giỏi hơn mỗi ngày.', description: 'Lưu từ yêu thích, ôn bằng flashcard và thử sức với những câu quiz nhỏ.' },
  ]
  const slide = slides[step]
  return <div className="screen onboarding-screen"><div className="onboard-top"><span className="brand"><span className="brand-mark"><Sparkles size={17}/></span>lenvocab<span className="brand-dot">.</span></span><button onClick={() => navigate('auth')}>Bỏ qua</button></div><div className="onboard-image"><Image src={slide.image} alt="Khung cảnh đời thường để học tiếng Anh" fill sizes="(max-width: 480px) 100vw, 400px"/><span className="onboard-image-tag"><Sparkles size={15}/> EVERYDAY IS A LESSON</span></div><div className="onboard-content"><span className="eyebrow">{slide.label}</span><h1>{slide.title}</h1><p>{slide.description}</p><div className="onboard-dots">{slides.map((_, index) => <button key={index} className={index === step ? 'active' : ''} aria-label={`Đi tới trang giới thiệu ${index + 1}`} onClick={() => setStep(index)}/>)}</div><button className="primary-button" onClick={() => step === 2 ? navigate('auth') : setStep(value => value + 1)}>{step === 2 ? 'Bắt đầu khám phá' : 'Tiếp tục'} <ArrowRight size={18}/></button><button className="secondary-action" onClick={() => navigate('home')}>Xem bản demo</button></div></div>
}

export function AuthScreen({ navigate }: ScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  return <div className="screen auth-screen"><button className="auth-back icon-button" onClick={() => navigate('onboarding')} aria-label="Quay lại"><ArrowLeft size={20}/></button><div className="auth-graphic"><div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/><span className="auth-main-icon"><Sparkles size={42}/></span><span className="auth-float one">Aa</span><span className="auth-float two"><BookOpen size={20}/></span></div><div className="auth-content"><span className="eyebrow">CHÀO MỪNG ĐẾN VỚI LEN VOCAB</span><h1>{mode === 'login' ? 'Học từ vựng, theo cách của bạn.' : 'Bắt đầu hành trình của bạn.'}</h1><p>{mode === 'login' ? 'Mỗi ngày một chút, để tiếng Anh trở thành một phần cuộc sống.' : 'Tạo không gian học tập riêng, bắt đầu từ những gì bạn thấy.'}</p><div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Đăng nhập</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Đăng ký</button></div><div className="auth-fields"><label><span>Email</span><span className="auth-input"><Mail size={19}/><input type="email" placeholder="email@example.com" autoComplete="email"/></span></label><label><span>Mật khẩu</span><span className="auth-input"><LockKeyhole size={19}/><input type="password" placeholder="Ít nhất 8 ký tự" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></span></label></div><div className="demo-disclaimer">Đây là bản thiết kế giao diện. Tài khoản thật chưa được kích hoạt.</div><button className="primary-button" onClick={() => navigate('home')}>Khám phá bản demo <ArrowRight size={18}/></button><p className="auth-bottom">Tiếp tục để trải nghiệm giao diện ứng dụng mẫu.</p></div></div>
}

export function ScreenContent(props: ScreenProps) {
  switch (props.screen) {
    case 'home': return <HomeScreen {...props}/>
    case 'camera': return <CameraScreen {...props}/>
    case 'results': return <ResultsScreen {...props}/>
    case 'word': return <WordScreen {...props}/>
    case 'saved': return <SavedScreen {...props}/>
    case 'review': return <ReviewScreen {...props}/>
    case 'flashcards': return <FlashcardsScreen {...props}/>
    case 'quiz': return <QuizScreen {...props}/>
    case 'history': return <HistoryScreen {...props}/>
    case 'profile': return <ProfileScreen {...props}/>
    case 'onboarding': return <OnboardingScreen {...props}/>
    case 'auth': return <AuthScreen {...props}/>
  }
}
