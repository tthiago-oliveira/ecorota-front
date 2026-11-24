// =====================================================================
// EcoRota · ilustrações desenhadas em SVG (sem fotos de terceiros)
// Cada tipo de lugar tem uma cena: praia, gruta, cachoeira, rio, trilha...
// A "semente" (o id do registro) muda cores e posições, então cada cartão fica diferente.
// =====================================================================
const Arte = (() => {
  let unico = 0;
  const r = n => Math.round(n * 10) / 10;

  // gerador de números aleatórios previsível (mesma semente = mesmo desenho)
  function aleatorio(semente) {
    let a = ((Number(semente) || 1) * 2654435761) >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // linha suave passando pelos pontos (Catmull-Rom convertida em curvas de Bézier)
  function suave(p) {
    let d = `M${r(p[0][0])} ${r(p[0][1])}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += ` C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ${r(p2[0])} ${r(p2[1])}`;
    }
    return d;
  }

  // serra: crista ondulada de x0 a x1, fechada até o chão
  function serra(rnd, { W, H, y, amp, n, x0 = -40, x1 = W + 40 }) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n + (i && i < n ? (rnd() - 0.5) * ((x1 - x0) / n) * 0.5 : 0);
      pts.push([x, y - amp * (0.3 + 0.7 * rnd())]);
    }
    return `${suave(pts)} L${x1} ${H + 10} L${x0} ${H + 10} Z`;
  }

  // chapada: morros de topo plano
  function mesa(x, y, larg, alt, H) {
    const t = larg * 0.12;
    return `M${r(x - t)} ${H + 10} L${r(x + t * 0.6)} ${r(y + alt * 0.15)} Q${r(x + t)} ${r(y)} ${r(x + t * 2)} ${r(y)}
      L${r(x + larg - t * 2)} ${r(y + 2)} Q${r(x + larg - t)} ${r(y + 2)} ${r(x + larg - t * 0.5)} ${r(y + alt * 0.2)} L${r(x + larg + t)} ${H + 10} Z`;
  }

  const nuvem = (x, y, s, dur, op = 0.9) => `
    <g class="nuvem" style="--dur:${dur}s"><g transform="translate(${r(x)} ${r(y)}) scale(${s})" fill="#fff" opacity="${op}">
      <ellipse cx="0" cy="0" rx="46" ry="16"/><ellipse cx="-22" cy="-8" rx="24" ry="18"/>
      <ellipse cx="14" cy="-14" rx="28" ry="22"/><ellipse cx="40" cy="-4" rx="20" ry="13"/></g></g>`;

  const passaros = (x, y, s) => `
    <g class="passaros" transform="translate(${r(x)} ${r(y)}) scale(${s})" fill="none" stroke="#2b3f37" stroke-width="2.2" stroke-linecap="round" opacity=".55">
      <path class="asa" d="M0 0q6-6 12 0q6-6 12 0"/><path class="asa a2" d="M30 -14q5-5 10 0q5-5 10 0"/><path class="asa a3" d="M52 4q4-4 8 0q4-4 8 0"/></g>`;

  const arvore = (x, y, s, cor, escura) => `
    <g transform="translate(${r(x)} ${r(y)}) scale(${r(s * 100) / 100})">
      <rect x="-3" y="-8" width="6" height="26" rx="2" fill="#6b4a2e"/>
      <circle cx="-12" cy="-16" r="16" fill="${escura}"/><circle cx="12" cy="-18" r="17" fill="${escura}"/>
      <circle cx="0" cy="-32" r="19" fill="${cor}"/><circle cx="-6" cy="-22" r="13" fill="${cor}"/></g>`;

  const pinheiro = (x, y, s, cor) => `
    <g transform="translate(${r(x)} ${r(y)}) scale(${r(s * 100) / 100})" fill="${cor}">
      <rect x="-2.5" y="-6" width="5" height="14" fill="#5b3f27"/>
      <path d="M0-62L16-30H8L22-6H-22L-8-30H-16Z"/></g>`;

  const arvoreCerrado = (x, y, s, cor) => `
    <g transform="translate(${r(x)} ${r(y)}) scale(${r(s * 100) / 100})">
      <path d="M0 0C-2-14 4-20 0-34M0-22C6-26 12-28 16-34M0-28C-6-31-12-32-16-38" stroke="#6b4a2e" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-38" rx="26" ry="9" fill="${cor}"/><ellipse cx="16" cy="-36" rx="14" ry="7" fill="${cor}"/>
      <ellipse cx="-17" cy="-40" rx="13" ry="7" fill="${cor}"/></g>`;

  const palmeira = (x, y, s) => `
    <g transform="translate(${r(x)} ${r(y)}) scale(${r(s * 100) / 100})">
      <path d="M0 0C4-40 14-80 34-112" stroke="#8a5a34" stroke-width="9" fill="none" stroke-linecap="round"/>
      <g fill="#2f7d4f" transform="translate(34 -112)">
        <path d="M0 0C-30-14-56-6-74 14C-50 0-26-2 0 0Z"/><path d="M0 0C-14-28-42-40-66-34C-40-28-20-16 0 0Z"/>
        <path d="M0 0C10-30 36-44 62-40C36-30 18-16 0 0Z"/><path d="M0 0C28-12 56-6 72 14C48 2 24-2 0 0Z"/>
        <path d="M0 0C4 22-8 46-26 60C-12 38-6 18 0 0Z" fill="#256a42"/></g>
      <circle cx="32" cy="-108" r="5" fill="#6b4a2e"/><circle cx="40" cy="-106" r="5" fill="#6b4a2e"/></g>`;

  const peixe = (x, y, s, cor, dur) => `
    <g class="peixe" style="--dur:${dur}s"><g transform="translate(${r(x)} ${r(y)}) scale(${s})">
      <path d="M0 0C10-10 30-10 40 0C30 10 10 10 0 0Z" fill="${cor}"/><path d="M38 0L52-9V9Z" fill="${cor}"/>
      <circle cx="9" cy="-2" r="1.6" fill="#0b2530"/></g></g>`;

  function ondas(y, W, cor, amp, comp, op, dur) {
    let d = `M-${comp} ${y}`;
    for (let x = -comp; x < W + comp * 2; x += comp) d += ` q${comp / 4} ${-amp} ${comp / 2} 0 t${comp / 2} 0`;
    return `<path class="onda" style="--dur:${dur}s;--comp:${comp}px" d="${d}" fill="none" stroke="${cor}" stroke-width="2.4" stroke-linecap="round" opacity="${op}"/>`;
  }

  function gradV(id, cores) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${cores.map((c, i) =>
      `<stop offset="${r(i / (cores.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  }

  const CEUS = [
    ['#8fd3f4', '#e6f7fd', '#fff6cf'],
    ['#ffbf8f', '#ffeed8', '#fff6dd'],
    ['#79c6ea', '#d4effa', '#fffbe8'],
    ['#f6a77c', '#fcd9bd', '#ffe9c7'],
  ];

  function ceu(id, rnd, W, H, paleta) {
    const [c1, c2, sol] = paleta;
    const sx = W * (0.55 + rnd() * 0.3), sy = H * (0.18 + rnd() * 0.12), sr = Math.min(W, H) * 0.07;
    return `<defs>${gradV(id + 'c', [c1, c2])}
      <radialGradient id="${id}s"><stop offset="0" stop-color="${sol}"/><stop offset=".3" stop-color="${sol}" stop-opacity=".6"/><stop offset="1" stop-color="${sol}" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}c)"/>
      <circle class="brilho-sol" cx="${r(sx)}" cy="${r(sy)}" r="${r(sr * 3.2)}" fill="url(#${id}s)"/>
      <circle cx="${r(sx)}" cy="${r(sy)}" r="${r(sr)}" fill="${sol}"/>
      ${nuvem(W * 0.15 + rnd() * W * 0.2, H * (0.12 + rnd() * 0.1), 0.9 + rnd() * 0.5, 50 + rnd() * 30)}
      ${nuvem(W * 0.6 + rnd() * W * 0.25, H * (0.08 + rnd() * 0.12), 0.6 + rnd() * 0.4, 70 + rnd() * 30, 0.75)}`;
  }

  // ------------------------------------------------------------ cenas
  const CENAS = {
    montanhas(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[Math.floor(rnd() * 3)])}
        <defs>${gradV(id + 'l', ['#7fcfe0', '#2f95b3'])}</defs>
        <path d="${serra(rnd, { W, H, y: H * 0.5, amp: H * 0.22, n: 5 })}" fill="#a9d0bd"/>
        <path d="${serra(rnd, { W, H, y: H * 0.6, amp: H * 0.18, n: 6 })}" fill="#6fae86"/>
        ${passaros(W * 0.25, H * 0.28, 1)}
        <rect y="${r(H * 0.7)}" width="${W}" height="${r(H * 0.3)}" fill="url(#${id}l)"/>
        ${ondas(H * 0.76, W, '#e9fbff', 4, 90, 0.5, 9)}${ondas(H * 0.86, W, '#e9fbff', 5, 120, 0.35, 12)}
        <path d="${serra(rnd, { W, H, y: H * 0.74, amp: H * 0.06, n: 4 })}" fill="#3f7f59" transform="translate(0 ${r(H * 0.02)})" opacity="0"/>
        ${[0.05, 0.13, 0.2, 0.82, 0.9, 0.97].map((f, i) => pinheiro(W * f, H * 0.72, 0.9 + (i % 3) * 0.25, i % 2 ? '#2e6b4a' : '#255c3f')).join('')}`;
    },

    praia(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[2])}
        <defs>${gradV(id + 'm', ['#3fd0e0', '#1592b8', '#0d6f96'])}${gradV(id + 'a', ['#f7e4b8', '#ecd09a'])}</defs>
        <rect y="${r(H * 0.5)}" width="${W}" height="${r(H * 0.5)}" fill="url(#${id}m)"/>
        <g transform="translate(${r(W * 0.62)} ${r(H * 0.5)})">
          <path d="M0 2C6-60 30-96 52-96C70-96 76-54 84 2Z" fill="#3e7a52"/><path d="M60 2C68-44 86-70 104-70C122-70 128-36 134 2Z" fill="#4f8d62"/>
          <path d="M-8 2H142" stroke="#bff3fb" stroke-width="3" opacity=".7"/></g>
        ${ondas(H * 0.58, W, '#ffffff', 4, 80, 0.45, 8)}${ondas(H * 0.66, W, '#ffffff', 5, 110, 0.4, 11)}
        <path d="M-20 ${r(H * 0.8)}C${r(W * 0.3)} ${r(H * 0.7)} ${r(W * 0.6)} ${r(H * 0.76)} ${W + 20} ${r(H * 0.72)}V${H + 10}H-20Z" fill="url(#${id}a)"/>
        <path d="M-20 ${r(H * 0.8)}C${r(W * 0.3)} ${r(H * 0.7)} ${r(W * 0.6)} ${r(H * 0.76)} ${W + 20} ${r(H * 0.72)}" fill="none" stroke="#fff" stroke-width="5" opacity=".7" class="espuma"/>
        ${palmeira(W * 0.08, H * 1.02, 1.25)}${palmeira(W * 0.9, H * 1.04, 1.05)}
        <ellipse cx="${r(W * 0.42)}" cy="${r(H * 0.88)}" rx="22" ry="8" fill="#d9b77a"/>`;
    },

    piscina(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[2])}
        <defs>${gradV(id + 'm', ['#36c4dc', '#127ea6'])}${gradV(id + 'p', ['#8ff0f0', '#2fc3d3'])}</defs>
        <rect y="${r(H * 0.45)}" width="${W}" height="${r(H * 0.55)}" fill="url(#${id}m)"/>
        ${ondas(H * 0.52, W, '#fff', 4, 90, 0.5, 9)}
        <path d="M-20 ${r(H * 0.62)}C${r(W * 0.2)} ${r(H * 0.56)} ${r(W * 0.5)} ${r(H * 0.62)} ${r(W * 0.7)} ${r(H * 0.58)}S${W + 20} ${r(H * 0.6)} ${W + 20} ${r(H * 0.6)}V${H + 10}H-20Z" fill="#5b5f5a"/>
        <path d="M${r(W * 0.08)} ${r(H * 0.92)}C${r(W * 0.1)} ${r(H * 0.7)} ${r(W * 0.42)} ${r(H * 0.66)} ${r(W * 0.5)} ${r(H * 0.78)}C${r(W * 0.56)} ${r(H * 0.9)} ${r(W * 0.3)} ${r(H * 1.02)} ${r(W * 0.08)} ${r(H * 0.92)}Z" fill="url(#${id}p)"/>
        <path d="M${r(W * 0.58)} ${r(H * 0.86)}C${r(W * 0.6)} ${r(H * 0.7)} ${r(W * 0.86)} ${r(H * 0.68)} ${r(W * 0.92)} ${r(H * 0.8)}C${r(W * 0.96)} ${r(H * 0.94)} ${r(W * 0.7)} ${r(H * 0.98)} ${r(W * 0.58)} ${r(H * 0.86)}Z" fill="url(#${id}p)"/>
        ${peixe(W * 0.2, H * 0.82, 0.8, '#f4b63f', 7)}${peixe(W * 0.3, H * 0.88, 0.6, '#1d3b4a', 9)}${peixe(W * 0.7, H * 0.8, 0.7, '#ef7d55', 8)}
        <circle cx="${r(W * 0.5)}" cy="${r(H * 0.95)}" r="18" fill="#6a6f69"/><circle cx="${r(W * 0.55)}" cy="${r(H * 0.66)}" r="12" fill="#6a6f69"/>`;
    },

    gruta(id, rnd, W, H) {
      const lx = W * (0.45 + rnd() * 0.1);
      return `<defs>
        <radialGradient id="${id}g" cx=".3" cy=".1" r="1"><stop offset="0" stop-color="#506b6e"/><stop offset=".45" stop-color="#22343a"/><stop offset="1" stop-color="#0f1b20"/></radialGradient>
        <radialGradient id="${id}l" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#7ff6ff"/><stop offset=".35" stop-color="#18b6d8"/><stop offset="1" stop-color="#06506c"/></radialGradient>
        ${gradV(id + 'f', ['#fff6d6', '#fff6d600'])}</defs>
        <rect width="${W}" height="${H}" fill="url(#${id}g)"/>
        <path d="M0 0H${W}V${r(H * 0.2)}C${r(W * 0.8)} ${r(H * 0.3)} ${r(W * 0.62)} ${r(H * 0.08)} ${r(W * 0.4)} ${r(H * 0.16)}S${r(W * 0.1)} ${r(H * 0.08)} 0 ${r(H * 0.22)}Z" fill="#0c171b"/>
        ${Array.from({ length: 14 }, (_, i) => { const x = (W / 14) * i + rnd() * 30; const h = 30 + rnd() * 60; const y = H * 0.12 + rnd() * 30;
          return `<path d="M${r(x - 9)} ${r(y)}L${r(x)} ${r(y + h)}L${r(x + 9)} ${r(y)}Z" fill="#0f1d22"/>`; }).join('')}
        <path class="feixe" d="M${r(W * 0.18)} 0L${r(W * 0.3)} 0L${r(lx + 90)} ${r(H * 0.8)}L${r(lx - 90)} ${r(H * 0.8)}Z" fill="url(#${id}f)" opacity=".22"/>
        <path d="M-20 ${r(H * 0.62)}C${r(W * 0.15)} ${r(H * 0.55)} ${r(W * 0.3)} ${r(H * 0.7)} ${r(W * 0.2)} ${H + 10}H-20Z" fill="#14242a"/>
        <path d="M${W + 20} ${r(H * 0.58)}C${r(W * 0.86)} ${r(H * 0.5)} ${r(W * 0.72)} ${r(H * 0.72)} ${r(W * 0.82)} ${H + 10}H${W + 20}Z" fill="#14242a"/>
        <ellipse cx="${r(lx)}" cy="${r(H * 0.84)}" rx="${r(W * 0.34)}" ry="${r(H * 0.13)}" fill="url(#${id}l)"/>
        <ellipse class="reflexo" cx="${r(lx - 30)}" cy="${r(H * 0.8)}" rx="${r(W * 0.12)}" ry="5" fill="#d8fbff" opacity=".55"/>
        <path d="M-20 ${H + 10}C${r(W * 0.25)} ${r(H * 0.9)} ${r(W * 0.75)} ${r(H * 0.92)} ${W + 20} ${H + 10}Z" fill="#0d181c"/>`;
    },

    cachoeira(id, rnd, W, H) {
      const cx = W * (0.42 + rnd() * 0.16);
      return `${ceu(id, rnd, W, H, CEUS[Math.floor(rnd() * 3)])}
        <defs>${gradV(id + 'q', ['#ffffff', '#c8f3fb', '#7fd8ea'])}${gradV(id + 'p', ['#56c6d8', '#1e88a8'])}</defs>
        <path d="${serra(rnd, { W, H, y: H * 0.45, amp: H * 0.14, n: 5 })}" fill="#a9cfb4"/>
        <path d="${mesa(cx - W * 0.32, H * 0.22, W * 0.64, H * 0.5, H)}" fill="#8a6a4f"/>
        <path d="${mesa(cx - W * 0.32, H * 0.22, W * 0.64, H * 0.5, H)}" fill="#6f533d" transform="translate(${r(W * 0.04)} 0)" opacity=".5"/>
        <g stroke="#4a3626" stroke-width="3" opacity=".22">${[0.36, 0.48, 0.6].map(f => `<path d="M${r(cx - W * 0.24)} ${r(H * f)}H${r(cx + W * 0.24)}"/>`).join('')}</g>
        <path d="M${r(cx - W * 0.19)} ${r(H * 0.228)}Q${r(cx)} ${r(H * 0.2)} ${r(cx + W * 0.19)} ${r(H * 0.228)}" stroke="#4e8c5c" stroke-width="13" stroke-linecap="round" fill="none"/>
        ${[-0.16, -0.1, 0.1, 0.15].map((f, i) => `<circle cx="${r(cx + W * f)}" cy="${r(H * 0.2)}" r="${9 + i * 2}" fill="${i % 2 ? '#3f7f52' : '#5a9a68'}"/>`).join('')}
        <rect class="queda" x="${r(cx - 26)}" y="${r(H * 0.22)}" width="52" height="${r(H * 0.56)}" rx="20" fill="url(#${id}q)"/>
        <g class="agua-cai" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".8">
          ${[-16, -6, 4, 14].map(dx => `<path d="M${r(cx + dx)} ${r(H * 0.24)}V${r(H * 0.76)}" stroke-dasharray="14 18"/>`).join('')}</g>
        <ellipse cx="${r(cx)}" cy="${r(H * 0.83)}" rx="${r(W * 0.3)}" ry="${r(H * 0.09)}" fill="url(#${id}p)"/>
        <ellipse class="nevoa" cx="${r(cx)}" cy="${r(H * 0.77)}" rx="70" ry="18" fill="#fff" opacity=".6"/>
        ${ondas(H * 0.84, W, '#e8fbff', 3, 60, 0.5, 7)}
        <path d="M-20 ${r(H * 0.8)}C${r(W * 0.15)} ${r(H * 0.74)} ${r(W * 0.22)} ${r(H * 0.86)} ${r(W * 0.3)} ${H + 10}H-20Z" fill="#2f6d47"/>
        <path d="M${W + 20} ${r(H * 0.78)}C${r(W * 0.86)} ${r(H * 0.72)} ${r(W * 0.8)} ${r(H * 0.88)} ${r(W * 0.7)} ${H + 10}H${W + 20}Z" fill="#2f6d47"/>
        ${arvore(W * 0.08, H * 0.8, 1.2, '#3c8a5a', '#2c6b45')}${arvore(W * 0.18, H * 0.9, 0.9, '#4a9a66', '#2f7049')}
        ${arvore(W * 0.9, H * 0.8, 1.15, '#3c8a5a', '#2c6b45')}${arvore(W * 0.8, H * 0.92, 0.85, '#4a9a66', '#2f7049')}`;
    },

    rio(id, rnd, W, H) {
      return `<defs>${gradV(id + 'a', ['#b9f3f7', '#4cc7d9', '#0f86a3', '#0a5f7a'])}${gradV(id + 'r', ['#ffffff', '#ffffff00'])}</defs>
        <rect width="${W}" height="${H}" fill="url(#${id}a)"/>
        <path d="M-20 ${r(H * 0.08)}Q${r(W * 0.25)} ${r(H * 0.02)} ${r(W * 0.5)} ${r(H * 0.08)}T${W + 20} ${r(H * 0.08)}" stroke="#ffffff" stroke-width="3" fill="none" opacity=".6"/>
        ${[0.15, 0.38, 0.62, 0.84].map((f, i) => `<path class="raio-luz" style="--atraso:${i * 1.3}s" d="M${r(W * f - 30)} 0L${r(W * f + 30)} 0L${r(W * f + 90)} ${H}L${r(W * f - 10)} ${H}Z" fill="url(#${id}r)" opacity=".16"/>`).join('')}
        <path d="M-20 ${r(H * 0.86)}C${r(W * 0.2)} ${r(H * 0.8)} ${r(W * 0.45)} ${r(H * 0.9)} ${r(W * 0.7)} ${r(H * 0.84)}S${W + 20} ${r(H * 0.86)} ${W + 20} ${r(H * 0.86)}V${H + 10}H-20Z" fill="#e5d3a1"/>
        <g class="plantas" stroke="#2f8a57" stroke-width="5" fill="none" stroke-linecap="round">
          ${Array.from({ length: 12 }, (_, i) => { const x = (W / 12) * i + rnd() * 40; const h = H * (0.18 + rnd() * 0.2);
            return `<path class="planta" style="--atraso:${r(rnd() * 2)}s" d="M${r(x)} ${r(H * 0.9)}q-14 ${r(-h / 3)} 0 ${r(-h / 1.6)}t0 ${r(-h / 2.4)}"/>`; }).join('')}</g>
        ${peixe(W * 0.12, H * 0.42, 1.2, '#f2b544', 14)}${peixe(W * 0.28, H * 0.52, 0.9, '#e9a23b', 16)}${peixe(W * 0.2, H * 0.6, 1, '#f5c25b', 18)}
        ${peixe(W * 0.55, H * 0.36, 0.8, '#2d4f5c', 20)}${peixe(W * 0.66, H * 0.46, 1.1, '#f2b544', 15)}
        ${Array.from({ length: 7 }, (_, i) => `<circle class="bolha" style="--atraso:${r(i * 0.9)}s" cx="${r(W * (0.1 + rnd() * 0.8))}" cy="${r(H * 0.8)}" r="${r(3 + rnd() * 4)}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/>`).join('')}`;
    },

    balneario(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[0])}
        <defs>${gradV(id + 'r', ['#6fe0e8', '#1aa7c0', '#0d7f9c'])}</defs>
        <path d="${serra(rnd, { W, H, y: H * 0.46, amp: H * 0.1, n: 6 })}" fill="#8fc7a2"/>
        ${Array.from({ length: 9 }, (_, i) => arvore((W / 8) * i + rnd() * 20, H * 0.56, 0.9 + rnd() * 0.4, i % 2 ? '#3f8f5e' : '#4c9c69', '#2d6c46')).join('')}
        <rect y="${r(H * 0.55)}" width="${W}" height="${r(H * 0.45)}" fill="url(#${id}r)"/>
        ${ondas(H * 0.6, W, '#ffffff', 3, 70, 0.5, 8)}
        ${peixe(W * 0.3, H * 0.78, 1.1, '#2b3b3f', 12)}${peixe(W * 0.42, H * 0.84, 0.9, '#d64f3d', 14)}${peixe(W * 0.6, H * 0.76, 1, '#2b3b3f', 16)}${peixe(W * 0.5, H * 0.9, 0.8, '#2b3b3f', 13)}
        <g fill="#9a6b3e"><rect x="-10" y="${r(H * 0.62)}" width="${r(W * 0.42)}" height="14" rx="3"/>
          ${[0.05, 0.15, 0.25, 0.35].map(f => `<rect x="${r(W * f)}" y="${r(H * 0.62)}" width="9" height="${r(H * 0.2)}" fill="#7d5531"/>`).join('')}</g>
        <path d="M-20 ${H + 10}V${r(H * 0.9)}C${r(W * 0.2)} ${r(H * 0.86)} ${r(W * 0.3)} ${r(H * 0.96)} ${r(W * 0.4)} ${H + 10}Z" fill="#3f8f5e"/>`;
    },

    trilha(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[Math.floor(rnd() * 2) * 3])}
        <path d="${serra(rnd, { W, H, y: H * 0.4, amp: H * 0.16, n: 4 })}" fill="#b7d3b8"/>
        <path d="${serra(rnd, { W, H, y: H * 0.56, amp: H * 0.2, n: 3 })}" fill="#7cb18c"/>
        <path d="M-20 ${r(H * 0.72)}C${r(W * 0.3)} ${r(H * 0.58)} ${r(W * 0.6)} ${r(H * 0.66)} ${W + 20} ${r(H * 0.6)}V${H + 10}H-20Z" fill="#4f9067"/>
        <path class="caminho" d="M${r(W * 0.5)} ${H + 10}C${r(W * 0.62)} ${r(H * 0.86)} ${r(W * 0.3)} ${r(H * 0.8)} ${r(W * 0.46)} ${r(H * 0.72)}S${r(W * 0.7)} ${r(H * 0.64)} ${r(W * 0.62)} ${r(H * 0.56)}" fill="none" stroke="#f1dfb5" stroke-width="12" stroke-linecap="round"/>
        <path d="M${r(W * 0.5)} ${H + 10}C${r(W * 0.62)} ${r(H * 0.86)} ${r(W * 0.3)} ${r(H * 0.8)} ${r(W * 0.46)} ${r(H * 0.72)}S${r(W * 0.7)} ${r(H * 0.64)} ${r(W * 0.62)} ${r(H * 0.56)}" fill="none" stroke="#c9a96f" stroke-width="2" stroke-dasharray="3 12" stroke-linecap="round"/>
        ${passaros(W * 0.62, H * 0.24, 1.1)}
        ${[0.08, 0.2, 0.78, 0.9].map((f, i) => pinheiro(W * f, H * (0.82 + (i % 2) * 0.08), 1.3 + (i % 2) * 0.3, i % 2 ? '#2d6b48' : '#23583b')).join('')}
        <g transform="translate(${r(W * 0.36)} ${r(H * 0.86)})"><rect x="-3" y="-44" width="6" height="46" fill="#7d5531"/>
          <path d="M-30-46H22L32-38L22-30H-30Z" fill="#a8743f"/><path d="M-22-38H16" stroke="#f6e7c8" stroke-width="2.4" stroke-linecap="round"/></g>`;
    },

    rochas(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[1])}
        <defs>${gradV(id + 'p', ['#b8b6ad', '#7f7d75'])}${gradV(id + 'r', ['#70d7e4', '#1d8fae'])}</defs>
        <path d="${serra(rnd, { W, H, y: H * 0.42, amp: H * 0.1, n: 5 })}" fill="#d7c39a"/>
        ${Array.from({ length: 6 }, (_, i) => arvoreCerrado(W * (0.08 + i * 0.17) + rnd() * 20, H * 0.48, 0.7 + rnd() * 0.3, '#7a9a3f')).join('')}
        <path d="M-20 ${r(H * 0.5)}H${W + 20}V${H + 10}H-20Z" fill="#a8a59b"/>
        <path d="M${r(W * 0.32)} ${r(H * 0.5)}C${r(W * 0.4)} ${r(H * 0.66)} ${r(W * 0.3)} ${r(H * 0.8)} ${r(W * 0.42)} ${H + 10}H${r(W * 0.66)}C${r(W * 0.56)} ${r(H * 0.8)} ${r(W * 0.62)} ${r(H * 0.64)} ${r(W * 0.5)} ${r(H * 0.5)}Z" fill="url(#${id}r)"/>
        ${ondas(H * 0.72, W, '#e6fbff', 3, 40, 0.0, 6)}
        ${[[0.1, 0.62, 90, 50], [0.24, 0.78, 110, 60], [0.06, 0.9, 120, 50], [0.76, 0.6, 100, 48], [0.86, 0.76, 120, 62], [0.7, 0.9, 110, 50], [0.5, 0.95, 60, 26]]
          .map(([fx, fy, rx, ry]) => `<ellipse cx="${r(W * fx)}" cy="${r(H * fy)}" rx="${rx}" ry="${ry}" fill="url(#${id}p)"/>
            <ellipse cx="${r(W * fx - rx * 0.2)}" cy="${r(H * fy - ry * 0.45)}" rx="${r(rx * 0.5)}" ry="${r(ry * 0.22)}" fill="#e2e0d8" opacity=".55"/>`).join('')}`;
    },

    chapada(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[3])}
        <defs>${gradV(id + 'm', ['#d89a68', '#b8744a'])}${gradV(id + 'q', ['#ffffff', '#bff0f7'])}</defs>
        <path d="${mesa(W * 0.55, H * 0.3, W * 0.5, H * 0.3, H)}" fill="#e2b48a" opacity=".8"/>
        <path d="${mesa(-W * 0.05, H * 0.36, W * 0.45, H * 0.3, H)}" fill="#d9a678"/>
        <path d="${mesa(W * 0.3, H * 0.42, W * 0.42, H * 0.3, H)}" fill="url(#${id}m)"/>
        <path d="M${r(W * 0.3)} ${r(H * 0.48)}H${r(W * 0.72)}" stroke="#9c5f3b" stroke-width="3" opacity=".5"/>
        <rect class="queda" x="${r(W * 0.49)}" y="${r(H * 0.42)}" width="18" height="${r(H * 0.32)}" rx="8" fill="url(#${id}q)"/>
        <path d="M-20 ${r(H * 0.72)}C${r(W * 0.3)} ${r(H * 0.66)} ${r(W * 0.7)} ${r(H * 0.74)} ${W + 20} ${r(H * 0.68)}V${H + 10}H-20Z" fill="#9db25a"/>
        <path d="M-20 ${r(H * 0.84)}C${r(W * 0.4)} ${r(H * 0.78)} ${r(W * 0.6)} ${r(H * 0.88)} ${W + 20} ${r(H * 0.82)}V${H + 10}H-20Z" fill="#7f9a43"/>
        ${passaros(W * 0.2, H * 0.22, 1)}
        ${Array.from({ length: 7 }, (_, i) => arvoreCerrado(W * (0.04 + i * 0.15) + rnd() * 30, H * (0.86 + rnd() * 0.08), 1 + rnd() * 0.5, i % 2 ? '#6e8f36' : '#5f7f2c')).join('')}`;
    },

    mirante(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[1])}
        <path d="${serra(rnd, { W, H, y: H * 0.42, amp: H * 0.14, n: 5 })}" fill="#bcd2c0"/>
        <path d="${mesa(W * 0.1, H * 0.46, W * 0.5, H * 0.2, H)}" fill="#c99a72"/>
        <path d="M-20 ${r(H * 0.6)}C${r(W * 0.3)} ${r(H * 0.54)} ${r(W * 0.7)} ${r(H * 0.64)} ${W + 20} ${r(H * 0.56)}V${H + 10}H-20Z" fill="#7fae7f"/>
        <path d="M${r(W * 0.2)} ${H + 10}C${r(W * 0.35)} ${r(H * 0.8)} ${r(W * 0.5)} ${r(H * 0.7)} ${r(W * 0.7)} ${r(H * 0.6)}" stroke="#56c3d6" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M-20 ${r(H * 0.86)}H${W + 20}V${H + 10}H-20Z" fill="#7d6a55"/>
        <g stroke="#7a5230" stroke-width="7" stroke-linecap="round">
          ${[0.05, 0.3, 0.55, 0.8].map(f => `<path d="M${r(W * f)} ${r(H * 0.86)}V${r(H * 0.7)}"/>`).join('')}
          <path d="M${r(W * 0.02)} ${r(H * 0.72)}H${r(W * 0.98)}"/><path d="M${r(W * 0.02)} ${r(H * 0.79)}H${r(W * 0.98)}" stroke-width="5"/></g>`;
    },

    floresta(id, rnd, W, H) {
      return `${ceu(id, rnd, W, H, CEUS[0])}
        <defs>${gradV(id + 'r', ['#8beef0', '#26b0c8'])}</defs>
        <path d="${serra(rnd, { W, H, y: H * 0.42, amp: H * 0.16, n: 5 })}" fill="#9fcaa8"/>
        <path d="${serra(rnd, { W, H, y: H * 0.56, amp: H * 0.14, n: 7 })}" fill="#5f9d72"/>
        ${Array.from({ length: 11 }, (_, i) => arvore((W / 10) * i + rnd() * 24, H * (0.64 + rnd() * 0.06), 0.8 + rnd() * 0.4, i % 2 ? '#3c8a5a' : '#4a9a66', '#2c6b45')).join('')}
        <path d="M${r(W * 0.38)} ${r(H * 0.62)}C${r(W * 0.5)} ${r(H * 0.7)} ${r(W * 0.3)} ${r(H * 0.8)} ${r(W * 0.4)} ${H + 10}H${r(W * 0.7)}C${r(W * 0.56)} ${r(H * 0.82)} ${r(W * 0.7)} ${r(H * 0.7)} ${r(W * 0.5)} ${r(H * 0.62)}Z" fill="url(#${id}r)"/>
        ${ondas(H * 0.84, W, '#ffffff', 2, 36, 0.0, 6)}
        <path d="M-20 ${r(H * 0.78)}C${r(W * 0.15)} ${r(H * 0.74)} ${r(W * 0.3)} ${r(H * 0.86)} ${r(W * 0.38)} ${H + 10}H-20Z" fill="#2f6d47"/>
        <path d="M${W + 20} ${r(H * 0.76)}C${r(W * 0.85)} ${r(H * 0.72)} ${r(W * 0.74)} ${r(H * 0.86)} ${r(W * 0.68)} ${H + 10}H${W + 20}Z" fill="#2f6d47"/>
        ${passaros(W * 0.55, H * 0.2, 1)}`;
    },
  };

  // qual cena combina com o texto (tipo do atrativo ou do destino)
  function tipoDe(texto) {
    const t = String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    if (/piscina/.test(t)) return 'piscina';
    if (/praia|baia|marinho|ilha|litoral|mar\b|mergulh/.test(t)) return 'praia';
    if (/gruta|caverna|abismo/.test(t)) return 'gruta';
    if (/cachoeira|salto|queda/.test(t)) return 'cachoeira';
    if (/flutua|snorkel|aquario/.test(t)) return 'rio';
    if (/balneario|rio|lago/.test(t)) return 'balneario';
    if (/trilha|caminhada|trekking/.test(t)) return 'trilha';
    if (/formacao|rocha|vale|canion|canyon|pedra/.test(t)) return 'rochas';
    if (/mirante/.test(t)) return 'mirante';
    if (/chapada|parque nacional|cerrado|serra/.test(t)) return 'chapada';
    if (/ecoturismo|floresta|mata/.test(t)) return 'floresta';
    return 'montanhas';
  }

  // monta o SVG de uma cena; "classe" vai no <svg>
  function cena(tipo, semente = 1, { W = 800, H = 500, classe = '' } = {}) {
    const nome = CENAS[tipo] ? tipo : tipoDe(tipo);
    const id = `a${++unico}`;
    const rnd = aleatorio(Number(semente) * 7 + nome.length);
    return `<svg class="arte ${classe}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">${CENAS[nome](id, rnd, W, H)}</svg>`;
  }

  // capa da página inicial: paisagem larga em camadas (para o efeito de profundidade)
  function capa() {
    const W = 1600, H = 820, id = `a${++unico}`, rnd = aleatorio(11);
    const camada = (prof, conteudo) => `<g class="camada" data-prof="${prof}">${conteudo}</g>`;
    return `<svg class="arte arte-capa" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>${gradV(id + 'c', ['#a7dcec', '#dff3ef', '#fff4df'])}${gradV(id + 'r', ['#9be7ef', '#2fb1c9', '#178aa8'])}${gradV(id + 'q', ['#ffffff', '#c6f2f8'])}
        <radialGradient id="${id}s"><stop offset="0" stop-color="#fff7d6"/><stop offset=".35" stop-color="#fff3c4" stop-opacity=".7"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}c)"/>
      ${camada(0.02, `<circle class="brilho-sol" cx="1180" cy="230" r="260" fill="url(#${id}s)"/><circle cx="1180" cy="230" r="70" fill="#fff6d0"/>`)}
      ${camada(0.05, nuvem(260, 170, 1.6, 90) + nuvem(900, 120, 1.1, 120, 0.8) + nuvem(1380, 200, 1.3, 100, 0.85))}
      ${camada(0.1, `<path d="${serra(rnd, { W, H, y: 470, amp: 160, n: 7 })}" fill="#bfdccc"/>`)}
      ${camada(0.18, `<path d="${mesa(820, 360, 520, 200, H)}" fill="#cfa982"/><path d="${mesa(1180, 410, 420, 160, H)}" fill="#c29770"/>
        <rect class="queda" x="1010" y="362" width="26" height="200" rx="12" fill="url(#${id}q)"/>`)}
      ${camada(0.28, `<path d="${serra(rnd, { W, H, y: 590, amp: 120, n: 8 })}" fill="#86bb95"/>` + passaros(560, 300, 1.4))}
      ${camada(0.4, `<path d="M-40 640C300 590 520 660 820 620S1300 600 1640 630V860H-40Z" fill="#5c9d72"/>
        <path d="M700 860C760 780 640 720 820 680S1100 650 1030 630" fill="none" stroke="url(#${id}r)" stroke-width="70" stroke-linecap="round"/>
        ${Array.from({ length: 18 }, (_, i) => arvore(i * 95 + rnd() * 50, 668 + rnd() * 22, 0.8 + rnd() * 0.35, i % 2 ? '#5aa574' : '#68b07f', '#3f8459')).join('')}
        ${Array.from({ length: 14 }, (_, i) => arvore(i * 120 + 40 + rnd() * 60, 712 + rnd() * 26, 1.15 + rnd() * 0.55, i % 2 ? '#3c8a5a' : '#4b9b67', '#2d6c46')).join('')}`)}
      ${camada(0.6, `<path d="M-40 760C200 720 420 780 640 760S1100 730 1640 770V860H-40Z" fill="#2f6d47"/>
        ${pinheiro(60, 800, 2.6, '#1f4d33')}${pinheiro(170, 820, 2, '#245a3c')}${pinheiro(1500, 810, 2.8, '#1f4d33')}${pinheiro(1400, 830, 2, '#245a3c')}`)}
    </svg>`;
  }

  return { cena, capa, tipoDe };
})();

// efeito de profundidade na capa: cada camada anda um pouco com o mouse e com a rolagem
function animarCapa(elemento) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const camadas = [...elemento.querySelectorAll('.camada')];
  let mx = 0, my = 0;
  const aplicar = () => {
    const rolagem = Math.min(window.scrollY, 800);
    for (const c of camadas) {
      const p = Number(c.dataset.prof);
      c.style.transform = `translate(${(mx * p * 60).toFixed(1)}px, ${(my * p * 30 + rolagem * p * 0.6).toFixed(1)}px)`;
    }
  };
  elemento.addEventListener('mousemove', e => {
    const b = elemento.getBoundingClientRect();
    mx = (e.clientX - b.left) / b.width - 0.5;
    my = (e.clientY - b.top) / b.height - 0.5;
    requestAnimationFrame(aplicar);
  });
  window.addEventListener('scroll', () => requestAnimationFrame(aplicar), { passive: true });
}
