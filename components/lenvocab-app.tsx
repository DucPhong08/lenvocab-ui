'use client'

import { useState } from 'react'
import { ArrowRight, BookOpen, Bookmark, Camera, ChevronRight, Clock3, Home, Layers3, ScanLine, Sparkles, UserRound } from 'lucide-react'
import { ScreenContent, type Screen, type ScanEntry, type ScanObject } from '@/components/lenvocab-screens'
import { getWord } from '@/lib/lenvocab-data'

const tabs: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Trang chủ', icon: Home },
  { id: 'saved', label: 'Từ đã lưu', icon: Bookmark },
  { id: 'camera', label: 'Quét ảnh', icon: Camera },
  { id: 'review', label: 'Ôn tập', icon: Layers3 },
  { id: 'profile', label: 'Cá nhân', icon: UserRound },
]

const showcaseGroups: { label: string; items: { id: Screen; label: string; icon: typeof Home }[] }[] = [
  { label: 'KHÁM PHÁ', items: [{ id: 'home', label: 'Trang chủ', icon: Home }, { id: 'camera', label: 'Chụp & quét ảnh', icon: ScanLine }, { id: 'results', label: 'Kết quả quét', icon: Sparkles }, { id: 'word', label: 'Chi tiết từ', icon: BookOpen }] },
  { label: 'HỌC TẬP', items: [{ id: 'saved', label: 'Từ đã lưu', icon: Bookmark }, { id: 'flashcards', label: 'Flashcards', icon: Layers3 }, { id: 'quiz', label: 'Quiz nhanh', icon: Sparkles }, { id: 'history', label: 'Lịch sử', icon: Clock3 }] },
  { label: 'TÀI KHOẢN', items: [{ id: 'onboarding', label: 'Giới thiệu', icon: ArrowRight }, { id: 'auth', label: 'Đăng nhập / đăng ký', icon: UserRound }, { id: 'profile', label: 'Hồ sơ & cài đặt', icon: UserRound }] },
]

const initialHistory: ScanEntry[] = [
  { sceneId: 'desk', date: 'HÔM NAY · 09:41', id: 1 },
  { sceneId: 'kitchen', date: 'HÔM QUA · 18:25', id: 2 },
  { sceneId: 'street', date: '28 THÁNG 9 · 16:10', id: 3 },
  { sceneId: 'library', date: '25 THÁNG 9 · 10:32', id: 4 },
]

export default function LenvocabApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const [sceneId, setSceneId] = useState('desk')
  const [wordId, setWordId] = useState('notebook')
  const [wordBack, setWordBack] = useState<Screen>('results')
  const [saved, setSaved] = useState<string[]>(['notebook', 'mug', 'succulent', 'headphones', 'kettle', 'crosswalk'])
  const [history, setHistory] = useState(initialHistory)
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scanObjects, setScanObjects] = useState<ScanObject[] | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)

  const navigate = (next: Screen) => {
    setScreen(next)
    document.querySelector('.phone-scroll')?.scrollTo({ top: 0, behavior: 'instant' })
  }
  const toggleSaved = (id: string) => setSaved(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  const openWord = (id: string) => { setWordBack(screen); setWordId(id); setSceneId(getWord(id).scene); navigate('word') }
  const scan = async () => {
    if (isScanning) return
    setIsScanning(true)
    setScanError(null)
    setScanObjects(null)
    try {
      const form = new FormData()
      if (selectedFile) form.append('image', selectedFile)
      else if (customImage) {
        const blob = await fetch(customImage).then(response => response.blob())
        form.append('image', blob, 'scan-image.jpg')
      } else form.append('sceneId', sceneId)
      const response = await fetch('/api/scan', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Không thể phân tích ảnh.')
      const objects = data.objects as ScanObject[]
      setScanObjects(objects)
      setHistory(current => [{ sceneId, date: 'VỪA XONG', id: Date.now(), image: customImage ?? undefined, objects }, ...current])
      navigate('results')
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Không thể phân tích ảnh. Vui lòng thử lại.')
    } finally {
      setIsScanning(false)
    }
  }
  const activeTab = screen === 'word' ? (wordBack === 'results' ? 'camera' : wordBack) : screen === 'results' ? 'camera' : ['flashcards', 'quiz'].includes(screen) ? 'review' : screen
  const showTabs = !['onboarding', 'auth'].includes(screen)

  return <main className="experience">
    <div className="ambient-orb orb-a"/><div className="ambient-orb orb-b"/>
    <section className="desktop-intro" aria-label="Giới thiệu Lenvocab"><div className="desktop-brand"><span className="brand-mark"><Sparkles size={18} strokeWidth={2.5}/></span> lenvocab<span>.</span></div><div className="intro-content"><span className="intro-kicker"><span className="kicker-line"/> HỌC TIẾNG ANH THEO CÁCH TỰ NHIÊN</span><h1>See it.<br/>Learn it.<br/><em>Live it.</em></h1><p>Biến những điều bạn nhìn thấy mỗi ngày thành những từ tiếng Anh bạn không bao giờ quên.</p><button onClick={() => navigate('camera')} className="intro-cta">Khám phá ngay <span><ArrowRight size={18}/></span></button></div><div className="intro-bottom"><span className="intro-index">01 <span>/ 03</span></span><span>YOUR WORLD, YOUR WORDS</span><div className="intro-dashes"><i/><i/><i/></div></div></section>
    <section className="phone-frame" aria-label="Ứng dụng Lenvocab"><div className="phone-status" aria-hidden="true"><span>9:41</span><span className="status-island"/><span className="status-icons"><span className="signal-bars"><i/><i/><i/><i/></span><span className="wifi-icon">◕</span><span className="battery"><i/></span></span></div><div className="phone-scroll"><ScreenContent screen={screen} navigate={navigate} sceneId={sceneId} setSceneId={setSceneId} wordId={wordId} wordBack={wordBack} openWord={openWord} saved={saved} toggleSaved={toggleSaved} history={history} scan={scan} isScanning={isScanning} scanError={scanError} setScanError={setScanError} scanObjects={scanObjects} setScanObjects={setScanObjects} selectedFile={selectedFile} setSelectedFile={setSelectedFile} customImage={customImage} setCustomImage={setCustomImage}/></div>{showTabs && <nav className="bottom-nav" aria-label="Điều hướng chính">{tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} className={`${activeTab === tab.id ? 'active' : ''} ${tab.id === 'camera' ? 'capture-tab' : ''}`} aria-label={tab.label} aria-current={activeTab === tab.id ? 'page' : undefined} onClick={() => navigate(tab.id)}>{tab.id === 'camera' ? <span className="capture-tab-icon"><Icon size={23} strokeWidth={2}/></span> : <Icon size={22} strokeWidth={activeTab === tab.id ? 2.2 : 1.8} fill={activeTab === tab.id && tab.id === 'home' ? 'currentColor' : 'none'}/>}<span>{tab.label}</span></button> })}</nav>}<div className="home-indicator" aria-hidden="true"/></section>
    <aside className="desktop-explore" aria-label="Khám phá các màn hình"><div className="explore-heading"><span className="eyebrow">BẢN THIẾT KẾ TƯƠNG TÁC</span><h2>Khám phá<br/>ứng dụng</h2><p>Chọn một màn hình để trải nghiệm.</p></div><div className="explore-groups">{showcaseGroups.map(group => <div className="explore-group" key={group.label}><span>{group.label}</span>{group.items.map(item => { const Icon = item.icon; return <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => item.id === 'word' ? openWord(wordId) : navigate(item.id)}><Icon size={17}/><span>{item.label}</span>{screen === item.id && <ChevronRight size={16}/>}</button> })}</div>)}</div><div className="explore-footer"><span><span className="footer-dot"/> INTERACTIVE PROTOTYPE</span><p>Dữ liệu mẫu · Trải nghiệm giao diện</p></div></aside>
  </main>
}
