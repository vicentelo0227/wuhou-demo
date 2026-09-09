// 購物車狀態。全部存在瀏覽器裡，沒有後端。
(function () {
  var KEY = 'wuhou-cart-v1';
  var listeners = [];
  var state = { items: [], saved: [], order: null };

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

  var loaded = read();
  if (loaded) {
    state.items = loaded.items || [];
    state.saved = loaded.saved || [];
    state.order = loaded.order || null;
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

  function emit() { write(); listeners.forEach(function (f) { try { f(); } catch (e) {} }); }

  var Store = {
    onChange: function (fn) { listeners.push(fn); return fn; },

    items: function () {
      // 過濾掉資料裡已不存在的品項，避免舊 localStorage 讓頁面爆掉
      return state.items.filter(function (it) {
        return it.type === 'addon' ? !!WUHOU.findAddon(it.id) : !!WUHOU.find(it.id);
      });
    },
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

    // 金額摘要：小計、運費、折扣、總計 —— 運費一定要在購物車就算出來
    totals: function (promo) {
      var subtotal = Store.items().reduce(function (n, it) { return n + priceOf(it) * it.qty; }, 0);
      var discount = 0;
      if (promo && subtotal > 0) discount = Math.round(subtotal * 0.1);
      var after = subtotal - discount;
      var shipping = (after >= WUHOU.freeShipping || after === 0) ? 0 : WUHOU.shippingFee;
      return {
        subtotal: subtotal, discount: discount, shipping: shipping,
        total: after + shipping,
        toFree: Math.max(0, WUHOU.freeShipping - after)
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
