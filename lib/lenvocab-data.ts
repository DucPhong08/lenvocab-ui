export type Word = {
  id: string
  term: string
  ipa: string
  type: string
  meaning: string
  example: string
  translation: string
  note: string
  level: string
  scene: string
}

export type Scene = {
  id: string
  title: string
  subtitle: string
  image: string
  category: string
  words: Word[]
}

export const scenes: Scene[] = [
  {
    id: 'desk', title: 'Góc học tập', subtitle: 'Một buổi sáng đầy cảm hứng', image: '/scenes/desk.png', category: 'Không gian sống',
    words: [
      { id: 'notebook', term: 'notebook', ipa: '/ˈnoʊt.bʊk/', type: 'noun', meaning: 'quyển sổ tay', example: 'I write new ideas in my notebook.', translation: 'Tôi viết những ý tưởng mới vào sổ tay.', note: '“Note” là ghi chú, “book” là sách. Ghép lại thành một cuốn sổ để ghi chép.', level: 'A1', scene: 'desk' },
      { id: 'mug', term: 'mug', ipa: '/mʌɡ/', type: 'noun', meaning: 'cốc có quai', example: 'She has a warm mug of coffee.', translation: 'Cô ấy có một cốc cà phê ấm.', note: 'Mug thường là cốc lớn có quai, hay dùng cho cà phê hoặc trà.', level: 'A1', scene: 'desk' },
      { id: 'succulent', term: 'succulent', ipa: '/ˈsʌk.jə.lənt/', type: 'noun', meaning: 'cây mọng nước', example: 'The succulent sits by the window.', translation: 'Cây mọng nước nằm cạnh cửa sổ.', note: 'Một loại cây nhỏ dễ chăm sóc, thường được đặt trên bàn làm việc.', level: 'B1', scene: 'desk' },
      { id: 'headphones', term: 'headphones', ipa: '/ˈhed.foʊnz/', type: 'noun', meaning: 'tai nghe', example: 'I use headphones when I study.', translation: 'Tôi dùng tai nghe khi học.', note: 'Từ này thường dùng ở dạng số nhiều: a pair of headphones.', level: 'A2', scene: 'desk' },
    ],
  },
  {
    id: 'kitchen', title: 'Trong căn bếp', subtitle: 'Từ vựng quanh bữa ăn', image: '/scenes/kitchen.png', category: 'Đời sống',
    words: [
      { id: 'cutting-board', term: 'cutting board', ipa: '/ˈkʌt.ɪŋ bɔːrd/', type: 'noun', meaning: 'thớt', example: 'Put the lemon on the cutting board.', translation: 'Đặt quả chanh lên thớt.', note: 'Một cụm danh từ chỉ bề mặt dùng để cắt thực phẩm.', level: 'A2', scene: 'kitchen' },
      { id: 'whisk', term: 'whisk', ipa: '/wɪsk/', type: 'noun', meaning: 'cây đánh trứng', example: 'Use a whisk to mix the eggs.', translation: 'Dùng cây đánh trứng để trộn trứng.', note: 'Whisk có thể là danh từ hoặc động từ “đánh/trộn nhanh”.', level: 'B1', scene: 'kitchen' },
      { id: 'kettle', term: 'kettle', ipa: '/ˈket.əl/', type: 'noun', meaning: 'ấm đun nước', example: 'The kettle is on the stove.', translation: 'Ấm đun nước ở trên bếp.', note: 'Electric kettle là ấm đun nước điện.', level: 'A2', scene: 'kitchen' },
      { id: 'spice', term: 'spice', ipa: '/spaɪs/', type: 'noun', meaning: 'gia vị', example: 'This spice makes the soup delicious.', translation: 'Gia vị này làm món súp ngon hơn.', note: 'Spices ở dạng số nhiều khi nói chung về nhiều loại gia vị.', level: 'A2', scene: 'kitchen' },
    ],
  },
  {
    id: 'street', title: 'Dạo phố', subtitle: 'Tiếng Anh trên từng góc đường', image: '/scenes/street.png', category: 'Ngoài trời',
    words: [
      { id: 'crosswalk', term: 'crosswalk', ipa: '/ˈkrɔːs.wɔːk/', type: 'noun', meaning: 'vạch qua đường', example: 'Wait at the crosswalk.', translation: 'Hãy đợi ở vạch qua đường.', note: 'Trong tiếng Anh-Anh, từ tương đương là pedestrian crossing.', level: 'A2', scene: 'street' },
      { id: 'traffic-light', term: 'traffic light', ipa: '/ˈtræf.ɪk laɪt/', type: 'noun', meaning: 'đèn giao thông', example: 'The traffic light turned green.', translation: 'Đèn giao thông chuyển sang màu xanh.', note: 'Một cụm từ rất hữu ích khi chỉ đường.', level: 'A1', scene: 'street' },
      { id: 'lamppost', term: 'lamppost', ipa: '/ˈlæmp.poʊst/', type: 'noun', meaning: 'cột đèn đường', example: 'The bike is next to the lamppost.', translation: 'Chiếc xe đạp ở cạnh cột đèn đường.', note: 'Lamp + post: chiếc đèn được gắn trên một cây cột.', level: 'B1', scene: 'street' },
      { id: 'awning', term: 'awning', ipa: '/ˈɔː.nɪŋ/', type: 'noun', meaning: 'mái hiên', example: 'We stood under the café awning.', translation: 'Chúng tôi đứng dưới mái hiên quán cà phê.', note: 'Mái che bằng vải hoặc vật liệu nhẹ phía trên cửa sổ/cửa ra vào.', level: 'B1', scene: 'street' },
    ],
  },
  {
    id: 'library', title: 'Góc đọc sách', subtitle: 'Một khoảng lặng để học thêm', image: '/scenes/library.png', category: 'Học tập',
    words: [
      { id: 'bookshelf', term: 'bookshelf', ipa: '/ˈbʊk.ʃelf/', type: 'noun', meaning: 'giá sách', example: 'The books are on the bookshelf.', translation: 'Những cuốn sách ở trên giá sách.', note: 'Số nhiều bất quy tắc: bookshelves.', level: 'A2', scene: 'library' },
      { id: 'armchair', term: 'armchair', ipa: '/ˈɑːrm.tʃer/', type: 'noun', meaning: 'ghế bành', example: 'She reads in the armchair.', translation: 'Cô ấy đọc sách trên ghế bành.', note: 'Ghế có tay vịn, rất thoải mái để đọc sách.', level: 'A2', scene: 'library' },
      { id: 'globe', term: 'globe', ipa: '/ɡloʊb/', type: 'noun', meaning: 'quả địa cầu', example: 'He pointed to Vietnam on the globe.', translation: 'Anh ấy chỉ vào Việt Nam trên quả địa cầu.', note: 'Globe cũng có thể chỉ Trái Đất trong cụm “around the globe”.', level: 'B1', scene: 'library' },
      { id: 'magazine', term: 'magazine', ipa: '/ˌmæɡ.əˈziːn/', type: 'noun', meaning: 'tạp chí', example: 'I found a travel magazine.', translation: 'Tôi tìm thấy một tạp chí du lịch.', note: 'Tạp chí định kỳ, khác với newspaper là báo giấy.', level: 'A2', scene: 'library' },
    ],
  },
]

export const allWords = scenes.flatMap((scene) => scene.words)
export const getScene = (id: string) => scenes.find((scene) => scene.id === id) ?? scenes[0]
export const getWord = (id: string) => allWords.find((word) => word.id === id) ?? allWords[0]
