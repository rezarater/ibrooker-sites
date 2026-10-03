/* iBrooker scroll story: noise -> filtered -> verified -> connected -> mandate -> shipped */
(function () {
  var story = document.getElementById('story');
  if (!story) return;
  var canvas = story.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var caps = [].slice.call(story.querySelectorAll('.cap'));
  var sheet = story.querySelector('.story-sheet');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rtl = document.documentElement.dir === 'rtl';

  // Regional hubs (lon, lat). Unlabelled points: the map is abstract on purpose.
  var hubs = [
    [28.9, 41.0], [34.6, 36.8], [44.8, 41.7], [49.9, 40.4], [44.5, 40.2],
    [44.4, 33.3], [47.9, 30.5], [55.3, 25.2], [58.4, 23.6], [51.5, 25.3],
    [46.7, 24.7], [69.2, 41.3], [76.9, 43.2], [58.4, 37.9], [69.2, 34.5],
    [67.0, 24.9], [51.4, 35.7], [56.3, 27.2], [59.6, 36.3], [39.2, 21.5],
    [36.3, 33.5], [35.9, 31.9], [63.6, 40.1], [74.6, 42.9], [65.8, 42.0]
  ];
  var A = 2, B = 11; // the two hubs that get connected

  var W, H, DPR, nodes = [], parts = [], N, p = 0, target = 0, t0 = performance.now();

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp(x); return x * x * (3 - 2 * x); }
  function seg(p, a, b) { return ease((p - a) / (b - a)); }

  function layout() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var mobile = W < 760;
    var bw = mobile ? W * 0.92 : Math.min(W * 0.62, 980);
    var bh = mobile ? H * 0.42 : H * 0.62;
    var cx = mobile ? W / 2 : (rtl ? W * 0.40 : W * 0.60);
    var cy = mobile ? H * 0.34 : H * 0.48;
    var lon0 = 26, lon1 = 80, lat0 = 19, lat1 = 46;
    var sx = bw / (lon1 - lon0), sy = bh / (lat1 - lat0), s = Math.min(sx, sy);
    nodes = hubs.map(function (h) {
      return { x: cx + (h[0] - (lon0 + lon1) / 2) * s, y: cy - (h[1] - (lat0 + lat1) / 2) * s * 1.15 };
    });
    var want = mobile ? 650 : 1800;
    if (parts.length !== want) build(want);
  }

  function build(n) {
    N = n; parts = [];
    for (var i = 0; i < n; i++) {
      var survivor = Math.random() < 0.11;
      parts.push({
        x: rnd(0, 1), y: rnd(0, 1), vx: rnd(-1, 1), vy: rnd(-1, 1),
        r: rnd(0.6, 2.3), ph: rnd(0, 6.28), sp: rnd(0.2, 1),
        surv: survivor, node: Math.floor(Math.random() * hubs.length),
        jx: rnd(-14, 14), jy: rnd(-14, 14), fall: rnd(0.3, 1.2)
      });
    }
  }

  function arcPoint(t) {
    var a = nodes[A], b = nodes[B];
    var mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - Math.abs(b.x - a.x) * 0.38;
    var u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * mx + t * t * b.x, y: u * u * a.y + 2 * u * t * my + t * t * b.y };
  }

  function draw(now) {
    var time = (now - t0) / 1000;
    p += (target - p) * 0.12;
    ctx.clearRect(0, 0, W, H);

    var kFilter = seg(p, 0.22, 0.34);
    var kGather = seg(p, 0.36, 0.52);
    var kRings = seg(p, 0.48, 0.56);
    var kArc = seg(p, 0.57, 0.72);
    var kFocus = seg(p, 0.74, 0.84);
    var kShip = seg(p, 0.90, 0.97);

    // constellation lines
    if (kGather > 0.05) {
      ctx.lineWidth = 0.6;
      for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < W * 0.13) {
          ctx.strokeStyle = 'rgba(140,170,255,' + (0.16 * kGather * (1 - kFocus * 0.7)) + ')';
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
    }

    // particles
    for (var k = 0; k < N; k++) {
      var q = parts[k];
      var dxp = (q.x * W + Math.sin(time * 0.25 * q.sp + q.ph) * 40 + q.vx * time * 6) % W;
      var dyp = (q.y * H + Math.cos(time * 0.2 * q.sp + q.ph) * 30 + q.vy * time * 4) % H;
      if (dxp < 0) dxp += W; if (dyp < 0) dyp += H;
      var x = dxp, y = dyp, a = 0.5 + 0.35 * Math.sin(time * 1.6 * q.sp + q.ph), col = '200,215,255';
      if (!q.surv) {
        a *= (1 - kFilter);
        y += kFilter * H * 0.35 * q.fall;
        if (kFilter > 0.05) col = '214,120,96';
        if (a < 0.01) continue;
      } else {
        var n = nodes[q.node];
        x = dxp + (n.x + q.jx - dxp) * kGather;
        y = dyp + (n.y + q.jy - dyp) * kGather;
        a = Math.max(a, 0.55 + kFilter * 0.3);
        col = kGather > 0.5 ? '255,214,140' : '220,232,255';
        a *= 1 - kFocus * 0.75 * ((q.node === A || q.node === B) ? 0 : 1);
      }
      ctx.fillStyle = 'rgba(' + col + ',' + a + ')';
      ctx.beginPath(); ctx.arc(x, y, q.r, 0, 6.283); ctx.fill();
    }

    // verification rings
    if (kRings > 0) {
      for (var m = 0; m < nodes.length; m++) {
        var focusDim = (m === A || m === B) ? 1 : 1 - kFocus * 0.8;
        var rr = (6 + 10 * kRings) * (W < 760 ? 0.55 : 1);
        ctx.strokeStyle = 'rgba(227,182,92,' + (0.75 * kRings * focusDim) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(nodes[m].x, nodes[m].y, rr, 0, 6.283 * kRings); ctx.stroke();
        ctx.fillStyle = 'rgba(255,236,196,' + (0.9 * kRings * focusDim) + ')';
        ctx.beginPath(); ctx.arc(nodes[m].x, nodes[m].y, 2.2, 0, 6.283); ctx.fill();
      }
    }

    // the connection arc
    if (kArc > 0) {
      var steps = 80, end = Math.floor(steps * kArc);
      ctx.save();
      ctx.shadowColor = 'rgba(111,211,232,0.9)'; ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(150,230,245,0.95)'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var s2 = 0; s2 <= end; s2++) { var pt = arcPoint(s2 / steps); s2 ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y); }
      ctx.stroke(); ctx.restore();
      [A, B].forEach(function (idx, ii) {
        if (ii === 1 && kArc < 0.98) return;
        var g = 18 + 6 * Math.sin(time * 3);
        var grd = ctx.createRadialGradient(nodes[idx].x, nodes[idx].y, 0, nodes[idx].x, nodes[idx].y, g);
        grd.addColorStop(0, 'rgba(150,230,245,0.8)'); grd.addColorStop(1, 'rgba(150,230,245,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(nodes[idx].x, nodes[idx].y, g, 0, 6.283); ctx.fill();
      });
    }

    // shipment pulses along the arc
    if (kShip > 0) {
      for (var c = 0; c < 3; c++) {
        var tt = ((time * 0.28 + c / 3) % 1);
        var sp2 = arcPoint(tt);
        ctx.fillStyle = 'rgba(255,214,140,' + kShip + ')';
        ctx.beginPath(); ctx.arc(sp2.x, sp2.y, 3.4, 0, 6.283); ctx.fill();
      }
    }

    // captions
    caps.forEach(function (el) {
      var a0 = +el.dataset.from, a1 = +el.dataset.to, fade = 0.035;
      var o = Math.min(a0 <= 0 ? 1 : clamp((p - a0) / fade), clamp((a1 - p) / fade));
      if (a1 >= 1) o = clamp((p - a0) / fade);
      el.style.opacity = o;
      el.style.transform = 'translateY(' + ((1 - o) * 14) + 'px)';
      el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
    });
    if (sheet) {
      var so = Math.min(seg(p, 0.75, 0.80), 1 - seg(p, 0.88, 0.91));
      sheet.style.opacity = so;
      sheet.style.transform = 'translate(-50%,-50%) scale(' + (0.94 + 0.06 * so) + ')';
      sheet.style.visibility = so > 0.01 ? 'visible' : 'hidden';
      sheet.classList.toggle('stamped', p > 0.82);
    }
    if (!reduce) requestAnimationFrame(draw);
  }

  function onScroll() {
    var r = story.getBoundingClientRect();
    var total = story.offsetHeight - window.innerHeight;
    target = clamp(-r.top / total);
  }

  layout();
  window.addEventListener('resize', layout);
  if (reduce) {
    story.classList.add('static');
    p = target = 0.95;
    draw(performance.now());
    return;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); p = target;
  requestAnimationFrame(draw);
})();
