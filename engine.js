// Ela Mathearbeit 4. Klasse — Aufgaben-Engine. Nichts ist hartcodiert:
// jede Aufgabe wird aus Zufallszahlen berechnet, jede angezeigte Lösung/Erklärung
// wird aus denselben Zahlen neu hergeleitet statt aus einer Vorlage kopiert.

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function roundTo(n, step) {
  return Math.round(n / step) * step;
}

// ---------- Stellenwert ----------
function decompose4(n) {
  return {
    T: Math.floor(n / 1000) % 10,
    H: Math.floor(n / 100) % 10,
    Z: Math.floor(n / 10) % 10,
    E: n % 10,
  };
}
function compose4({ T, H, Z, E }) {
  return T * 1000 + H * 100 + Z * 10 + E;
}

function genStellenwert() {
  const n = randInt(1000, 9999);
  const d = decompose4(n);
  const mode = choice(["compose", "decompose"]);
  return {
    category: "stellenwert",
    mode,
    n,
    digits: d,
    prompt:
      mode === "compose"
        ? `${d.T}T + ${d.H}H + ${d.Z}Z + ${d.E}E — welche Zahl ist das?`
        : `Zerlege die Zahl ${n} in Tausender, Hunderter, Zehner und Einer.`,
    answer: mode === "compose" ? n : d,
  };
}

// ---------- Zahlenstrahl ----------
function genZahlenstrahl() {
  const level = choice(["A", "B"]);
  if (level === "A") {
    const majorStep = 1000;
    const minorStep = 100;
    let target;
    do {
      target = roundTo(randInt(minorStep, 10000 - minorStep), minorStep);
    } while (target % majorStep === 0);
    return {
      category: "zahlenstrahl",
      min: 0,
      max: 10000,
      majorStep,
      minorStep,
      target,
      prompt: "Welche Zahl zeigt der Pfeil?",
      answer: target,
    };
  } else {
    const majorStep = 100;
    const minorStep = 10;
    const base = roundTo(randInt(0, 9000), 1000);
    let target;
    do {
      target = base + roundTo(randInt(minorStep, 1000 - minorStep), minorStep);
    } while (target % majorStep === 0);
    return {
      category: "zahlenstrahl",
      min: base,
      max: base + 1000,
      majorStep,
      minorStep,
      target,
      prompt: "Welche Zahl zeigt der Pfeil?",
      answer: target,
    };
  }
}

function genZahlenstrahlMitte() {
  const half = randInt(1, 250) * 2;
  const a = roundTo(randInt(0, 9999 - half), 2);
  const b = a + half;
  const mid = (a + b) / 2;
  return {
    category: "zahlenstrahlmitte",
    a,
    b,
    prompt: "Welche Zahl ist genau in der Mitte?",
    answer: mid,
  };
}

// ---------- Nachbarzahlen ----------
function neighborStep(n, step) {
  const lower = Math.floor(n / step) * step;
  if (lower === n) return [n - step, n + step];
  return [lower, lower + step];
}
function genNachbarzahlen() {
  const n = randInt(1002, 9997);
  const kind = choice(["vorgnach", "zehner", "hunderter", "tausender"]);
  let answer, prompt;
  if (kind === "vorgnach") {
    answer = [n - 1, n + 1];
    prompt = `Vorgänger und Nachfolger von ${n}?`;
  } else if (kind === "zehner") {
    answer = neighborStep(n, 10);
    prompt = `Nachbarzehner von ${n}?`;
  } else if (kind === "hunderter") {
    answer = neighborStep(n, 100);
    prompt = `Nachbarhunderter von ${n}?`;
  } else {
    answer = neighborStep(n, 1000);
    prompt = `Nachbartausender von ${n}?`;
  }
  return { category: "nachbarzahlen", kind, n, prompt, answer };
}

// ---------- Vergleichen & Ordnen ----------
function genVergleich() {
  let a = randInt(1000, 9999);
  let b = randInt(1000, 9999);
  while (b === a) b = randInt(1000, 9999);
  return {
    category: "vergleich",
    a,
    b,
    prompt: `${a} ___ ${b}`,
    answer: a < b ? "<" : ">",
  };
}

function genOrdnen() {
  const count = 5;
  const nums = new Set();
  while (nums.size < count) nums.add(randInt(1000, 9999));
  const list = [...nums];
  const dir = choice(["asc", "desc"]);
  const sorted = [...list].sort((a, b) => (dir === "asc" ? a - b : b - a));
  return {
    category: "ordnen",
    list,
    dir,
    prompt:
      dir === "asc"
        ? "Ordne der Größe nach, beginne mit der kleinsten Zahl."
        : "Ordne der Größe nach, beginne mit der größten Zahl.",
    answer: sorted,
  };
}

// ---------- Halbschriftlich (Ergänzen zu Zehnern/Hundertern) ----------
function genHalbschriftlich() {
  const op = choice(["+", "-"]);
  const deltaPool = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500];
  const a = roundTo(randInt(1000, 9990), 10);
  const maxDelta = op === "+" ? 9999 - a : a;
  const feasible = deltaPool.filter((d) => d <= maxDelta);
  const b = feasible.length > 0 ? choice(feasible) : Math.min(10, maxDelta);
  const answer = op === "+" ? a + b : a - b;
  return { category: "halbschriftlich", a, b, op, prompt: `${a} ${op} ${b} =`, answer };
}

// ---------- Schriftlich addieren/subtrahieren (bis 9999) ----------
function genSchriftlich() {
  const op = choice(["+", "-"]);
  let a, b;
  if (op === "+") {
    a = randInt(1000, 9999);
    const bMax = 9999 - a;
    const bMin = Math.min(100, bMax);
    b = randInt(bMin, bMax);
  } else {
    a = randInt(1000, 9999);
    b = randInt(0, a);
  }
  const answer = op === "+" ? a + b : a - b;
  return {
    category: "schriftlich",
    a,
    b,
    op,
    digitsA: decompose4(a),
    digitsB: decompose4(b),
    prompt: `${a} ${op} ${b} =`,
    answer,
  };
}

// ---------- Malkreuz: halbschriftlich multiplizieren ----------
function genMalkreuz() {
  const a = randInt(2, 9);
  const b = randInt(11, 99);
  const b0 = Math.floor(b / 10) * 10;
  const b1 = b % 10;
  const p0 = a * b0;
  const p1 = a * b1;
  const total = a * b;
  return {
    category: "malkreuz",
    a,
    b,
    b0,
    b1,
    p0,
    p1,
    total,
    prompt: `${a} · ${b} =`,
    answer: { p0, p1, total },
  };
}

// ---------- Halbschriftlich dividieren mit Rest ----------
function genTeilen() {
  const d = randInt(2, 9);
  const q = randInt(11, 99);
  const withRest = Math.random() < 0.3;
  const r = withRest ? randInt(1, d - 1) : 0;
  const dividend = q * d + r;
  const qt = Math.floor(q / 10) * 10;
  const qo = q % 10;
  const pt = qt * d;
  const po = qo * d;
  return {
    category: "teilen",
    dividend,
    d,
    qt,
    qo,
    pt,
    po,
    q,
    r,
    prompt: `${dividend} : ${d} =`,
    answer: { q, r },
  };
}

// ---------- Kettenaufgaben ----------
// Jedes Template liefert `steps`: eine Liste von Teilsätzen mit dem Zwischenergebnis
// NACH diesem Schritt. Für die Text-Übung wird daraus ein Fließtext zusammengesetzt;
// für die Audio-Abfrage kann jeder Schritt einzeln vorgelesen werden (mit Pause dazwischen),
// damit das Kind nicht die ganze Kette auf einmal im Kopf behalten muss.
function genKettenaufgabeSteps() {
  const templates = [
    () => {
      const A = randInt(1000, 6000);
      const B = randInt(500, Math.min(4000, 9999 - A));
      const C = randInt(0, A + B);
      return [
        { clause: `Addiere zur Zahl ${A} die Zahl ${B}.`, result: A + B },
        { clause: `Subtrahiere vom Ergebnis die Zahl ${C}.`, result: A + B - C },
      ];
    },
    () => {
      const A = randInt(2000, 9999);
      const B = randInt(500, A);
      const C = randInt(500, 9999 - (A - B));
      return [
        { clause: `Subtrahiere die Zahl ${B} von der Zahl ${A}.`, result: A - B },
        { clause: `Addiere zum Ergebnis die Zahl ${C}.`, result: A - B + C },
      ];
    },
    () => {
      const A = randInt(500, 3000);
      const B = randInt(100, 2000);
      const C = randInt(20, 500);
      const sum = A + B + C;
      const D = randInt(sum, 9999);
      return [
        { clause: `Addiere die Zahlen ${A}, ${B} und ${C}.`, result: sum },
        { clause: `Subtrahiere das Ergebnis von der Zahl ${D}.`, result: D - sum },
      ];
    },
    () => {
      const Bhalf = randInt(200, 3000);
      const B = Bhalf * 2;
      const A = randInt(Bhalf, 9999 - 2000);
      const C = randInt(500, Math.max(501, 9999 - (A - Bhalf)));
      return [
        { clause: `Subtrahiere die Hälfte von ${B} von der Zahl ${A}.`, result: A - Bhalf },
        { clause: `Addiere zum Ergebnis die Zahl ${C}.`, result: A - Bhalf + C },
      ];
    },
  ];
  let steps;
  let tries = 0;
  do {
    steps = choice(templates)();
    tries++;
  } while ((steps[steps.length - 1].result < 0 || steps[steps.length - 1].result > 9999) && tries < 50);
  return steps;
}
function genKettenaufgabe() {
  const steps = genKettenaufgabeSteps();
  const result = steps[steps.length - 1].result;
  return { category: "ketten", prompt: steps.map((s) => s.clause).join(" "), answer: result, steps };
}

// ---------- Sachaufgaben ----------
function genSachaufgabe() {
  const kind = choice(["faehren", "einwohner", "differenz"]);
  if (kind === "faehren") {
    const ships = shuffle(["Albatros", "SuperSpeed", "Transit", "Nautica", "Polaris", "Vega"]).slice(0, 4);
    const caps = ships.map(() => randInt(1200, 2800));
    const i = randInt(0, 3);
    let j = randInt(0, 3);
    while (j === i) j = randInt(0, 3);
    const withFree = Math.random() < 0.5;
    const sum = caps[i] + caps[j];
    if (withFree) {
      const free = randInt(20, Math.floor(sum * 0.1));
      return {
        category: "sachaufgabe",
        prompt: `Es fahren eine Fähre vom Typ ${ships[i]} (${caps[i]} Passagiere) und eine Fähre vom Typ ${ships[j]} (${caps[j]} Passagiere). Heute bleiben ${free} Plätze frei. Wie viele Passagiere sind unterwegs?`,
        answer: sum - free,
      };
    }
    return {
      category: "sachaufgabe",
      prompt: `Es fahren eine Fähre vom Typ ${ships[i]} (${caps[i]} Passagiere) und eine Fähre vom Typ ${ships[j]} (${caps[j]} Passagiere). Wie viele Passagiere können mitfahren?`,
      answer: sum,
    };
  }
  if (kind === "einwohner") {
    const orte = ["Neustadt", "Waldheim", "Seedorf", "Bergstetten", "Lindenau"];
    const ort = choice(orte);
    const a = randInt(1000, 4500);
    const b = randInt(1000, 4500);
    const c = randInt(1000, 4500);
    return {
      category: "sachaufgabe",
      prompt: `Die Ortsteile von ${ort} haben ${a}, ${b} und ${c} Einwohner. Wie viele Einwohner hat der gesamte Ort?`,
      answer: a + b + c,
    };
  }
  // differenz
  const a = randInt(3000, 9000);
  const b = randInt(1000, a - 200);
  const contexts = [
    (a, b, d) => `Ein Stadion hat ${a} Plätze, ein anderes hat ${b} Plätze. Wie viel mehr Plätze hat das größere Stadion?`,
  ];
  return {
    category: "sachaufgabe",
    prompt: contexts[0](a, b, a - b),
    answer: a - b,
  };
}

// ---------- Größtes/kleinstes Ergebnis ----------
function genGroessteKleinste() {
  const nums = new Set();
  while (nums.size < 4) nums.add(randInt(1000, 9000));
  const list = [...nums];
  let max = -Infinity;
  let min = Infinity;
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < list.length; j++) {
      if (i === j) continue;
      const diff = list[i] - list[j];
      if (diff >= 0) {
        if (diff > max) max = diff;
        if (diff < min) min = diff;
      }
    }
  }
  return {
    category: "groesstekleinste",
    list,
    prompt: "Subtrahiere zwei Zahlen. Größtes und kleinstes Ergebnis?",
    answer: { max, min },
  };
}

// ---------- Geometrie: senkrecht & parallel ----------
function angleDiffMod180(a, b) {
  let d = Math.abs(a - b) % 180;
  if (d > 90) d = 180 - d;
  return d;
}
function genSenkrechtParallel() {
  // a‖b (parallel-Paar) und c⊥d (senkrecht-Paar) werden bewusst so konstruiert,
  // dass sie sich winkelmäßig nicht überschneiden — sonst wären mehrere der vier
  // Antwortoptionen gleichzeitig richtig (unfaire Multiple-Choice-Frage).
  const theta1 = randInt(-40, 40);
  const delta = choice([randInt(35, 55), randInt(125, 145)]);
  const theta2 = theta1 + delta;
  const angles = {
    a: theta1,
    b: theta1,
    c: theta2,
    d: theta2 + 90,
  };
  const letters = Object.keys(angles);
  const allPairs = [];
  for (let i = 0; i < letters.length; i++)
    for (let j = i + 1; j < letters.length; j++) allPairs.push([letters[i], letters[j]]);

  const askingParallel = Math.random() < 0.5;
  const correctPair = askingParallel ? ["a", "b"] : ["c", "d"];
  const isMatch = (p) => {
    const diff = angleDiffMod180(angles[p[0]], angles[p[1]]);
    return askingParallel ? diff < 3 : Math.abs(diff - 90) < 3;
  };
  const wrongPairs = allPairs.filter((p) => !(p[0] === correctPair[0] && p[1] === correctPair[1]) && !isMatch(p));
  const options = shuffle([correctPair, ...shuffle(wrongPairs).slice(0, 3)]);
  return {
    category: "senkrechtparallel",
    angles,
    askingParallel,
    prompt: askingParallel
      ? "Welche zwei Geraden sind parallel zueinander?"
      : "Welche zwei Geraden stehen senkrecht zueinander?",
    options: options.map((p) => p.join(" und ")),
    answer: correctPair.join(" und "),
  };
}

// ---------- Geometrie: rechte Winkel zählen ----------
function angleAtVertex(prev, curr, next) {
  const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
  const v2 = { x: next.x - curr.x, y: next.y - curr.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}
function countRightAngles(points, eps = 0.5) {
  const n = points.length;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];
    if (Math.abs(angleAtVertex(prev, curr, next) - 90) < eps) count++;
  }
  return count;
}
function shapeRectangle(w, h) {
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];
}
function shapeRightTriangle(w, h) {
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
  ];
}
function shapeRightTrapezoid(w, h, d) {
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: d, y: h },
  ];
}
function shapeDart(w, h) {
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: w * 0.35, y: h * 1.8 },
  ];
}
function genRechteWinkel() {
  const kind = choice(["rechteck", "dreieck", "trapez", "dart"]);
  const w = randInt(3, 8);
  const h = randInt(3, 8);
  let points, name;
  if (kind === "rechteck") {
    points = shapeRectangle(w, h);
    name = "rechteck";
  } else if (kind === "dreieck") {
    points = shapeRightTriangle(w, h);
    name = "dreieck";
  } else if (kind === "trapez") {
    const d = randInt(1, w - 1);
    points = shapeRightTrapezoid(w, h, d);
    name = "trapez";
  } else {
    points = shapeDart(w, h);
    name = "dart";
  }
  const count = countRightAngles(points);
  return {
    category: "rechtewinkel",
    kind: name,
    points,
    prompt: "Wie viele rechte Winkel hat diese Figur?",
    answer: count,
  };
}

// ---------- Geometrie: Strecken messen/zeichnen ----------
function genStreckeMessen() {
  const mm = randInt(20, 150);
  return {
    category: "streckemessen",
    mm,
    prompt: "Wie lang ist die Strecke?",
    answer: { cm: Math.floor(mm / 10), mm: mm % 10 },
  };
}
function genStreckeZeichnen() {
  const mm = randInt(20, 150);
  const cmPart = `${Math.floor(mm / 10)} cm`;
  const mmPart = mm % 10 ? ` ${mm % 10} mm` : "";
  return {
    category: "streckezeichnen",
    mm,
    prompt: `Zeichne eine Strecke mit der Länge ${cmPart}${mmPart}.`,
    answer: mm,
  };
}

// ---------- Geometrie: Rechteck zeichnen ----------
function genRechteckZeichnen() {
  let w = randInt(2, 8);
  let h = randInt(2, 8);
  while (h === w) h = randInt(2, 8);
  return {
    category: "rechteckzeichnen",
    w,
    h,
    prompt: `Zeichne ein Rechteck: eine Seite ${w} cm, die andere ${h} cm.`,
    answer: { w, h },
  };
}

function genParalleleGeradenZeichnen() {
  const distanceMm = choice([10, 15, 20, 25, 30]);
  const side = choice(["oberhalb", "unterhalb"]);
  return {
    category: "parallelezeichnen",
    distanceMm,
    side,
    prompt: `Zeichne eine Gerade parallel zur Geraden a mit einem Abstand von ${
      distanceMm % 10 === 0 ? distanceMm / 10 + " cm" : (distanceMm / 10).toFixed(1).replace(".", ",") + " cm"
    } ${side}.`,
    answer: distanceMm,
  };
}

// ---------- Schriftliches Rechnen: Übertrag/Borgen als Kontrollrechnung ----------
function columnAdd(a, b) {
  const places = ["E", "Z", "H", "T"];
  let carry = 0;
  const result = {};
  const carries = {};
  for (const p of places) {
    const sum = a[p] + b[p] + carry;
    result[p] = sum % 10;
    carries[p] = carry;
    carry = Math.floor(sum / 10);
  }
  return { result, carries, overflow: carry };
}
function columnSub(a, b) {
  const places = ["E", "Z", "H", "T"];
  let borrow = 0;
  const result = {};
  const borrows = {};
  for (const p of places) {
    let top = a[p] - borrow;
    borrows[p] = borrow;
    if (top < b[p]) {
      top += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result[p] = top - b[p];
  }
  return { result, borrows, underflow: borrow };
}

// ---------- Kopfrechnen (Audio) ----------
function genKopfPlusMinus(range) {
  const op = choice(["+", "-"]);
  const ceiling = range === "hundert" ? 999 : 9999;
  const a = range === "hundert" ? roundTo(randInt(100, 990), 10) : roundTo(randInt(1000, 9900), 10);
  const pool = range === "hundert" ? [10, 20, 30, 40, 50, 100, 200] : [10, 20, 30, 40, 50, 100, 200, 300, 400, 500];
  const maxDelta = op === "+" ? ceiling - a : a;
  const feasible = pool.filter((d) => d <= maxDelta);
  const b = feasible.length > 0 ? choice(feasible) : Math.min(10, maxDelta);
  const answer = op === "+" ? a + b : a - b;
  const spoken = `${a} ${op === "+" ? "plus" : "minus"} ${b}`;
  return { category: "kopf_plusminus", a, b, op, spoken, answer };
}
function genKopfMalGeteilt() {
  const op = choice(["mal", "geteilt"]);
  const x = randInt(2, 10);
  const y = randInt(2, 10);
  if (op === "mal") {
    return { category: "kopf_malgeteilt", op, spoken: `${x} mal ${y}`, answer: x * y };
  }
  const product = x * y;
  return {
    category: "kopf_malgeteilt",
    op,
    spoken: `${product} geteilt durch ${y}`,
    answer: x,
  };
}
function genKopfKette() {
  const t = genKettenaufgabe();
  return { category: "kopf_kette", spoken: t.prompt, answer: t.answer, steps: t.steps };
}

function genKopfAufgabe(range) {
  const kind = choice(["plusminus", "plusminus", "malgeteilt", "kette"]);
  if (kind === "plusminus") return genKopfPlusMinus(range);
  if (kind === "malgeteilt") return genKopfMalGeteilt();
  return genKopfKette();
}

const CATEGORY_GENERATORS = {
  stellenwert: genStellenwert,
  zahlenstrahl: genZahlenstrahl,
  zahlenstrahlmitte: genZahlenstrahlMitte,
  nachbarzahlen: genNachbarzahlen,
  vergleich: genVergleich,
  ordnen: genOrdnen,
  halbschriftlich: genHalbschriftlich,
  schriftlich: genSchriftlich,
  malkreuz: genMalkreuz,
  teilen: genTeilen,
  ketten: genKettenaufgabe,
  sachaufgabe: genSachaufgabe,
  groesstekleinste: genGroessteKleinste,
  senkrechtparallel: genSenkrechtParallel,
  rechtewinkel: genRechteWinkel,
  streckemessen: genStreckeMessen,
  streckezeichnen: genStreckeZeichnen,
  rechteckzeichnen: genRechteckZeichnen,
  parallelezeichnen: genParalleleGeradenZeichnen,
};

if (typeof module !== "undefined") module.exports = {
  randInt,
  choice,
  shuffle,
  roundTo,
  decompose4,
  compose4,
  neighborStep,
  angleDiffMod180,
  angleAtVertex,
  countRightAngles,
  shapeRectangle,
  shapeRightTriangle,
  shapeRightTrapezoid,
  shapeDart,
  genStellenwert,
  genZahlenstrahl,
  genZahlenstrahlMitte,
  genNachbarzahlen,
  genVergleich,
  genOrdnen,
  genHalbschriftlich,
  genSchriftlich,
  genMalkreuz,
  genTeilen,
  genKettenaufgabe,
  genSachaufgabe,
  genGroessteKleinste,
  genSenkrechtParallel,
  genRechteWinkel,
  genStreckeMessen,
  genStreckeZeichnen,
  genRechteckZeichnen,
  genParalleleGeradenZeichnen,
  genKettenaufgabeSteps,
  columnAdd,
  columnSub,
  genKopfPlusMinus,
  genKopfMalGeteilt,
  genKopfKette,
  genKopfAufgabe,
  CATEGORY_GENERATORS,
};
