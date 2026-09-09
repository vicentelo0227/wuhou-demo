// 購物車狀態。全部存在瀏覽器裡，沒有後端。
(function () {
  var KEY = 'wuhou-cart-v1';
  var listeners = [];
  var state = { items: [], saved: [], order: null, promo: null, ship: 'home' };
  var SHIP_FEE = { home: 120, store: 60, pickup: 0 };

  // localStorage 在無痕視窗或關閉站台資料時會直接丟例外，一律包起來
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && Array.isArray(o.items)) ? o : null;
    } catch (e) { return null; }
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 存不了就只活在這次瀏覽 */ }
  }

  function known(it) {
    if (!it || typeof it !== 'object') return false;
    return it.type === 'addon' ? !!WUHOU.findAddon(it.id) : !!WUHOU.find(it.id);
  }
  // 載入時就把下架品項清掉、數量夾回範圍，之後畫面索引才會跟內部陣列一致
  function clean(list) {
    return (Array.isArray(list) ? list : []).filter(known).map(function (it) {
      var q = Math.round(Number(it.qty));
      return {
        type: it.type, id: it.id, opt: it.opt || null,
        qty: Math.max(1, Math.min(9, isFinite(q) ? q : 1))
      };
    });
  }

  var loaded = read();
  if (loaded) {
    state.items = clean(loaded.items);
    state.saved = clean(loaded.saved);
    state.order = loaded.order || null;
    state.promo = loaded.promo || null;
    state.ship = loaded.ship || 'home';
  }

  function keyOf(it) { return it.type + ':' + it.id + ':' + (it.opt || ''); }

  function priceOf(it) {
    if (it.type === 'addon') {
      var a = WUHOU.findAddon(it.id);
      return a ? a.price : 0;
    }
    var p = WUHOU.find(it.id);
    if (!p) return 0;
    var o = p.options.filter(function (x) { return (x.v || '') === (it.opt || ''); })[0] || p.options[0];
    return o ? o.price : 0;
  }

  function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
  function emit() { write(); notify(); }

  // 另一個分頁改了購物車就跟著更新，否則兩邊會互相覆蓋而且畫面數字對不上
  window.addEventListener('storage', function (e) {
    if (e.key && e.key !== KEY) return;
    var o = read();
    state.items = clean(o && o.items);
    state.saved = clean(o && o.saved);
    state.order = (o && o.order) || null;
    state.promo = (o && o.promo) || null;
    state.ship = (o && o.ship) || 'home';
    notify();                                   // 只通知，不回寫，避免兩個分頁互相觸發
    window.dispatchEvent(new CustomEvent('wuhou:sync'));
  });

  var Store = {
    onChange: function (fn) { listeners.push(fn); return fn; },

    items: function () { return state.items.slice(); },
    saved: function () { return state.saved.slice(); },

    count: function () {
      return Store.items().reduce(function (n, it) { return n + it.qty; }, 0);
    },

    add: function (type, id, opt, qty) {
      qty = Math.max(1, Math.min(9, qty || 1));
      var it = { type: type, id: id, opt: opt || null, qty: qty };
      var hit = state.items.filter(function (x) { return keyOf(x) === keyOf(it); })[0];
      if (hit) hit.qty = Math.min(9, hit.qty + qty);
      else state.items.push(it);
      emit();
      return it;
    },

    setQty: function (idx, qty) {
      var it = state.items[idx];
      if (!it) return;
      qty = Math.max(0, Math.min(9, qty));
      if (qty === 0) state.items.splice(idx, 1);
      else it.qty = qty;
      emit();
    },

    remove: function (idx) { state.items.splice(idx, 1); emit(); },

    saveForLater: function (idx) {
      var it = state.items.splice(idx, 1)[0];
      if (it) state.saved.push(it);
      emit();
    },
    moveToCart: function (idx) {
      var it = state.saved.splice(idx, 1)[0];
      if (it) Store.add(it.type, it.id, it.opt, it.qty);
      else emit();
    },
    dropSaved: function (idx) { state.saved.splice(idx, 1); emit(); },

    priceOf: priceOf,

    ship: function (v) {
      if (v === undefined) return state.ship || 'home';
      if (SHIP_FEE[v] !== undefined) { state.ship = v; emit(); }
      return state.ship;
    },

    // 免運門檻用「折扣前小計」判斷，否則打了折反而冒出運費、總價變高，客戶會看不懂
    totals: function (promo) {
      var subtotal = state.items.reduce(function (n, it) { return n + priceOf(it) * it.qty; }, 0);
      var discount = (promo && subtotal > 0) ? Math.round(subtotal * 0.1) : 0;
      var fee = SHIP_FEE[state.ship];
      if (fee === undefined) fee = SHIP_FEE.home;
      var free = subtotal === 0 || subtotal >= WUHOU.freeShipping;
      var shipping = free ? 0 : fee;
      return {
        subtotal: subtotal, discount: discount, shipping: shipping,
        total: subtotal - discount + shipping,
        toFree: Math.max(0, WUHOU.freeShipping - subtotal)
      };
    },

    placeOrder: function (form) {
      var t = Store.totals(state.promo);
      state.order = {
        no: 'WH' + String(Date.now()).slice(-8),
        at: new Date().toISOString(),
        items: Store.items().map(function (it) {
          var name = it.type === 'addon' ? WUHOU.findAddon(it.id).name : WUHOU.find(it.id).name;
          return { name: name, opt: it.opt, qty: it.qty, price: priceOf(it) };
        }),
        totals: t, form: form
      };
      state.items = []; state.promo = null;
      emit();
      return state.order;
    },
    lastOrder: function () { return state.order; },

    promo: function (code) {
      if (code === undefined) return state.promo || null;
      state.promo = code || null; emit(); return state.promo;
    },

    reset: function () { state.items = []; state.saved = []; state.order = null; state.promo = null; emit(); }
  };

  window.Store = Store;
  window.money = function (n) { return 'NT$' + Number(n).toLocaleString('en-US'); };
})();
