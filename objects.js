/* Procedural material studies. All geometry is rendered locally; no image/API dependencies. */
(() => {
  const TAU = Math.PI * 2,
    clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const unit = (v) => {
    const d = Math.hypot(...v) || 1;
    return v.map((x) => x / d);
  };
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const rotate = (p, a, b) => {
    const x = p[0] * Math.cos(a) + p[2] * Math.sin(a),
      z = -p[0] * Math.sin(a) + p[2] * Math.cos(a);
    return [
      x,
      p[1] * Math.cos(b) - z * Math.sin(b),
      p[1] * Math.sin(b) + z * Math.cos(b),
    ];
  };
  const rgb = (r, g, b, a = 1) =>
    `rgba(${clamp(r, 0, 255) | 0},${clamp(g, 0, 255) | 0},${clamp(b, 0, 255) | 0},${a})`;
  const records = new Map(),
    reduce = matchMedia("(prefers-reduced-motion: reduce)");
  function shadow(ctx, x = 140, y = 211, w = 78, h = 12, opacity = 0.18) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(w, h);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(0,0,0,${opacity})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function glow(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function line(ctx, points, color, width = 1) {
    ctx.beginPath();
    points.forEach((p, i) =>
      i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  function surface(
    ctx,
    point,
    {
      u = 82,
      v = 36,
      angle = 0.3,
      tilt = -0.2,
      scale = 65,
      cy = 116,
      material = "ceramic",
      base = [218, 205, 183],
    } = {},
  ) {
    const points = [];
    for (let i = 0; i <= u; i++) {
      points[i] = [];
      for (let j = 0; j <= v; j++)
        points[i][j] = rotate(point((i / u) * TAU, (j / v) * TAU), angle, tilt);
    }
    const faces = [],
      light = unit([-0.5, -0.65, 0.7]);
    for (let i = 0; i < u; i++)
      for (let j = 0; j < v; j++) {
        const p = points[i][j],
          q = points[i + 1][j],
          r = points[i][j + 1],
          s = points[i + 1][j + 1];
        let n = unit(
          cross(
            q.map((x, k) => x - p[k]),
            r.map((x, k) => x - p[k]),
          ),
        );
        if (material === "chrome" && dot(n, p) < 0) n = n.map((x) => -x);
        if (n[2] < -0.1) continue;
        const z = (p[2] + q[2] + r[2] + s[2]) / 4,
          diff = clamp(dot(n, light)),
          fres = Math.pow(1 - clamp(n[2]), 3),
          spec = Math.pow(
            clamp(dot(n, unit([-0.3, -0.4, 1]))),
            material === "chrome" ? 100 : 45,
          );
        let color;
        if (material === "chrome") {
          const rx = 2 * n[2] * n[0],
            ry = 2 * n[2] * n[1],
            rz = 2 * n[2] * n[2] - 1;
          const strip =
              Math.exp(-Math.pow((rx + 0.38) / 0.21, 6)) *
              clamp((-ry + 0.8) * 0.8),
            warm = Math.exp(-Math.pow((rx - 0.58) / 0.22, 2)) * clamp(ry + 0.9),
            horizon = Math.exp(-Math.pow((ry + 0.16) / 0.085, 2));
          const value =
            35 +
            strip * 155 +
            horizon * 50 +
            clamp(rz) * 50 +
            spec * 120 +
            fres * 48;
          color = rgb(
            value + warm * 64,
            value + warm * 26,
            value + strip * 14 - warm * 13,
          );
        } else {
          const ambient = 0.39 + diff * 0.6;
          const sheen = spec * (material === "brass" ? 105 : 44) + fres * 19;
          color = rgb(
            base[0] * ambient + sheen,
            base[1] * ambient + sheen,
            base[2] * ambient + sheen,
          );
        }
        const project = (p) => [140 + p[0] * scale, cy + p[1] * scale];
        faces.push({ z, pts: [p, q, s, r].map(project), color });
      }
    faces.sort((a, b) => a.z - b.z);
    for (const f of faces) {
      ctx.beginPath();
      f.pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 0.45;
      ctx.stroke();
    }
  }
  function mercury(ctx, t, active) {
    shadow(ctx, 140, 217, 70, 10, 0.17);
    const phase = t * 0.12;
    surface(
      ctx,
      (u, v) => {
        const lat = v / 2 - Math.PI / 2;
        const r =
          1 +
          0.16 * Math.sin(u * 3 + phase) * Math.cos(lat) ** 2 +
          0.085 * Math.sin(lat * 4 - phase);
        return [
          r * Math.cos(lat) * Math.cos(u),
          r * Math.sin(lat) * 1.17,
          r * Math.cos(lat) * Math.sin(u),
        ];
      },
      {
        u: 100,
        v: 52,
        angle: 0.48 + Math.sin(phase * 0.3) * 0.24,
        tilt: 0.08,
        scale: 73,
        cy: 112,
        material: "chrome",
      },
    );
    glow(ctx, 103, 54, 15, "rgba(255,255,255,.16)");
  }
  function porcelain(ctx, t, active) {
    shadow(ctx, 140, 218, 65, 11, 0.13);
    const turn = t * 0.025;
    surface(
      ctx,
      (u, v) => {
        const a = 2 * u,
          b = 3 * u;
        const center = [
          0.63 * Math.cos(a) * (1 + 0.32 * Math.cos(b)),
          0.63 * Math.sin(a) * (1 + 0.32 * Math.cos(b)),
          0.36 * Math.sin(b),
        ];
        const tangent = unit([
          -0.63 * 2 * Math.sin(a) * (1 + 0.32 * Math.cos(b)) -
            0.63 * 0.96 * Math.cos(a) * Math.sin(b),
          0.63 * 2 * Math.cos(a) * (1 + 0.32 * Math.cos(b)) -
            0.63 * 0.96 * Math.sin(a) * Math.sin(b),
          1.08 * Math.cos(b),
        ]);
        const n = unit(cross(tangent, [0, 0, 1])),
          bin = unit(cross(tangent, n));
        return center.map(
          (x, i) => x + 0.22 * (n[i] * Math.cos(v) + bin[i] * Math.sin(v)),
        );
      },
      {
        u: 164,
        v: 26,
        angle: 0.35 + turn,
        tilt: -0.4,
        scale: 91,
        cy: 112,
        base: [249, 237, 214],
      },
    );
  }
  function orbit(ctx, t, active) {
    const phase = t * 0.12;
    glow(ctx, 140, 116, 90, "rgba(229,159,81,.08)");
    const rings = [];
    for (let k = 0; k < 3; k++) {
      const pts = [];
      for (let i = 0; i <= 180; i++) {
        const a = (i / 180) * TAU,
          p = rotate(
            [87 * Math.cos(a), 87 * Math.sin(a), 0],
            0.6 + k * 0.8 + phase * 0.15,
            0.5 + k * 0.62,
          );
        pts.push([140 + p[0], 116 + p[1], p[2]]);
      }
      rings.push(pts);
    }
    for (const pts of rings) {
      for (let i = 1; i < pts.length; i++)
        line(
          ctx,
          [pts[i - 1], pts[i]],
          `rgba(221,172,106,${0.2 + clamp((pts[i][2] + 90) / 180) * 0.65})`,
          0.9,
        );
    }
    const sphere = ctx.createRadialGradient(129, 103, 0, 143, 119, 34);
    sphere.addColorStop(0, "#fff5d8");
    sphere.addColorStop(0.22, "#e7b674");
    sphere.addColorStop(0.55, "#9c622f");
    sphere.addColorStop(1, "#211811");
    ctx.fillStyle = sphere;
    ctx.beginPath();
    ctx.arc(140, 116, 32, 0, TAU);
    ctx.fill();
    glow(ctx, 128, 102, 25, "rgba(255,216,162,.18)");
    for (let k = 0; k < 3; k++) {
      const p = rotate(
          [87 * Math.cos(phase + k * 2), 87 * Math.sin(phase + k * 2), 0],
          0.6 + k * 0.8 + phase * 0.15,
          0.5 + k * 0.62,
        ),
        x = 140 + p[0],
        y = 116 + p[1];
      glow(ctx, x, y, 12, "rgba(255,190,117,.3)");
      ctx.fillStyle = "#f6d8ac";
      ctx.beginPath();
      ctx.arc(x, y, k === 1 ? 3 : 2, 0, TAU);
      ctx.fill();
    }
    line(
      ctx,
      [
        [32, 116],
        [42, 116],
      ],
      "#a07842",
      0.5,
    );
    line(
      ctx,
      [
        [238, 116],
        [248, 116],
      ],
      "#a07842",
      0.5,
    );
    ctx.fillStyle = "#9a794c";
    ctx.font = "5px monospace";
    ctx.fillText("N / 01", 132, 15);
    ctx.fillText("ORBITAL FIELD", 111, 230);
  }
  function aurora(ctx, t, active) {
    const phase = t * 0.18;
    glow(ctx, 140, 115, 115, "rgba(117,85,228,.12)");
    const ribbons = [];
    for (let k = 0; k < 5; k++)
      for (let i = 0; i < 150; i++) {
        const u = (i / 150) * TAU,
          a = u + phase * 0.15,
          point = (a, side) => {
            const r = 70 + 15 * Math.sin(a * 3 + phase) + side * 13;
            return [
              140 + Math.cos(a) * r,
              117 +
                Math.sin(a) * r * 0.58 +
                25 * Math.sin(a * 2 + phase + k * 0.18) +
                k * 2,
            ];
          };
        const hue = 195 + (i / 150) * 135;
        ribbons.push({
          pts: [
            point(a, -1),
            point(a + 0.05, -1),
            point(a + 0.05, 1),
            point(a, 1),
          ],
          color: `hsla(${hue},75%,${55 + 20 * Math.sin(a + phase)}%,${0.13 + k * 0.035})`,
        });
      }
    for (const r of ribbons) {
      ctx.beginPath();
      r.pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
      ctx.fillStyle = r.color;
      ctx.fill();
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 0.2;
      ctx.stroke();
    }
    for (let k = 0; k < 9; k++) {
      const pts = [];
      for (let i = 0; i <= 170; i++) {
        const a = (i / 170) * TAU + phase * 0.15,
          r = 70 + 15 * Math.sin(a * 3 + phase) + (k - 4) * 3;
        pts.push([
          140 + Math.cos(a) * r,
          117 + Math.sin(a) * r * 0.58 + 25 * Math.sin(a * 2 + phase) + k,
        ]);
      }
      line(ctx, pts, `rgba(${120 + k * 9},${175 - k * 8},255,.22)`, 0.45);
    }
  }
  function ember(ctx, t, active) {
    const phase = t * 0.13;
    glow(ctx, 140, 117, 100, "rgba(223,73,15,.12)");
    for (let i = 0; i < 1800; i++) {
      const a = i * 2.39996323,
        r = 70 * Math.sqrt((i + 0.5) / 1800),
        z = Math.sin(i * 83.31),
        w = Math.sin(a * 2 + phase) * 0.12 + 1;
      const x = 140 + Math.cos(a + phase * 0.1) * r * w,
        y =
          115 +
          Math.sin(a + phase * 0.1) * r * 0.91 +
          Math.sin(phase + i * 0.17) * (1.3 + active * 3.7),
        edge = 1 - r / 75;
      const opacity = clamp(0.15 + edge * 0.6 + z * 0.2),
        size = 0.3 + clamp(z) * 0.9;
      ctx.fillStyle = rgb(
        255,
        112 + clamp(z) * 101,
        39 + clamp(z) * 112,
        opacity,
      );
      ctx.beginPath();
      ctx.arc(x, y, size, 0, TAU);
      ctx.fill();
      if (i % 117 === 0) glow(ctx, x, y, 5, "rgba(255,130,41,.2)");
    }
    glow(ctx, 122, 100, 45, "rgba(255,155,71,.14)");
  }
  function leaf(ctx, x, y, length, angle, tone) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(-length / 3, 0, length / 3, -length);
    g.addColorStop(0, tone);
    g.addColorStop(0.48, "#82a77b");
    g.addColorStop(0.51, "#42674e");
    g.addColorStop(1, "#adc493");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -length * 0.6,
      -length * 0.23,
      -length * 0.31,
      -length * 0.86,
      0,
      -length,
    );
    ctx.bezierCurveTo(
      length * 0.3,
      -length * 0.85,
      length * 0.57,
      -length * 0.25,
      0,
      0,
    );
    ctx.fill();
    line(
      ctx,
      [
        [0, 0],
        [0, -length],
      ],
      "#d0dec170",
      0.5,
    );
    for (let i = 1; i < 7; i++) {
      const y = (-length * i) / 8;
      line(
        ctx,
        [
          [0, y],
          [length * 0.22, y - length * 0.15],
        ],
        "#d1dfbe40",
        0.4,
      );
      line(
        ctx,
        [
          [0, y],
          [-length * 0.22, y - length * 0.15],
        ],
        "#1e45384a",
        0.4,
      );
    }
    ctx.restore();
  }
  function terrarium(ctx, t, active) {
    shadow(ctx, 140, 224, 74, 8, 0.13);
    const phase = Math.sin(t * 0.3) * (0.02 + active * 0.05);
    const glass = ctx.createLinearGradient(60, 0, 220, 0);
    glass.addColorStop(0, "#bdd6b535");
    glass.addColorStop(0.2, "#ffffff40");
    glass.addColorStop(0.5, "#ccd9b90a");
    glass.addColorStop(1, "#4b70592c");
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.roundRect(64, 27, 152, 188, [78, 78, 12, 12]);
    ctx.fill();
    ctx.strokeStyle = "#72947770";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    const soil = ctx.createRadialGradient(130, 194, 0, 140, 197, 80);
    soil.addColorStop(0, "#a3ad7b");
    soil.addColorStop(1, "#354d3f");
    ctx.fillStyle = soil;
    ctx.beginPath();
    ctx.ellipse(140, 195, 73, 17, 0, 0, TAU);
    ctx.fill();
    line(
      ctx,
      [
        [140, 197],
        [143, 85],
      ],
      "#527447",
      2,
    );
    leaf(ctx, 141, 176, 63, -0.78 + phase, "#4c7255");
    leaf(ctx, 142, 154, 60, 0.7 + phase, "#406447");
    leaf(ctx, 143, 129, 55, -0.54 + phase, "#638562");
    leaf(ctx, 143, 116, 70, 0.33 + phase, "#476e52");
    leaf(ctx, 140, 188, 46, -1.19 + phase, "#7c9461");
    ctx.strokeStyle = "#ffffffa6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(78, 150);
    ctx.lineTo(78, 99);
    ctx.bezierCurveTo(78, 69, 91, 49, 113, 44);
    ctx.stroke();
    line(
      ctx,
      [
        [203, 106],
        [203, 178],
      ],
      "#dbe8d450",
      1,
    );
    ctx.fillStyle = "#e6ead030";
    ctx.beginPath();
    ctx.ellipse(140, 207, 72, 7, 0, 0, TAU);
    ctx.fill();
  }
  function blueprint(ctx, t, active) {
    const phase = t * 0.055;
    const project = (p) => {
      const r = rotate(p, phase + 0.5, -0.2);
      return [140 + r[0], 117 + r[1], r[2]];
    };
    glow(ctx, 140, 115, 95, "rgba(70,118,255,.08)");
    ctx.strokeStyle = "#759cff12";
    ctx.lineWidth = 0.5;
    for (let i = 20; i <= 260; i += 20) {
      line(
        ctx,
        [
          [i, 19],
          [i, 219],
        ],
        "#759cff12",
        0.5,
      );
      line(
        ctx,
        [
          [20, i],
          [260, i],
        ],
        "#759cff12",
        0.5,
      );
    }
    for (let k = 0; k < 11; k++) {
      const pts = [];
      for (let i = 0; i <= 100; i++) {
        const a = (i / 100) * TAU,
          b = (k / 10) * Math.PI;
        const p = project([
          78 * Math.sin(b) * Math.cos(a),
          78 * Math.cos(b),
          78 * Math.sin(b) * Math.sin(a),
        ]);
        pts.push(p);
      }
      line(ctx, pts, "#547fe75e", 0.6);
    }
    for (let k = 0; k < 12; k++) {
      const pts = [];
      for (let i = 0; i <= 100; i++) {
        const a = (i / 100) * Math.PI,
          b = (k / 12) * TAU,
          p = project([
            78 * Math.sin(a) * Math.cos(b),
            78 * Math.cos(a),
            78 * Math.sin(a) * Math.sin(b),
          ]);
        pts.push(p);
      }
      line(ctx, pts, "#709eff80", 0.7);
    }
    for (let k = 0; k < 7; k++) {
      const p = project([
        65 * Math.cos(k * 2.4),
        60 * Math.sin(k * 2.4),
        45 * Math.sin(k),
      ]);
      line(ctx, [[140, 117], p], "#9fbcff50", 0.6);
      ctx.fillStyle = "#beceff";
      ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3);
    }
    line(
      ctx,
      [
        [24, 35],
        [24, 24],
        [35, 24],
      ],
      "#7d9fffb3",
      1,
    );
    line(
      ctx,
      [
        [245, 210],
        [256, 210],
        [256, 199],
      ],
      "#7d9fffb3",
      1,
    );
    ctx.font = "5px monospace";
    ctx.fillStyle = "#7496ed";
    ctx.fillText("X 042 / Y 019 / Z 088", 25, 229);
  }
  function tide(ctx, t, active) {
    const phase = t * 0.18;
    glow(ctx, 140, 119, 111, "rgba(167,225,209,.5)");
    for (let k = 31; k >= 0; k--) {
      const r = 8 + k * 3.2,
        pts = [];
      for (let i = 0; i <= 170; i++) {
        const a = (i / 170) * TAU,
          wave =
            Math.sin(a * 3 + phase - k * 0.2) * 2.5 +
            Math.cos(a * 5 - phase) * 1.2;
        pts.push([
          140 + Math.cos(a) * (r + wave),
          118 + Math.sin(a) * (r + wave) * 0.69,
        ]);
      }
      line(
        ctx,
        pts,
        `rgba(37,115,111,${0.08 + Math.sin(k * 0.67 - phase) * 0.065})`,
        1.25,
      );
      const highlight = pts.slice(91, 145);
      line(
        ctx,
        highlight,
        `rgba(255,255,240,${0.2 + Math.sin(k * 0.67 - phase) * 0.17})`,
        1.2,
      );
    }
    const g = ctx.createRadialGradient(135, 108, 0, 140, 118, 19);
    g.addColorStop(0, "#f5fff9");
    g.addColorStop(0.3, "#cdeee1");
    g.addColorStop(0.8, "#64998c");
    g.addColorStop(1, "#effcf1");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(140, 118, 19, 14, 0, 0, TAU);
    ctx.fill();
    glow(ctx, 132, 111, 12, "rgba(255,255,255,.7)");
  }
  function totem(ctx, t, active) {
    shadow(ctx, 140, 223, 69, 11, 0.28);
    const pieces = [
      { y: 168, r: 0.9, h: 0.32, turn: 0.2 },
      { y: 111, r: 0.63, h: 0.37, turn: -0.1 },
      { y: 54, r: 0.37, h: 0.29, turn: 0.1 },
    ];
    for (const [k, p] of pieces.entries()) {
      const offset = Math.sin(t * 0.2 + k) * (1 + active * 5);
      surface(
        ctx,
        (u, v) => {
          const r = p.r * (0.83 + 0.17 * Math.cos(v));
          return [r * Math.cos(u), p.h * Math.sin(v), r * Math.sin(u)];
        },
        {
          u: 84,
          v: 24,
          angle: p.turn + offset * 0.03,
          tilt: -0.25 + offset * 0.012,
          scale: 71,
          cy: p.y + offset * 0.35,
          material: "brass",
          base: [218, 162, 87],
        },
      );
    }
    glow(ctx, 113, 49, 35, "rgba(249,185,113,.06)");
  }
  function fold(ctx, t, active) {
    shadow(ctx, 140, 216, 77, 11, 0.15);
    const a = 0.13 + Math.sin(t * 0.12) * 0.14;
    const pts = [
      [-87, -15, 0],
      [-36, -69, 16],
      [65, -62, 5],
      [92, 24, 0],
      [36, 75, 8],
      [-63, 59, 1],
      [4, -6, 66],
      [-18, 8, -34],
    ];
    const faces = [
      [0, 1, 6],
      [1, 2, 6],
      [2, 3, 6],
      [3, 4, 6],
      [4, 5, 6],
      [5, 0, 6],
      [0, 5, 7],
      [5, 4, 7],
      [4, 3, 7],
      [3, 2, 7],
      [2, 1, 7],
      [1, 0, 7],
    ];
    const colors = [
      "#ffdfc3",
      "#f8c6a3",
      "#f09e7f",
      "#bd523c",
      "#e48467",
      "#f5b694",
      "#b9593e",
      "#dba781",
      "#c97e54",
      "#e9b788",
      "#ffe1be",
      "#eaab80",
    ];
    const p = pts.map((x) => rotate(x, a, -0.15));
    const fs = faces
      .map((f, i) => ({
        points: f.map((k) => [140 + p[k][0], 113 + p[k][1]]),
        z: f.reduce((s, k) => s + p[k][2], 0),
        i,
      }))
      .sort((a, b) => a.z - b.z);
    for (const f of fs) {
      ctx.beginPath();
      f.points.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p)));
      ctx.closePath();
      const g = ctx.createLinearGradient(...f.points[0], ...f.points[2]);
      g.addColorStop(0, colors[f.i]);
      g.addColorStop(1, colors[(f.i + 1) % colors.length]);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "#fff1da45";
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }
  function lumen(ctx, t, active) {
    const pulse = 0.8 + Math.sin(t * 0.2) * 0.1;
    shadow(ctx, 140, 225, 65, 9, 0.13);
    glow(ctx, 140, 116, 115, `rgba(153,121,234,${0.13 * pulse})`);
    for (let k = 8; k >= 0; k--) {
      const x = 82 + k * 2,
        y = 26 + k * 3,
        w = 116 - k * 4,
        h = 181 - k * 5;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + w / 2);
      ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
      ctx.lineTo(x + w, y + h);
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, `rgba(255,238,255,${0.82 - k * 0.065})`);
      g.addColorStop(0.45, `rgba(189,155,233,${0.8 - k * 0.06})`);
      g.addColorStop(1, `rgba(107,83,181,${0.9 - k * 0.08})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = k === 0 ? 3 : 1.3;
      ctx.stroke();
    }
    const g = ctx.createLinearGradient(0, 190, 0, 232);
    g.addColorStop(0, "#bd9ee942");
    g.addColorStop(1, "#b18ed900");
    ctx.fillStyle = g;
    ctx.fillRect(82, 207, 116, 22);
    glow(ctx, 113, 50, 12, "rgba(255,240,255,.5)");
  }
  // Smooth per-pixel material lighting for the three sculptural metal/ceramic studies.
  function createSculpture(canvas) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return null;
    const vertex = `attribute vec3 aPosition;attribute vec3 aNormal;uniform float uAngle;uniform float uTilt;uniform float uScale;uniform float uY;varying vec3 vNormal;varying vec3 vPosition;vec3 turn(vec3 p){float c=cos(uAngle),s=sin(uAngle),b=cos(uTilt),d=sin(uTilt);vec3 q=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);return vec3(q.x,q.y*b-q.z*d,q.y*d+q.z*b);}void main(){vec3 p=turn(aPosition);vPosition=p;vNormal=turn(aNormal);gl_Position=vec4(p.x*uScale/140.0,-(p.y*uScale+uY-120.0)/120.0,-p.z*.22,1.0);}`;
    const fragment = `precision highp float;varying vec3 vNormal;varying vec3 vPosition;uniform vec3 uBase;uniform float uMaterial;void main(){vec3 n=normalize(vNormal);float diffuse=max(dot(n,normalize(vec3(-.5,-.65,.7))),0.0);float fres=pow(1.0-max(n.z,0.0),3.0);float spec=pow(max(dot(n,normalize(vec3(-.3,-.4,1.0))),0.0),uMaterial<.5?110.0:65.0);vec3 color;if(uMaterial<.5){vec3 r=2.0*n.z*n-vec3(0.,0.,1.);float strip=exp(-pow(abs((r.x+.38)/.21),6.0))*clamp((-r.y+.8)*.8,0.,1.);float warm=exp(-pow((r.x-.58)/.22,2.0))*clamp(r.y+.9,0.,1.);float horizon=exp(-pow((r.y+.16)/.085,2.0));float val=.14+strip*.61+horizon*.2+max(r.z,0.)*.2+spec*.6+fres*.18;color=vec3(val+warm*.21,val+warm*.09,val+strip*.045-warm*.045);}else{float ambient=uMaterial>1.5?.43:.60;float lit=ambient+diffuse*(1.-ambient);float sheen=spec*(uMaterial>1.5?.42:.25)+fres*.06;color=uBase*lit+vec3(sheen);if(uMaterial>1.5){float grain=sin(vPosition.y*650.0+sin(vPosition.x*83.0))*.012;color+=vec3(grain);}}gl_FragColor=vec4(clamp(color,0.,1.),1.);}`;
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(shader));
      return shader;
    }
    const program = gl.createProgram(),
      vs = compile(gl.VERTEX_SHADER, vertex),
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    const uniforms = Object.fromEntries(
      ["uAngle", "uTilt", "uScale", "uY", "uBase", "uMaterial"].map((name) => [
        name,
        gl.getUniformLocation(program, name),
      ]),
    );
    const aPosition = gl.getAttribLocation(program, "aPosition"),
      aNormal = gl.getAttribLocation(program, "aNormal");
    function mesh(fn, u, v, kind) {
      const verts = [],
        indices = [],
        epsilon = 0.0001;
      for (let i = 0; i <= u; i++)
        for (let j = 0; j <= v; j++) {
          const a = (i / u) * TAU,
            b = (j / v) * TAU,
            p = fn(a, b),
            du = fn(a + epsilon, b).map((x, k) => x - fn(a - epsilon, b)[k]),
            dv = fn(a, b + epsilon).map((x, k) => x - fn(a, b - epsilon)[k]);
          let n = unit(cross(du, dv));
          const center =
            kind === "chrome"
              ? [0, 0, 0]
              : fn(a, 0).map((x, k) => (x + fn(a, Math.PI)[k]) / 2);
          if (
            dot(
              n,
              p.map((x, k) => x - center[k]),
            ) < 0
          )
            n = n.map((x) => -x);
          verts.push(...p, ...n);
        }
      for (let i = 0; i < u; i++)
        for (let j = 0; j < v; j++) {
          const a = i * (v + 1) + j,
            b = a + v + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      const buffer = gl.createBuffer(),
        index = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW,
      );
      return { buffer, index, count: indices.length };
    }
    const id = canvas.dataset.object,
      meshes = [];
    if (id === "mercury")
      meshes.push({
        mesh: mesh(
          (u, v) => {
            const lat = v / 2 - Math.PI / 2,
              r =
                1 +
                0.16 * Math.sin(u * 3) * Math.cos(lat) ** 2 +
                0.085 * Math.sin(lat * 4);
            return [
              r * Math.cos(lat) * Math.cos(u),
              r * Math.sin(lat) * 1.17,
              r * Math.cos(lat) * Math.sin(u),
            ];
          },
          128,
          64,
          "chrome",
        ),
        scale: 73,
        y: 112,
        material: 0,
        base: [1, 1, 1],
      });
    if (id === "porcelain")
      meshes.push({
        mesh: mesh(
          (u, v) => {
            const a = 2 * u,
              b = 3 * u,
              center = [
                0.63 * Math.cos(a) * (1 + 0.32 * Math.cos(b)),
                0.63 * Math.sin(a) * (1 + 0.32 * Math.cos(b)),
                0.36 * Math.sin(b),
              ];
            const tangent = unit([
                -0.63 * 2 * Math.sin(a) * (1 + 0.32 * Math.cos(b)) -
                  0.63 * 0.96 * Math.cos(a) * Math.sin(b),
                0.63 * 2 * Math.cos(a) * (1 + 0.32 * Math.cos(b)) -
                  0.63 * 0.96 * Math.sin(a) * Math.sin(b),
                1.08 * Math.cos(b),
              ]),
              n = unit(cross(tangent, [0, 0, 1])),
              bin = unit(cross(tangent, n));
            return center.map(
              (x, i) => x + 0.22 * (n[i] * Math.cos(v) + bin[i] * Math.sin(v)),
            );
          },
          200,
          48,
          "ceramic",
        ),
        scale: 91,
        y: 112,
        material: 1,
        base: [0.975, 0.93, 0.84],
      });
    if (id === "totem")
      for (const p of [
        { y: 168, r: 0.9, h: 0.32 },
        { y: 111, r: 0.63, h: 0.37 },
        { y: 54, r: 0.37, h: 0.29 },
      ])
        meshes.push({
          mesh: mesh(
            (u, v) => {
              const r = p.r * (0.83 + 0.17 * Math.cos(v));
              return [r * Math.cos(u), p.h * Math.sin(v), r * Math.sin(u)];
            },
            96,
            48,
            "brass",
          ),
          scale: 71,
          y: p.y,
          material: 2,
          base: [0.85, 0.64, 0.34],
        });
    return {
      render(t, active) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(program);
        for (const [k, p] of meshes.entries()) {
          let angle = 0.4,
            tilt = 0.08,
            y = p.y;
          if (id === "mercury") {
            angle += Math.sin(t * 0.06) * 0.25;
            tilt += Math.sin(t * 0.07) * 0.04;
          }
          if (id === "porcelain") {
            angle += t * 0.025;
            tilt = -0.4;
          }
          if (id === "totem") {
            const shift = Math.sin(t * 0.2 + k) * (1 + active * 5);
            angle = 0.2 + shift * 0.03;
            tilt = -0.25 + shift * 0.012;
            y += shift * 0.35;
          }
          gl.uniform1f(uniforms.uAngle, angle);
          gl.uniform1f(uniforms.uTilt, tilt);
          gl.uniform1f(uniforms.uScale, p.scale);
          gl.uniform1f(uniforms.uY, y);
          gl.uniform3fv(uniforms.uBase, p.base);
          gl.uniform1f(uniforms.uMaterial, p.material);
          gl.bindBuffer(gl.ARRAY_BUFFER, p.mesh.buffer);
          gl.enableVertexAttribArray(aPosition);
          gl.enableVertexAttribArray(aNormal);
          gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
          gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 24, 12);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.mesh.index);
          gl.drawElements(gl.TRIANGLES, p.mesh.count, gl.UNSIGNED_SHORT, 0);
        }
      },
      dispose() {
        for (const p of meshes) {
          gl.deleteBuffer(p.mesh.buffer);
          gl.deleteBuffer(p.mesh.index);
        }
        gl.deleteProgram(program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      },
    };
  }

  const renderers = {
    mercury,
    orbit,
    aurora,
    ember,
    porcelain,
    terrarium,
    blueprint,
    tide,
    totem,
    fold,
    lumen,
  };
  function draw(record, now) {
    const { canvas, ctx } = record;
    if (!canvas.isConnected) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(bounds.width * dpr),
      h = Math.round(bounds.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const card = canvas.closest(".concept") || canvas.closest("#detail-stage");
    const phase = card?.dataset.phase || "idle";
    const dt = Math.min((now - record.last) / 1000, 0.08);
    record.last = now;
    const target = phase === "speaking" ? 1 : phase === "listening" ? 0.35 : 0;
    record.activity += (target - record.activity) * (1 - Math.exp(-dt * 5));
    record.time += dt * (1 + record.activity * 3.6);
    const time = reduce.matches ? 0 : record.time,
      activity = reduce.matches ? 0 : record.activity;
    if (record.gpu) {
      record.gpu.render(time, activity);
      return;
    }
    ctx.setTransform(w / 280, 0, 0, h / 240, 0, 0);
    ctx.clearRect(0, 0, 280, 240);
    renderers[canvas.dataset.object]?.(ctx, time, activity);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const r = records.get(e.target);
        if (r) {
          r.visible = e.isIntersecting;
          draw(r, performance.now());
        }
      }
    },
    { rootMargin: "100px" },
  );
  function mount(root = document) {
    for (const canvas of root.querySelectorAll("canvas[data-object]")) {
      if (records.has(canvas)) continue;
      const gpu = ["mercury", "porcelain", "totem"].includes(
        canvas.dataset.object,
      )
        ? createSculpture(canvas)
        : null;
      const record = {
        canvas,
        gpu,
        ctx: gpu ? null : canvas.getContext("2d"),
        visible: true,
        last: performance.now(),
        time: 0,
        activity: 0,
      };
      records.set(canvas, record);
      observer.observe(canvas);
      draw(record, performance.now());
    }
  }
  function cleanup() {
    for (const [canvas, record] of records)
      if (!canvas.isConnected) {
        observer.unobserve(canvas);
        record.gpu?.dispose();
        records.delete(canvas);
      }
  }
  let last = 0;
  function tick(now) {
    requestAnimationFrame(tick);
    if (now - last < 30 || document.hidden || reduce.matches) return;
    last = now;
    for (const r of records.values()) if (r.visible) draw(r, now);
  }
  reduce.addEventListener("change", () => {
    for (const r of records.values()) draw(r, performance.now());
  });
  window.addEventListener("resize", () => {
    for (const r of records.values()) if (r.visible) draw(r, performance.now());
  });
  window.RoseObjects = {
    mount,
    cleanup,
    refresh: (root) => {
      for (const r of records.values())
        if (r.visible && (!root || root.contains(r.canvas)))
          draw(r, performance.now());
    },
  };
  mount();
  requestAnimationFrame(tick);
})();
