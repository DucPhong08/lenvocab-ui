export type Word = {
  id: string
  term: string
  ipa: string
  type: string
  meaning: string
  example: string
  example2?: string
  translation?: string
  note: string
  level: string
  scene: string
  audio?: string | null
  imageUrl?: string | null
  imageStyle?: 'photo' | 'sticker'
  hasImage?: boolean
  userFlashcardId?: string
  interval?: number
  repetitions?: number
  nextReviewDate?: string
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
    id: 'desk',
    title: 'Góc học tập',
    subtitle: 'Một buổi sáng đầy cảm hứng',
    image: '/scenes/desk.png',
    category: 'Không gian sống',
    words: [
      { id: 'notebook', term: 'notebook', ipa: '/ˈnoʊt.bʊk/', type: 'noun', meaning: 'quyển sổ tay', example: 'I write new ideas in my notebook.', translation: 'Tôi viết những ý tưởng mới vào sổ tay.', note: '“Note” là ghi chú, “book” là sách. Ghép lại thành một cuốn sổ để ghi chép.', level: 'A1', scene: 'desk' },
      { id: 'mug', term: 'mug', ipa: '/mʌɡ/', type: 'noun', meaning: 'cốc có quai', example: 'She has a warm mug of coffee.', translation: 'Cô ấy có một cốc cà phê ấm.', note: 'Mug thường là cốc lớn có quai, hay dùng cho cà phê hoặc trà.', level: 'A1', scene: 'desk' },
      { id: 'succulent', term: 'succulent', ipa: '/ˈsʌk.jə.lənt/', type: 'noun', meaning: 'cây mọng nước', example: 'The succulent sits by the window.', translation: 'Cây mọng nước nằm cạnh cửa sổ.', note: 'Một loại cây nhỏ dễ chăm sóc, thường được đặt trên bàn làm việc.', level: 'B1', scene: 'desk' },
      { id: 'headphones', term: 'headphones', ipa: '/ˈhed.foʊnz/', type: 'noun', meaning: 'tai nghe', example: 'I use headphones when I study.', translation: 'Tôi dùng tai nghe khi học.', note: 'Từ này thường dùng ở dạng số nhiều: a pair of headphones.', level: 'A2', scene: 'desk' },
      { id: 'highlighter', term: 'highlighter', ipa: '/ˈhaɪˌlaɪ.t̬ɚ/', type: 'noun', meaning: 'bút dạ quang', example: 'Use a yellow highlighter to mark key concepts.', translation: 'Dùng bút dạ quang màu vàng để đánh dấu các ý chính.', note: 'Bút nhớ dòng giúp làm nổi bật thông tin quan trọng khi đọc sách.', level: 'A2', scene: 'desk' },
      { id: 'jot-down', term: 'jot down', ipa: '/dʒɑːt daʊn/', type: 'phrasal verb', meaning: 'ghi nhanh, chép vội', example: 'Let me jot down your phone number before I forget.', translation: 'Để tôi ghi nhanh số điện thoại của bạn kẻo quên.', note: '“Jot down” nghĩa là viết vội một ghi chú ngắn lên giấy hoặc sổ tay.', level: 'B1', scene: 'desk' },
      { id: 'concentrate', term: 'concentrate', ipa: '/ˈkɑːn.sən.treɪt/', type: 'verb', meaning: 'tập trung', example: 'Turn off your notifications to concentrate on studying.', translation: 'Tắt thông báo điện thoại để tập trung học bài.', note: 'Thường đi kèm giới từ "on": concentrate on something.', level: 'B1', scene: 'desk' },
      { id: 'minimalist', term: 'minimalist', ipa: '/ˈmɪn.ə.məl.ɪst/', type: 'adjective', meaning: 'tối giản', example: 'She keeps a minimalist desk with only essential tools.', translation: 'Cô ấy giữ góc bàn tối giản chỉ với những đồ dùng thiết yếu.', note: 'Xu hướng thẩm mỹ và phong cách sống loại bỏ đồ đạc dư thừa.', level: 'B2', scene: 'desk' },
      { id: 'ergonomic', term: 'ergonomic', ipa: '/ˌɜːr.ɡəˈnɑː.mɪk/', type: 'adjective', meaning: 'công thái học', example: 'An ergonomic chair protects your back during long study sessions.', translation: 'Một chiếc ghế công thái học bảo vệ lưng bạn trong các buổi học dài.', note: 'Thiết kế tối ưu cho tư thế và sức khỏe người dùng.', level: 'B2', scene: 'desk' },
      { id: 'clutter', term: 'clutter', ipa: '/ˈklʌt.ər/', type: 'noun', meaning: 'sự bừa bộn, lộn xộn', example: 'Clear the clutter off your desk to think more clearly.', translation: 'Hãy dọn bớt đồ đạc bừa bộn trên bàn để suy nghĩ sáng suốt hơn.', note: 'Có thể dùng như danh từ (đống bừa bộn) hoặc động từ (làm bừa bộn).', level: 'B2', scene: 'desk' },
    ],
  },
  {
    id: 'kitchen',
    title: 'Trong căn bếp',
    subtitle: 'Từ vựng quanh bữa ăn',
    image: '/scenes/kitchen.png',
    category: 'Đời sống',
    words: [
      { id: 'cutting-board', term: 'cutting board', ipa: '/ˈkʌt.ɪŋ bɔːrd/', type: 'noun', meaning: 'thớt', example: 'Put the lemon on the cutting board.', translation: 'Đặt quả chanh lên thớt.', note: 'Một cụm danh từ chỉ bề mặt dùng để cắt thực phẩm.', level: 'A2', scene: 'kitchen' },
      { id: 'whisk', term: 'whisk', ipa: '/wɪsk/', type: 'noun', meaning: 'cây đánh trứng', example: 'Use a whisk to mix the eggs.', translation: 'Dùng cây đánh trứng để trộn trứng.', note: 'Whisk có thể là danh từ hoặc động từ “đánh/trộn nhanh”.', level: 'B1', scene: 'kitchen' },
      { id: 'kettle', term: 'kettle', ipa: '/ˈket.əl/', type: 'noun', meaning: 'ấm đun nước', example: 'The kettle is on the stove.', translation: 'Ấm đun nước ở trên bếp.', note: 'Electric kettle là ấm đun nước điện.', level: 'A2', scene: 'kitchen' },
      { id: 'spice', term: 'spice', ipa: '/spaɪs/', type: 'noun', meaning: 'gia vị', example: 'This spice makes the soup delicious.', translation: 'Gia vị này làm món súp ngon hơn.', note: 'Spices ở dạng số nhiều khi nói chung về nhiều loại gia vị.', level: 'A2', scene: 'kitchen' },
      { id: 'apron', term: 'apron', ipa: '/ˈeɪ.prən/', type: 'noun', meaning: 'tạp dề', example: 'Tie your apron before preparing the sauce.', translation: 'Hãy buộc tạp dề trước khi làm nước sốt.', note: 'Đồ bảo hộ tránh vết bẩn khi nấu nướng hoặc làm bánh.', level: 'A2', scene: 'kitchen' },
      { id: 'simmer', term: 'simmer', ipa: '/ˈsɪm.ər/', type: 'verb', meaning: 'đun nhỏ lửa, ninh liu riu', example: 'Let the soup simmer for thirty minutes to deepen the flavor.', translation: 'Hãy để món súp sôi liu riu trong ba mươi phút để vị thêm đậm đà.', note: 'Nấu ở nhiệt độ ngay dưới điểm sôi, bong bóng nổi nhẹ.', level: 'B2', scene: 'kitchen' },
      { id: 'marinate', term: 'marinate', ipa: '/ˈmær.ə.neɪt/', type: 'verb', meaning: 'ướp gia vị', example: 'Marinate the chicken with garlic and herbs overnight.', translation: 'Ướp gà với tỏi và rau thơm qua đêm.', note: 'Ngâm thực phẩm vào nước sốt để ngấm gia vị trước khi nấu.', level: 'B1', scene: 'kitchen' },
      { id: 'savory', term: 'savory', ipa: '/ˈseɪ.vɚ.i/', type: 'adjective', meaning: 'thơm ngon đậm đà', example: 'This mushroom pie has a rich, savory taste.', translation: 'Chiếc bánh nấm này có hương vị đậm đà rất ngon.', note: 'Chỉ món ăn có vị mặn, thơm ngậy, đối lập với sweet (ngọt).', level: 'B1', scene: 'kitchen' },
      { id: 'spatula', term: 'spatula', ipa: '/ˈspætʃ.ə.lə/', type: 'noun', meaning: 'vá dẹt, xẻng lật thức ăn', example: 'Use a silicone spatula to flip the pancakes gently.', translation: 'Dùng chiếc vá lật silicon để lật bánh kếp nhẹ nhàng.', note: 'Dụng cụ dẹt dùng để đảo, xào, lật thức ăn trong chảo.', level: 'B1', scene: 'kitchen' },
      { id: 'aroma', term: 'aroma', ipa: '/əˈroʊ.mə/', type: 'noun', meaning: 'mùi thơm ngào ngạt', example: 'The sweet aroma of baked bread filled the entire kitchen.', translation: 'Mùi thơm ngọt ngào của bánh mì nướng lan tỏa khắp gian bếp.', note: 'Thường dùng để tả mùi thơm hấp dẫn của thức ăn hoặc đồ uống.', level: 'B2', scene: 'kitchen' },
    ],
  },
  {
    id: 'street',
    title: 'Dạo phố',
    subtitle: 'Tiếng Anh trên từng góc đường',
    image: '/scenes/street.png',
    category: 'Ngoài trời',
    words: [
      { id: 'crosswalk', term: 'crosswalk', ipa: '/ˈkrɔːs.wɔːk/', type: 'noun', meaning: 'vạch qua đường', example: 'Wait at the crosswalk.', translation: 'Hãy đợi ở vạch qua đường.', note: 'Trong tiếng Anh-Anh, từ tương đương là pedestrian crossing.', level: 'A2', scene: 'street' },
      { id: 'traffic-light', term: 'traffic light', ipa: '/ˈtræf.ɪk laɪt/', type: 'noun', meaning: 'đèn giao thông', example: 'The traffic light turned green.', translation: 'Đèn giao thông chuyển sang màu xanh.', note: 'Một cụm từ rất hữu ích khi chỉ đường.', level: 'A1', scene: 'street' },
      { id: 'lamppost', term: 'lamppost', ipa: '/ˈlæmp.poʊst/', type: 'noun', meaning: 'cột đèn đường', example: 'The bike is next to the lamppost.', translation: 'Chiếc xe đạp ở cạnh cột đèn đường.', note: 'Lamp + post: chiếc đèn được gắn trên một cây cột.', level: 'B1', scene: 'street' },
      { id: 'awning', term: 'awning', ipa: '/ˈɔː.nɪŋ/', type: 'noun', meaning: 'mái hiên', example: 'We stood under the café awning.', translation: 'Chúng tôi đứng dưới mái hiên quán cà phê.', note: 'Mái che bằng vải hoặc vật liệu nhẹ phía trên cửa sổ/cửa ra vào.', level: 'B1', scene: 'street' },
      { id: 'pedestrian', term: 'pedestrian', ipa: '/pəˈdes.tri.ən/', type: 'noun', meaning: 'người đi bộ', example: 'Drivers must yield the right of way to pedestrians.', translation: 'Người lái xe phải nhường đường cho người đi bộ.', note: 'Chỉ người đang di chuyển bộ trên vỉa hè hoặc sang đường.', level: 'B1', scene: 'street' },
      { id: 'stroll', term: 'stroll', ipa: '/stroʊl/', type: 'verb', meaning: 'đi dạo thong thả', example: 'They love to stroll along the boulevard in the evening.', translation: 'Họ thích tản bộ thong thả dọc đại lộ vào buổi tối.', note: 'Đi bộ một cách thư thái, chậm rãi và không vội vã.', level: 'B1', scene: 'street' },
      { id: 'bustling', term: 'bustling', ipa: '/ˈbʌs.lɪŋ/', type: 'adjective', meaning: 'nhộn nhịp, hối hả', example: 'The night market is bustling with locals and tourists.', translation: 'Chợ đêm nhộn nhịp người dân địa phương và khách du lịch.', note: 'Tràn đầy âm thanh, hoạt động và sự sống động của phố thị.', level: 'B2', scene: 'street' },
      { id: 'curb', term: 'curb', ipa: '/kɜːrb/', type: 'noun', meaning: 'mép vỉa hè, gờ đường', example: 'Step onto the curb to stay safe from passing scooters.', translation: 'Bước lên mép vỉa hè để an toàn trước những chiếc xe máy qua lại.', note: 'Trong tiếng Anh-Anh thường được viết là "kerb".', level: 'B2', scene: 'street' },
      { id: 'commute', term: 'commute', ipa: '/kəˈmjuːt/', type: 'verb', meaning: 'đi lại hàng ngày', example: 'Many workers commute by train to avoid traffic jams.', translation: 'Nhiều người đi làm bằng tàu hỏa để tránh tắc đường.', note: 'Hành trình đều đặn từ nhà đến nơi làm việc hoặc trường học.', level: 'B1', scene: 'street' },
      { id: 'billboard', term: 'billboard', ipa: '/ˈbɪl.bɔːrd/', type: 'noun', meaning: 'biển quảng cáo ngoài trời', example: 'A bright digital billboard illuminated the intersection.', translation: 'Một tấm biển quảng cáo điện tử rực rỡ chiếu sáng ngã tư.', note: 'Bảng quảng cáo kích thước lớn đặt ở các tuyến đường đông đúc.', level: 'A2', scene: 'street' },
    ],
  },
  {
    id: 'library',
    title: 'Góc đọc sách',
    subtitle: 'Một khoảng lặng để học thêm',
    image: '/scenes/library.png',
    category: 'Học tập',
    words: [
      { id: 'bookshelf', term: 'bookshelf', ipa: '/ˈbʊk.ʃelf/', type: 'noun', meaning: 'giá sách', example: 'The books are on the bookshelf.', translation: 'Những cuốn sách ở trên giá sách.', note: 'Số nhiều bất quy tắc: bookshelves.', level: 'A2', scene: 'library' },
      { id: 'armchair', term: 'armchair', ipa: '/ˈɑːrm.tʃer/', type: 'noun', meaning: 'ghế bành', example: 'She reads in the armchair.', translation: 'Cô ấy đọc sách trên ghế bành.', note: 'Ghế có tay vịn, rất thoải mái để đọc sách.', level: 'A2', scene: 'library' },
      { id: 'globe', term: 'globe', ipa: '/ɡloʊb/', type: 'noun', meaning: 'quả địa cầu', example: 'He pointed to Vietnam on the globe.', translation: 'Anh ấy chỉ vào Việt Nam trên quả địa cầu.', note: 'Globe cũng có thể chỉ Trái Đất trong cụm “around the globe”.', level: 'B1', scene: 'library' },
      { id: 'magazine', term: 'magazine', ipa: '/ˌmæɡ.əˈziːn/', type: 'noun', meaning: 'tạp chí', example: 'I found a travel magazine.', translation: 'Tôi tìm thấy một tạp chí du lịch.', note: 'Tạp chí định kỳ, khác với newspaper là báo giấy.', level: 'A2', scene: 'library' },
      { id: 'browse', term: 'browse', ipa: '/braʊz/', type: 'verb', meaning: 'đọc lướt, xem qua', example: 'Feel free to browse the art section while you wait.', translation: 'Cứ tự nhiên xem qua khu sách nghệ thuật trong lúc bạn đợi nhé.', note: 'Xem lướt qua tài liệu, sách báo hoặc các đầu sách trên kệ.', level: 'B1', scene: 'library' },
      { id: 'tranquil', term: 'tranquil', ipa: '/ˈtræŋ.kwɪl/', type: 'adjective', meaning: 'yên tĩnh, thanh bình', example: 'The reading room offers a tranquil atmosphere for deep focus.', translation: 'Phòng đọc mang lại bầu không khí thanh tĩnh để tập trung sâu.', note: 'Diễn tả không gian yên ả, tĩnh lặng và không bị xao lãng.', level: 'B2', scene: 'library' },
      { id: 'encyclopedia', term: 'encyclopedia', ipa: '/ɪnˌsaɪ.kləˈpiː.di.ə/', type: 'noun', meaning: 'bách khoa toàn thư', example: 'She consulted a science encyclopedia for detailed diagrams.', translation: 'Cô ấy tra cứu cuốn bách khoa toàn thư khoa học để xem sơ đồ chi tiết.', note: 'Bộ sách hoặc nguồn tài liệu cung cấp kiến thức toàn diện.', level: 'B1', scene: 'library' },
      { id: 'bookmark', term: 'bookmark', ipa: '/ˈbʊk.mɑːrk/', type: 'noun', meaning: 'thẻ đánh dấu trang', example: 'He slipped a leather bookmark between pages forty and forty-one.', translation: 'Anh ấy kẹp một chiếc thẻ đánh dấu bằng da giữa trang 40 và 41.', note: 'Cũng dùng trên trình duyệt web với nghĩa dấu trang yêu thích.', level: 'A2', scene: 'library' },
      { id: 'absorb', term: 'absorb', ipa: '/əbˈzɔːrb/', type: 'verb', meaning: 'tiếp thu, đắm chìm', example: 'Children quickly absorb new languages in a playful environment.', translation: 'Trẻ em tiếp thu ngôn ngữ mới rất nhanh trong môi trường vui chơi.', note: 'Nghĩa đen là hút nước; nghĩa bóng là tiếp nhận kiến thức sâu sắc.', level: 'B2', scene: 'library' },
      { id: 'studious', term: 'studious', ipa: '/ˈstuː.di.əs/', type: 'adjective', meaning: 'chăm chỉ, ham học', example: 'The library attracts studious learners from all faculties.', translation: 'Thư viện thu hút những người học chăm chỉ từ mọi khoa.', note: 'Người dành nhiều thời gian và tâm trí nghiêm túc cho việc học.', level: 'B2', scene: 'library' },
    ],
  },
  {
    id: 'cafe',
    title: 'Quán cà phê',
    subtitle: 'Hương vị thư giãn và cảm hứng làm việc',
    image: '/scenes/cafe.png',
    category: 'Đời sống',
    words: [
      { id: 'barista', term: 'barista', ipa: '/bəˈriː.stə/', type: 'noun', meaning: 'nhân viên pha chế', example: 'The skilled barista crafted an exquisite swan pattern in the latte.', translation: 'Người barista khéo léo tạo hình một chú thiên nga tinh tế trên tách latte.', note: 'Chuyên gia pha chế và phục vụ các loại cà phê nghệ thuật.', level: 'B1', scene: 'cafe' },
      { id: 'espresso', term: 'espresso', ipa: '/eˈspres.oʊ/', type: 'noun', meaning: 'cà phê espresso', example: 'A single shot of espresso gave him the morning boost he needed.', translation: 'Một tách espresso đậm đặc đã tiếp thêm năng lượng buổi sáng anh ấy cần.', note: 'Cà phê nguyên chất được chiết xuất dưới áp suất nước sôi cao.', level: 'A2', scene: 'cafe' },
      { id: 'sip', term: 'sip', ipa: '/sɪp/', type: 'verb', meaning: 'nhấp từng ngụm nhỏ', example: 'Take time to sip your tea and enjoy the peaceful view.', translation: 'Hãy dành thời gian nhấp từng ngụm trà và ngắm nhìn khung cảnh yên bình.', note: 'Uống chậm rãi từng lượng nhỏ để cảm nhận trọn vẹn hương vị.', level: 'B1', scene: 'cafe' },
      { id: 'aromatic', term: 'aromatic', ipa: '/ˌær.əˈmæt.ɪk/', type: 'adjective', meaning: 'thơm nồng nàn, dậy mùi', example: 'Freshly ground coffee beans release an aromatic fragrance.', translation: 'Hạt cà phê mới xay tỏa ra một mùi hương thơm nồng nàn.', note: 'Mùi hương quyến rũ đặc trưng của cà phê, trà hay thảo mộc.', level: 'B2', scene: 'cafe' },
      { id: 'pastry', term: 'pastry', ipa: '/ˈpeɪ.stri/', type: 'noun', meaning: 'bánh ngọt nướng', example: 'We enjoyed a flaky butter pastry with our iced Americano.', translation: 'Chúng tôi thưởng thức chiếc bánh ngọt giòn xốp béo ngậy cùng ly Americano đá.', note: 'Chỉ các loại bánh nướng từ bột mì và bơ như croissant, tart...', level: 'A2', scene: 'cafe' },
      { id: 'cozy', term: 'cozy', ipa: '/ˈkoʊ.zi/', type: 'adjective', meaning: 'ấm cúng, thoải mái', example: 'The café has small wooden tables and cozy yellow lighting.', translation: 'Quán cà phê có những chiếc bàn gỗ nhỏ và ánh đèn vàng ấm cúng.', note: 'Tạo cảm giác ấm áp, thân mật và thư giãn dễ chịu.', level: 'A2', scene: 'cafe' },
      { id: 'brew', term: 'brew', ipa: '/bruː/', type: 'verb', meaning: 'pha, hãm đồ uống', example: 'It takes about four minutes to brew a French press coffee.', translation: 'Mất khoảng bốn phút để pha một bình cà phê kiểu Pháp.', note: 'Quá trình chiết xuất hương vị đồ uống từ trà hoặc cà phê với nước nóng.', level: 'B1', scene: 'cafe' },
      { id: 'coaster', term: 'coaster', ipa: '/ˈkoʊ.stər/', type: 'noun', meaning: 'miếng lót ly', example: 'Please place your cold drink on a coaster to protect the wooden table.', translation: 'Vui lòng đặt ly nước lạnh lên miếng lót ly để bảo vệ mặt bàn gỗ.', note: 'Vật dụng lót đáy cốc để chống đọng nước và chống trượt.', level: 'B1', scene: 'cafe' },
    ],
  },
  {
    id: 'supermarket',
    title: 'Siêu thị',
    subtitle: 'Chọn lựa hàng hóa và thực phẩm tươi',
    image: '/scenes/supermarket.png',
    category: 'Mua sắm',
    words: [
      { id: 'shopping-cart', term: 'shopping cart', ipa: '/ˈʃɑː.pɪŋ kɑːrt/', type: 'noun', meaning: 'xe đẩy mua hàng', example: 'Push the shopping cart down the central aisle.', translation: 'Đẩy xe mua hàng dọc theo lối đi chính giữa.', note: 'Trong tiếng Anh-Anh, cụm từ tương đương là "shopping trolley".', level: 'A1', scene: 'supermarket' },
      { id: 'aisle', term: 'aisle', ipa: '/aɪl/', type: 'noun', meaning: 'lối đi giữa các quầy', example: 'You will find cereal and granola in aisle four.', translation: 'Bạn sẽ tìm thấy ngũ cốc và granola ở lối đi số bốn.', note: 'Lưu ý chữ “s” câm, phát âm giống như “I’ll”.', level: 'B1', scene: 'supermarket' },
      { id: 'cashier', term: 'cashier', ipa: '/kæˈʃɪr/', type: 'noun', meaning: 'nhân viên thu ngân', example: 'Hand your loyalty card to the cashier for points.', translation: 'Đưa thẻ thành viên cho thu ngân để tích điểm.', note: 'Người phụ trách thanh toán hóa đơn cho khách hàng tại quầy.', level: 'A2', scene: 'supermarket' },
      { id: 'receipt', term: 'receipt', ipa: '/rɪˈsiːt/', type: 'noun', meaning: 'hóa đơn, biên lai', example: 'Keep your receipt in case you need to return an item.', translation: 'Giữ lại hóa đơn phòng khi bạn cần đổi trả món đồ.', note: 'Lưu ý chữ “p” câm, đọc là /rɪˈsiːt/.', level: 'A2', scene: 'supermarket' },
      { id: 'organic', term: 'organic', ipa: '/ɔːrˈɡæn.ɪk/', type: 'adjective', meaning: 'hữu cơ, sạch', example: 'Organic produce is grown without synthetic fertilizers.', translation: 'Nông sản hữu cơ được trồng mà không dùng phân bón hóa học.', note: 'Thực phẩm được nuôi trồng thuận tự nhiên và an toàn cho sức khỏe.', level: 'B1', scene: 'supermarket' },
      { id: 'perishable', term: 'perishable', ipa: '/ˈper.ɪ.ʃə.bəl/', type: 'adjective', meaning: 'dễ hỏng, dễ ôi thiu', example: 'Store perishable dairy products in the refrigerator.', translation: 'Bảo quản các sản phẩm từ sữa dễ hỏng trong tủ lạnh.', note: 'Hàng hóa tươi sống cần được giữ lạnh và dùng sớm.', level: 'B2', scene: 'supermarket' },
      { id: 'checkout', term: 'checkout', ipa: '/ˈtʃek.aʊt/', type: 'noun', meaning: 'quầy thanh toán', example: 'There was only a short queue at the self-service checkout.', translation: 'Chỉ có một hàng ngắn tại quầy thanh toán tự phục vụ.', note: 'Khu vực tính tiền và đóng gói trước khi rời khỏi siêu thị.', level: 'A2', scene: 'supermarket' },
      { id: 'restock', term: 'restock', ipa: '/ˌriːˈstɑːk/', type: 'verb', meaning: 'bổ sung hàng lên kệ', example: 'Staff restock the shelves with fresh bread early each morning.', translation: 'Nhân viên bổ sung bánh mì tươi mới lên kệ vào sáng sớm mỗi ngày.', note: '“Re-” nghĩa là làm lại, “stock” là hàng tồn kho hoặc trữ hàng.', level: 'B2', scene: 'supermarket' },
    ],
  },
  {
    id: 'park',
    title: 'Công viên xanh',
    subtitle: 'Hít thở không khí trong lành',
    image: '/scenes/park.png',
    category: 'Ngoài trời',
    words: [
      { id: 'bench', term: 'bench', ipa: '/bentʃ/', type: 'noun', meaning: 'ghế dài công viên', example: 'We sat on a wooden bench under the big oak tree.', translation: 'Chúng tôi ngồi trên chiếc ghế dài bằng gỗ dưới tán cây sồi lớn.', note: 'Ghế dài thường đặt ở nơi công cộng cho nhiều người cùng ngồi.', level: 'A1', scene: 'park' },
      { id: 'fountain', term: 'fountain', ipa: '/ˈfaʊn.tən/', type: 'noun', meaning: 'đài phun nước', example: 'Coins shimmered at the bottom of the ornamental fountain.', translation: 'Những đồng xu lấp lánh dưới đáy đài phun nước trang trí.', note: 'Công trình kiến trúc phun nước tạo cảnh quan mát mẻ.', level: 'A2', scene: 'park' },
      { id: 'jog', term: 'jog', ipa: '/dʒɑːɡ/', type: 'verb', meaning: 'chạy bộ thể dục', example: 'She jogs three kilometers around the lake every sunrise.', translation: 'Cô ấy chạy bộ ba cây số quanh hồ vào mỗi buổi bình minh.', note: 'Chạy chậm với tốc độ đều đặn nhằm rèn luyện sức khỏe tim mạch.', level: 'A2', scene: 'park' },
      { id: 'lush', term: 'lush', ipa: '/lʌʃ/', type: 'adjective', meaning: 'tươi tốt, xanh mướt', example: 'The park grounds are lush with emerald grass and blooming flowers.', translation: 'Khuôn viên công viên xanh mướt với thảm cỏ ngọc bích và hoa nở rộ.', note: 'Tả cây cối phát triển dồi dào, khỏe khoắn và tràn đầy sức sống.', level: 'B2', scene: 'park' },
      { id: 'canopy', term: 'canopy', ipa: '/ˈkæn.ə.pi/', type: 'noun', meaning: 'tán cây rợp bóng', example: 'The dense canopy shielded walkers from the midday heat.', translation: 'Tán lá rậm rạp che chắn người đi dạo khỏi cái nóng giữa trưa.', note: 'Tầng lá trên cao xòe rộng như chiếc ô tự nhiên.', level: 'B2', scene: 'park' },
      { id: 'pathway', term: 'pathway', ipa: '/ˈpæθ.weɪ/', type: 'noun', meaning: 'lối đi bộ, đường mòn', example: 'Follow the stone pathway leading towards the rose garden.', translation: 'Đi theo lối đi lát đá dẫn về phía vườn hoa hồng.', note: 'Đường mòn nhỏ dành riêng cho người đi dạo ngắm cảnh.', level: 'B1', scene: 'park' },
      { id: 'refreshing', term: 'refreshing', ipa: '/rɪˈfreʃ.ɪŋ/', type: 'adjective', meaning: 'sảng khoái, tươi mát', example: 'A refreshing morning breeze swept through the valley.', translation: 'Làn gió sớm mai sảng khoái thổi nhẹ qua thung lũng.', note: 'Cảm giác hồi phục sinh lực và tinh thần tỉnh táo.', level: 'B1', scene: 'park' },
      { id: 'unwind', term: 'unwind', ipa: '/ʌnˈwaɪnd/', type: 'verb', meaning: 'thư giãn, xả stress', example: 'Listening to birdsong is a delightful way to unwind after work.', translation: 'Lắng nghe tiếng chim hót là cách tuyệt vời để giải tỏa căng thẳng sau giờ làm.', note: 'Thả lỏng cơ thể và giải tỏa bớt lo âu sau thời gian bận rộn.', level: 'B2', scene: 'park' },
    ],
  },
  {
    id: 'office',
    title: 'Văn phòng hiện đại',
    subtitle: 'Nhịp sống công sở và sự sáng tạo',
    image: '/scenes/office.png',
    category: 'Công việc',
    words: [
      { id: 'monitor', term: 'monitor', ipa: '/ˈmɑː.nə.t̬ɚ/', type: 'noun', meaning: 'màn hình máy tính', example: 'Adjust your monitor to eye level to avoid neck strain.', translation: 'Điều chỉnh màn hình máy tính ngang tầm mắt để tránh mỏi cổ.', note: 'Màn hình hiển thị đồ họa và thông tin từ máy vi tính.', level: 'A2', scene: 'office' },
      { id: 'deadline', term: 'deadline', ipa: '/ˈded.laɪn/', type: 'noun', meaning: 'hạn chót hoàn thành', example: 'Our project team worked overtime to meet the Friday deadline.', translation: 'Đội ngũ dự án của chúng tôi đã làm thêm giờ để kịp hạn chót thứ Sáu.', note: 'Thời điểm bắt buộc phải hoàn thành nhiệm vụ được giao.', level: 'B1', scene: 'office' },
      { id: 'collaborate', term: 'collaborate', ipa: '/kəˈlæb.ə.reɪt/', type: 'verb', meaning: 'cộng tác, phối hợp', example: 'Designers and developers collaborate closely on user experience.', translation: 'Các nhà thiết kế và lập trình viên hợp tác chặt chẽ về trải nghiệm người dùng.', note: 'Làm việc chung và chia sẻ trách nhiệm để đạt kết quả tốt nhất.', level: 'B2', scene: 'office' },
      { id: 'productive', term: 'productive', ipa: '/prəˈdʌk.tɪv/', type: 'adjective', meaning: 'năng suất, hiệu quả cao', example: 'A structured morning routine leads to a productive workday.', translation: 'Một thói quen buổi sáng khoa học giúp ngày làm việc đạt năng suất cao.', note: 'Hoàn thành được nhiều công việc hữu ích trong thời gian ngắn.', level: 'B1', scene: 'office' },
      { id: 'whiteboard', term: 'whiteboard', ipa: '/ˈwaɪt.bɔːrd/', type: 'noun', meaning: 'bảng trắng', example: 'Draw the system diagram on the whiteboard for everyone to see.', translation: 'Hãy vẽ sơ đồ hệ thống lên bảng trắng cho mọi người cùng xem.', note: 'Bảng mặt nhẵn viết bằng bút lông xóa được trong phòng họp.', level: 'A1', scene: 'office' },
      { id: 'brainstorm', term: 'brainstorm', ipa: '/ˈbreɪn.stɔːrm/', type: 'verb', meaning: 'động não, tìm ý tưởng', example: 'We gathered in the lounge to brainstorm marketing strategies.', translation: 'Chúng tôi tập hợp tại phòng nghỉ để động não tìm chiến lược tiếp thị.', note: 'Cùng thảo luận tự do để tìm ra nhiều giải pháp mới lạ.', level: 'B2', scene: 'office' },
      { id: 'innovative', term: 'innovative', ipa: '/ˈɪn.ə.veɪ.tɪv/', type: 'adjective', meaning: 'đột phá, sáng tạo đổi mới', example: 'They presented an innovative solution to reduce cloud costs.', translation: 'Họ đã trình bày một giải pháp đổi mới nhằm giảm chi phí điện toán đám mây.', note: 'Áp dụng những ý tưởng mới mẻ và mang tính tiên phong.', level: 'B2', scene: 'office' },
      { id: 'colleague', term: 'colleague', ipa: '/ˈkɑː.liːɡ/', type: 'noun', meaning: 'đồng nghiệp', example: 'Treat every colleague with respect and openness.', translation: 'Hãy đối xử với mọi đồng nghiệp bằng sự tôn trọng và cởi mở.', note: 'Người cùng làm việc trong cùng một công ty hoặc nghề nghiệp.', level: 'A2', scene: 'office' },
    ],
  },
  {
    id: 'gym',
    title: 'Phòng tập thể hình',
    subtitle: 'Bền bỉ nâng cao thể lực và sức khỏe',
    image: '/scenes/gym.png',
    category: 'Sức khỏe',
    words: [
      { id: 'dumbbell', term: 'dumbbell', ipa: '/ˈdʌm.bel/', type: 'noun', meaning: 'tạ tay', example: 'Choose a light pair of dumbbells for your shoulder warm-up.', translation: 'Hãy chọn một đôi tạ tay nhẹ để khởi động vai.', note: 'Cặp tạ đơn ngắn cầm tay dùng để tập các nhóm cơ.', level: 'B1', scene: 'gym' },
      { id: 'treadmill', term: 'treadmill', ipa: '/ˈtred.mɪl/', type: 'noun', meaning: 'máy chạy bộ', example: 'Set the treadmill to a moderate incline for extra calorie burn.', translation: 'Đặt máy chạy bộ ở độ dốc vừa phải để đốt thêm calo.', note: 'Thiết bị tập chạy bộ trong nhà có băng chuyền chuyển động liên tục.', level: 'B1', scene: 'gym' },
      { id: 'hydrate', term: 'hydrate', ipa: '/ˈhaɪ.dreɪt/', type: 'verb', meaning: 'bổ sung nước, uống nước', example: 'Remember to hydrate frequently during high-intensity training.', translation: 'Hãy nhớ bổ sung nước thường xuyên trong các buổi tập cường độ cao.', note: 'Cung cấp đủ lượng nước cho cơ thể khi vận động đổ mồ hôi.', level: 'B1', scene: 'gym' },
      { id: 'strenuous', term: 'strenuous', ipa: '/ˈstren.ju.əs/', type: 'adjective', meaning: 'đòi hỏi nhiều sức lực, nặng nhọc', example: 'Avoid strenuous lifting if you feel sharp muscle pain.', translation: 'Tránh các động tác nâng tạ nặng nhọc nếu bạn thấy đau nhói cơ.', note: 'Hoạt động tiêu tốn nhiều năng lượng và đòi hỏi nỗ lực lớn.', level: 'B2', scene: 'gym' },
      { id: 'stamina', term: 'stamina', ipa: '/ˈstæm.ə.nə/', type: 'noun', meaning: 'sức bền, thể lực dẻo dai', example: 'Swimming builds cardiovascular stamina without stressing joints.', translation: 'Bơi lội xây dựng sức bền tim mạch mà không gây áp lực lên khớp xương.', note: 'Khả năng duy trì vận động thể chất kéo dài mà không kiệt sức.', level: 'B2', scene: 'gym' },
      { id: 'stretch', term: 'stretch', ipa: '/stretʃ/', type: 'verb', meaning: 'giãn cơ, kéo căng', example: 'Always stretch your hamstrings after running to prevent tightness.', translation: 'Luôn giãn cơ gân kheo sau khi chạy để tránh bị căng cứng cơ.', note: 'Kéo dài các bó cơ để tăng độ dẻo dai và ngừa chấn thương.', level: 'A2', scene: 'gym' },
      { id: 'workout', term: 'workout', ipa: '/ˈwɜːr.kaʊt/', type: 'noun', meaning: 'buổi rèn luyện thể lực', example: 'A thirty-minute workout every morning keeps your mind sharp.', translation: 'Một buổi tập 30 phút mỗi sáng giúp tâm trí bạn luôn nhạy bén.', note: 'Tập hợp các bài rèn luyện thể chất có kế hoạch.', level: 'A2', scene: 'gym' },
      { id: 'energetic', term: 'energetic', ipa: '/ˌen.ɚˈdʒet̬.ɪk/', type: 'adjective', meaning: 'tràn đầy năng lượng', example: 'Upbeat workout music makes you feel much more energetic.', translation: 'Nhạc tập luyện sôi động khiến bạn cảm thấy tràn đầy năng lượng hơn nhiều.', note: 'Có dồi dào sức sống, nhiệt huyết và hoạt bát.', level: 'B1', scene: 'gym' },
    ],
  },
  {
    id: 'airport',
    title: 'Sân bay quốc tế',
    subtitle: 'Chuẩn bị cho những hành trình xa',
    image: '/scenes/airport.png',
    category: 'Du lịch',
    words: [
      { id: 'boarding-pass', term: 'boarding pass', ipa: '/ˈbɔːr.dɪŋ pæs/', type: 'noun', meaning: 'thẻ lên máy bay', example: 'Have your passport and boarding pass ready at the gate.', translation: 'Hãy chuẩn bị sẵn hộ chiếu và thẻ lên máy bay tại cổng khởi hành.', note: 'Thẻ chứng nhận quyền bước lên máy bay của hành khách.', level: 'A2', scene: 'airport' },
      { id: 'luggage', term: 'luggage', ipa: '/ˈlʌɡ.ɪdʒ/', type: 'noun', meaning: 'hành lý', example: 'We checked our heavy luggage at the airline counter.', translation: 'Chúng tôi đã gửi hành lý nặng tại quầy thủ tục của hãng bay.', note: 'Từ không đếm được; có thể dùng “a piece of luggage”.', level: 'A2', scene: 'airport' },
      { id: 'depart', term: 'depart', ipa: '/dɪˈpɑːrt/', type: 'verb', meaning: 'khởi hành, cất cánh', example: 'The flight is scheduled to depart on time at seven sharp.', translation: 'Chuyến bay dự kiến khởi hành đúng bảy giờ sáng.', note: 'Rời đi để bắt đầu một chặng đường; danh từ là “departure”.', level: 'B1', scene: 'airport' },
      { id: 'punctual', term: 'punctual', ipa: '/ˈpʌŋk.tʃu.əl/', type: 'adjective', meaning: 'đúng giờ, chuẩn xác', example: 'The express train service is renowned for being strictly punctual.', translation: 'Dịch vụ tàu cao tốc nổi tiếng vì luôn khởi hành đúng giờ nghiêm ngặt.', note: 'Diễn ra hoặc có mặt chính xác tại thời gian đã định.', level: 'B2', scene: 'airport' },
      { id: 'terminal', term: 'terminal', ipa: '/ˈtɜːr.mɪ.nəl/', type: 'noun', meaning: 'nhà ga sân bay', example: 'International departures leave from terminal two.', translation: 'Các chuyến bay quốc tế khởi hành từ nhà ga số hai.', note: 'Tòa nhà sân bay nơi hành khách làm thủ tục và chờ lên máy bay.', level: 'B1', scene: 'airport' },
      { id: 'customs', term: 'customs', ipa: '/ˈkʌs.təmz/', type: 'noun', meaning: 'cơ quan hải quan', example: 'Declare all commercial goods when passing through customs.', translation: 'Khai báo mọi hàng hóa thương mại khi làm thủ tục qua hải quan.', note: 'Luôn ở dạng số nhiều khi nói về nơi kiểm tra hàng hóa xuất nhập cảnh.', level: 'B1', scene: 'airport' },
      { id: 'carry-on', term: 'carry-on', ipa: '/ˈkær.i ɑːn/', type: 'noun', meaning: 'hành lý xách tay', example: 'Make sure your carry-on bag fits inside the overhead compartment.', translation: 'Đảm bảo vali xách tay của bạn vừa với khoang hành lý phía trên đầu.', note: 'Hành lý kích thước nhỏ được mang trực tiếp vào khoang máy bay.', level: 'B1', scene: 'airport' },
      { id: 'embark', term: 'embark', ipa: '/ɪmˈbɑːrk/', type: 'verb', meaning: 'lên tàu bay, bắt đầu hành trình', example: 'Passengers were invited to embark through gate number twelve.', translation: 'Hành khách được mời lên tàu bay qua cửa số 12.', note: 'Bắt đầu bước lên tàu, máy bay để khởi hành chuyến đi.', level: 'B2', scene: 'airport' },
    ],
  },
]

export const allWords = scenes.flatMap((scene) => scene.words)
