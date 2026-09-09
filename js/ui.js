(function () {
  var IMG = 'img/';
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  var NAV = [
    { href: 'index.html', label: '本季' },
    { href: 'shop.html', label: '器物' },
    { href: 'index.html#story', label: '窯誌' }
  ];

  var UI = {
    mount: function (current) {
      document.body.insertBefore(el(
        '<header class="hd"><div class="wrap hd-in">' +
        '<a class="brand" href="index.html">物候</a>' +
        '<nav class="nav" id="nav">' +
        NAV.map(function (n) {
          var cur = (n.href.split('#')[0] === current) ? ' aria-current="page"' : '';
          return '<a href="' + n.href + '"' + cur + '>' + n.label + '</a>';
        }).join('') +
        '</nav>' +
        '<div style="display:flex;align-items:center;gap:.5rem">' +
        '<button class="hd-cart" id="cartBtn" aria-label="開啟購物袋">購物袋 <b id="cartN">0</b></button>' +
        '<button class="nav-toggle" id="navBtn" aria-label="選單" aria-expanded="false">≡</button>' +
        '</div>' +
        '</div></header>'), document.body.firstChild);

      document.body.appendChild(el(
        '<footer><div class="wrap ft">' +
        '<span>物候 WUHOU　台北市大同區迪化街一段　週三至週日 12:00–19:00</span>' +
        '<span>示範網站 · 無實際交易 · 商品照片來自 Pexels</span>' +
        '</div></footer>'));

      document.body.appendChild(el('<div class="scrim" id="scrim"></div>'));
      document.body.appendChild(el(
        '<aside class="drawer" id="drawer" aria-hidden="true" aria-label="購物袋">' +
        '<div class="drawer-hd"><h2>購物袋</h2><button class="xclose" id="drawerX" aria-label="關閉">✕</button></div>' +
        '<div class="drawer-body" id="drawerBody"></div>' +
        '<div class="drawer-ft" id="drawerFt"></div>' +
        '</aside>'));
      document.body.appendChild(el('<div class="toast" id="toast" role="status" aria-live="polite"></div>'));

      var nav = document.getElementById('nav'), navBtn = document.getElementById('navBtn');
      navBtn.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        navBtn.setAttribute('aria-expanded', String(open));
        navBtn.textContent = open ? '✕' : '≡';
      });
      document.getElementById('cartBtn').addEventListener('click', function () { UI.openDrawer(); });
      document.getElementById('drawerX').addEventListener('click', UI.closeDrawer);
      document.getElementById('scrim').addEventListener('click', UI.closeDrawer);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') UI.closeDrawer(); });

      Store.onChange(UI.syncCount);
      UI.syncCount();
    },

    syncCount: function () {
      var n = document.getElementById('cartN');
      if (n) n.textContent = Store.count();
      if (document.getElementById('drawer').classList.contains('on')) UI.renderDrawer();
    },

    openDrawer: function (justAdded) {
      UI.renderDrawer(justAdded);
      document.getElementById('drawer').classList.add('on');
      document.getElementById('drawer').setAttribute('aria-hidden', 'false');
      document.getElementById('scrim').classList.add('on');
    },
    closeDrawer: function () {
      document.getElementById('drawer').classList.remove('on');
      document.getElementById('drawer').setAttribute('aria-hidden', 'true');
      document.getElementById('scrim').classList.remove('on');
    },

    renderDrawer: function (justAdded) {
      var body = document.getElementById('drawerBody'), ft = document.getElementById('drawerFt');
      var items = Store.items();

      if (!items.length) {
        body.innerHTML = '<div class="empty"><p>購物袋是空的。</p><a class="btn-ghost btn" href="shop.html">去看看器物</a></div>';
        ft.innerHTML = ''; return;
      }

      body.innerHTML = items.map(function (it, i) {
        var p = it.type === 'addon' ? WUHOU.findAddon(it.id) : WUHOU.find(it.id);
        return '<div class="line">' +
          '<img src="' + IMG + p.img + '" alt="' + esc(p.name) + '">' +
          '<div><div class="n">' + esc(p.name) + '</div>' +
          (it.opt ? '<div class="o">' + esc(it.opt) + '</div>' : '') +
          '<div class="tools2"><button data-dec="' + i + '">−</button><span>' + it.qty + '</span>' +
          '<button data-inc="' + i + '">＋</button><button data-rm="' + i + '">移除</button></div></div>' +
          '<div class="p">' + money(Store.priceOf(it) * it.qty) + '</div></div>';
      }).join('');

      // 加購：只推跟剛加入的東西相容的（Dyson 的做法，但不另外跳一頁）
      var base = justAdded && justAdded.type === 'product' ? justAdded.id : null;
      if (base) {
        var have = items.map(function (x) { return x.type + ':' + x.id; });
        var recs = WUHOU.addons.filter(function (a) {
          return a.for.indexOf(base) >= 0 && have.indexOf('addon:' + a.id) < 0;
        }).slice(0, 2);
        if (recs.length) {
          body.insertAdjacentHTML('beforeend',
            '<div style="margin-top:1.6rem;padding-top:1.2rem;border-top:1px solid var(--line)">' +
            '<div style="font-size:.8rem;color:var(--faint);letter-spacing:.1em;margin-bottom:.9rem">常和它一起帶走</div>' +
            recs.map(function (a) {
              return '<div class="line"><img src="' + IMG + a.img + '" alt="' + esc(a.name) + '">' +
                '<div><div class="n">' + esc(a.name) + '</div>' +
                '<div class="p" style="margin-top:.25rem">' + money(a.price) +
                (a.was ? '<span class="was" style="margin-left:.4rem;text-decoration:line-through;color:var(--faint)">' + money(a.was) + '</span>' : '') + '</div></div>' +
                '<button class="chip" data-addon="' + a.id + '" style="align-self:center">加入</button></div>';
            }).join('') + '</div>');
        }
      }

      var t = Store.totals(Store.promo());
      ft.innerHTML =
        (t.toFree > 0
          ? '<div class="freebar">再 ' + money(t.toFree) + ' 免運<div class="track"><div class="fill" style="width:' +
          Math.min(100, Math.round((1 - t.toFree / WUHOU.freeShipping) * 100)) + '%"></div></div></div>'
          : '<div class="freebar">已符合免運</div>') +
        '<div class="sum"><div><span>小計</span><span>' + money(t.subtotal) + '</span></div>' +
        '<div><span>運費</span><span>' + (t.shipping ? money(t.shipping) : '免運') + '</span></div>' +
        '<div class="t"><span>總計</span><span>' + money(t.total) + '</span></div></div>' +
        '<a class="btn" href="cart.html" style="width:100%;margin-top:1rem">前往購物袋</a>';

      body.querySelectorAll('[data-dec]').forEach(function (b) {
        b.onclick = function () { var i = +b.dataset.dec; Store.setQty(i, Store.items()[i].qty - 1); UI.renderDrawer(); };
      });
      body.querySelectorAll('[data-inc]').forEach(function (b) {
        b.onclick = function () { var i = +b.dataset.inc; Store.setQty(i, Store.items()[i].qty + 1); UI.renderDrawer(); };
      });
      body.querySelectorAll('[data-rm]').forEach(function (b) {
        b.onclick = function () { Store.remove(+b.dataset.rm); UI.renderDrawer(); };
      });
      body.querySelectorAll('[data-addon]').forEach(function (b) {
        b.onclick = function () { Store.add('addon', b.dataset.addon, null, 1); UI.toast('已加入'); UI.renderDrawer(); };
      });
    },

    toast: function (msg) {
      var t = document.getElementById('toast');
      t.textContent = msg; t.classList.add('on');
      clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2200);
    },

    card: function (p) {
      var from = WUHOU.fromPrice(p);
      var multi = p.options.filter(function (o) { return o.stock !== 'na'; }).length > 1;
      var last = p.options.some(function (o) { return o.last; });
      return '<a class="card" href="product.html?id=' + p.id + '">' +
        '<div class="card-fig"><img src="' + IMG + p.img + '" alt="' + esc(p.name) + '" loading="lazy" width="900" height="900">' +
        '<div class="card-act">查看</div></div>' +
        '<div><div class="card-name">' + esc(p.name) + '</div>' +
        '<div class="card-price">' + money(from) + (multi ? '<span style="font-family:var(--serif);font-size:.78rem"> 起</span>' : '') + '</div>' +
        (last ? '<div class="card-flag">僅餘一件</div>' : '') + '</div></a>';
    }
  };

  window.UI = UI;
  window.esc = esc;
})();
