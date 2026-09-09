// Demo catalogue. stock: in = 可購買, soon = 暫時缺貨（可登記通知）, na = 此規格不生產
window.WUHOU = {
  freeShipping: 2000,
  shippingFee: 120,
  products: [
    {
      id: 'teapot', name: '圓丘壺', kind: '壺', kiln: 'No.14',
      img: 'teapot.jpg', gallery: ['teapot.jpg', 'glaze.jpg', 'hands.jpg'],
      blurb: '壺身壓低、壺腹放寬，出水時手腕不必抬高，適合桌面較低的茶席使用。內壁不施釉，長期沖泡會吸附茶湯顏色，屬正常現象，不需刻意刷除。適合半發酵、茶湯偏橙黃的茶種，如金萱、凍頂烏龍。',
      optionName: '容量',
      options: [
        { v: '380 ml', price: 2480, stock: 'in' },
        { v: '560 ml', price: 2980, stock: 'in' },
        { v: '720 ml', price: 3480, stock: 'soon', note: '這批已售完，下批預計十一月' }
      ],
      spec: { '材質': '陶土，外層透明釉', '尺寸': '直徑 14 cm　高 9.5 cm', '重量': '約 420 g', '產地': '南投', '使用': '可洗碗機　不可直火' }
    },
    {
      id: 'vase', name: '疊石花器', kind: '花器', kiln: 'No.14',
      img: 'vase.jpg', gallery: ['vase.jpg', 'still.jpg', 'hands.jpg'],
      blurb: '上下兩段分開成型、分別入窯，出窯後再行接合，接縫處保留原本的高低差，不做打磨。瓶口內徑 6 cm，適合乾燥花、單枝或短莖切花。',
      options: [{ v: null, price: 3200, stock: 'in' }],
      spec: { '材質': '陶土，局部化妝土', '尺寸': '高 24 cm　最寬 16 cm', '數量': '本期 5 件', '產地': '南投', '使用': '可盛水' }
    },
    {
      id: 'cup', name: '條紋手感杯', kind: '杯', kiln: 'No.13',
      img: 'cup.jpg', gallery: ['cup.jpg', 'glaze.jpg', 'shelf.jpg'],
      blurb: '杯身條紋為成型時指腹推壓化妝土所留，每只的間距、深淺皆不相同。杯口微向外翻，飲用時不易沿杯緣滴落，容量約 260 ml，日常茶飲或咖啡都適用。',
      optionName: '釉色',
      options: [
        { v: '墨', price: 880, stock: 'in' },
        { v: '米白', price: 880, stock: 'in' },
        { v: '落灰', price: 980, stock: 'na', note: '落灰釉只在柴燒窯出，這個杯型沒有排進柴燒' }
      ],
      spec: { '材質': '陶土，化妝土條紋', '尺寸': '直徑 8 cm　高 9 cm', '容量': '約 260 ml', '產地': '南投', '使用': '可洗碗機　可微波' }
    },
    {
      id: 'cloth', name: '亞麻桌巾', kind: '織物', kiln: null,
      img: 'cloth.jpg', gallery: ['cloth.jpg', 'still.jpg', 'shelf.jpg'],
      blurb: '比利時亞麻，出貨前經三次水洗使纖維收縮定型，因此表面自然帶有摺痕與輕微色差，非商品瑕疵。日常冷水機洗即可，越洗越軟，不需熨燙。',
      optionName: '尺寸',
      options: [
        { v: '140 × 200 cm', price: 1680, stock: 'in', last: true },
        { v: '160 × 260 cm', price: 2280, stock: 'soon', note: '布還在染，十月中回來' }
      ],
      spec: { '材質': '比利時亞麻 100%', '產地': '台南　手工車邊', '洗滌': '冷水機洗　勿漂白', '狀態': '中尺寸僅餘一件' }
    },
    {
      id: 'bottle', name: '黑釉曲頸瓶', kind: '花器', kiln: 'No.14',
      img: 'bottle.jpg', gallery: ['bottle.jpg', 'glaze.jpg', 'still.jpg'],
      blurb: '黑釉入柴窯燒製，頸部於高溫中自然傾倒，出窯後未做校正，因此每只的傾斜角度、落灰堆積的位置都不相同。斜口可讓花材向外倚靠，適合單枝或線條較長的枝條。本窯共出八只，恕不挑選。',
      options: [{ v: null, price: 4600, stock: 'in', last: true }],
      spec: { '材質': '陶土，黑釉落灰', '尺寸': '高 31 cm　最寬 18 cm', '數量': '本窯八只，餘三只', '產地': '南投', '使用': '可盛水' }
    },
    {
      id: 'ewer', name: '白瓷水注', kind: '壺', kiln: 'No.13',
      img: 'ewer.jpg', gallery: ['ewer.jpg', 'still.jpg', 'glaze.jpg'],
      blurb: '瓷土高溫燒製，注水口收窄，出水細而可控，原為茶席溫杯、注水而設計，用於小型盆栽澆灌亦合適。容量約 400 ml，建議手洗。',
      options: [{ v: null, price: 2960, stock: 'in' }],
      spec: { '材質': '瓷土，透明釉', '尺寸': '高 19 cm　容量約 400 ml', '產地': '鶯歌', '使用': '手洗為宜' }
    }
  ],

  // 加入購物車後推薦的相容加購（Dyson 的做法）
  addons: [
    { id: 'stand', name: '胡桃木杯墊　四入', price: 680, was: 880, img: 'still.jpg', for: ['cup', 'ewer'] },
    { id: 'care', name: '陶器保養油　50 ml', price: 320, was: 420, img: 'glaze.jpg', for: ['teapot', 'vase', 'bottle', 'ewer'] },
    { id: 'wrap', name: '棉麻收納袋', price: 260, was: 360, img: 'cloth.jpg', for: ['teapot', 'cup', 'ewer', 'vase', 'bottle', 'cloth'] },
    { id: 'card', name: '手寫卡片與包裝', price: 120, was: null, img: 'shelf.jpg', for: ['teapot', 'cup', 'ewer', 'vase', 'bottle', 'cloth'] }
  ]
};

window.WUHOU.find = function (id) {
  return window.WUHOU.products.filter(function (p) { return p.id === id; })[0] || null;
};
window.WUHOU.findAddon = function (id) {
  return window.WUHOU.addons.filter(function (a) { return a.id === id; })[0] || null;
};
// 未選規格時列表頁顯示的起始價
window.WUHOU.fromPrice = function (p) {
  var ok = p.options.filter(function (o) { return o.stock !== 'na'; });
  if (!ok.length) return null;                 // 全部規格都不生產時別回 Infinity
  return Math.min.apply(null, ok.map(function (o) { return o.price; }));
};
window.WUHOU.hasChoice = function (p) {
  return p.options.length > 1;
};
