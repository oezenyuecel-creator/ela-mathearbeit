import * as engine from "./engine.js";

let checks = 0;
let failures = [];
function assert(cond, msg) {
  checks++;
  if (!cond) failures.push(msg);
}

const N = 4000;

for (let i = 0; i < N; i++) {
  const t = engine.genStellenwert();
  assert(t.n >= 1000 && t.n <= 9999, `stellenwert range ${t.n}`);
  const d = engine.decompose4(t.n);
  assert(engine.compose4(d) === t.n, `stellenwert compose/decompose mismatch ${t.n}`);
  if (t.mode === "compose") assert(t.answer === t.n, "compose answer must equal n");
  else assert(JSON.stringify(t.answer) === JSON.stringify(d), "decompose answer mismatch");
}

for (let i = 0; i < N; i++) {
  const t = engine.genZahlenstrahl();
  assert(t.target > t.min && t.target < t.max, `zahlenstrahl target out of window ${JSON.stringify(t)}`);
  assert(t.target % t.minorStep === 0, "zahlenstrahl target must align to minorStep");
  assert(t.target % t.majorStep !== 0, "zahlenstrahl target must not coincide with a labeled major tick");
}

for (let i = 0; i < N; i++) {
  const t = engine.genZahlenstrahlMitte();
  assert(t.answer === (t.a + t.b) / 2, "midpoint arithmetic");
  assert(Number.isInteger(t.answer), "midpoint must be integer");
  assert(t.a < t.answer && t.answer < t.b, "midpoint must lie strictly between endpoints");
}

for (let i = 0; i < N; i++) {
  const t = engine.genNachbarzahlen();
  if (t.kind === "vorgnach") {
    assert(t.answer[0] === t.n - 1 && t.answer[1] === t.n + 1, "vorgnach");
  } else {
    const step = t.kind === "zehner" ? 10 : t.kind === "hunderter" ? 100 : 1000;
    const [lo, hi] = engine.neighborStep(t.n, step);
    assert(t.answer[0] === lo && t.answer[1] === hi, `neighborStep ${t.kind} ${t.n}`);
    assert(hi - lo === 2 * step || (lo % step === 0 && hi % step === 0), "neighbor step alignment");
  }
}

for (let i = 0; i < N; i++) {
  const t = engine.genVergleich();
  assert(t.a !== t.b, "vergleich distinct");
  assert(t.answer === (t.a < t.b ? "<" : ">"), "vergleich symbol correctness");
}

for (let i = 0; i < N; i++) {
  const t = engine.genOrdnen();
  const set = new Set(t.list);
  assert(set.size === t.list.length, "ordnen distinct numbers");
  const expected = [...t.list].sort((a, b) => (t.dir === "asc" ? a - b : b - a));
  assert(JSON.stringify(expected) === JSON.stringify(t.answer), "ordnen sort correctness");
}

for (let i = 0; i < N; i++) {
  const t = engine.genHalbschriftlich();
  assert(t.answer >= 0 && t.answer <= 9999, `halbschriftlich range ${t.answer}`);
  assert(t.answer === (t.op === "+" ? t.a + t.b : t.a - t.b), "halbschriftlich arithmetic");
}

for (let i = 0; i < N; i++) {
  const t = engine.genSchriftlich();
  assert(t.answer >= 0 && t.answer <= 9999, `schriftlich range ${t.answer}`);
  assert(t.answer === (t.op === "+" ? t.a + t.b : t.a - t.b), "schriftlich arithmetic");
  assert(engine.compose4(t.digitsA) === t.a, "schriftlich digitsA");
  assert(engine.compose4(t.digitsB) === t.b, "schriftlich digitsB");
}

for (let i = 0; i < N; i++) {
  const t = engine.genMalkreuz();
  assert(t.b0 + t.b1 === t.b, "malkreuz decomposition sums to b");
  assert(t.p0 === t.a * t.b0, "malkreuz p0");
  assert(t.p1 === t.a * t.b1, "malkreuz p1");
  assert(t.total === t.a * t.b, "malkreuz total");
  assert(t.p0 + t.p1 === t.total, "malkreuz partials sum to total");
}

for (let i = 0; i < N; i++) {
  const t = engine.genTeilen();
  assert(t.qt + t.qo === t.q, "teilen quotient decomposition");
  assert(t.pt === t.qt * t.d, "teilen pt");
  assert(t.po === t.qo * t.d, "teilen po");
  assert(t.pt + t.po + t.r === t.dividend, "teilen partials + rest = dividend");
  assert(t.r >= 0 && t.r < t.d, "teilen rest in range");
  assert(t.q * t.d + t.r === t.dividend, "teilen full check");
}

for (let i = 0; i < N; i++) {
  const t = engine.genKettenaufgabe();
  assert(Number.isInteger(t.answer), "ketten integer result");
  assert(t.answer >= 0 && t.answer <= 9999, `ketten range ${t.answer}`);
  assert(Array.isArray(t.steps) && t.steps.length >= 2, "ketten must expose >=2 steps for audio pacing");
  assert(t.steps[t.steps.length - 1].result === t.answer, "ketten last step result must equal final answer");
  t.steps.forEach((s) => assert(Number.isInteger(s.result) && typeof s.clause === "string" && s.clause.length > 5, "ketten step shape"));
}

for (let i = 0; i < N; i++) {
  const t = engine.genSachaufgabe();
  assert(Number.isInteger(t.answer) && t.answer >= 0, `sachaufgabe non-negative integer ${t.answer}`);
  assert(typeof t.prompt === "string" && t.prompt.length > 10, "sachaufgabe has real prompt text");
}

for (let i = 0; i < N; i++) {
  const t = engine.genGroessteKleinste();
  const set = new Set(t.list);
  assert(set.size === 4, "groesstekleinste distinct numbers");
  let max = -Infinity, min = Infinity;
  for (const a of t.list) for (const b of t.list) if (a !== b && a - b >= 0) { if (a - b > max) max = a - b; if (a - b < min) min = a - b; }
  assert(t.answer.max === max, `groesstekleinste max mismatch ${JSON.stringify(t)}`);
  assert(t.answer.min === min, `groesstekleinste min mismatch ${JSON.stringify(t)}`);
}

for (let i = 0; i < N; i++) {
  const t = engine.genSenkrechtParallel();
  assert(t.options.includes(t.answer), "senkrechtparallel answer must be among options");
  assert(new Set(t.options).size === t.options.length, "senkrechtparallel options must be distinct");
  const [x, y] = t.answer.split(" und ");
  const diff = engine.angleDiffMod180(t.angles[x], t.angles[y]);
  if (t.askingParallel) assert(diff < 3, `senkrechtparallel claimed-parallel not actually parallel: diff=${diff}`);
  else assert(Math.abs(diff - 90) < 3, `senkrechtparallel claimed-perp not actually perpendicular: diff=${diff}`);
  // Exactly one option may satisfy the asked relation, or the multiple-choice is unfair.
  const matchingOptions = t.options.filter((opt) => {
    const [p, q] = opt.split(" und ");
    const d = engine.angleDiffMod180(t.angles[p], t.angles[q]);
    return t.askingParallel ? d < 3 : Math.abs(d - 90) < 3;
  });
  assert(matchingOptions.length === 1, `senkrechtparallel ambiguous MC: ${matchingOptions.length} matching options among ${JSON.stringify(t.options)} angles=${JSON.stringify(t.angles)}`);
}

const rechteWinkelExpected = { rechteck: 4, dreieck: 1, trapez: 2, dart: 1 };
for (let i = 0; i < N; i++) {
  const t = engine.genRechteWinkel();
  const recomputed = engine.countRightAngles(t.points);
  assert(recomputed === t.answer, `rechtewinkel recompute mismatch ${t.kind}`);
  assert(recomputed === rechteWinkelExpected[t.kind], `rechtewinkel unexpected count for ${t.kind}: ${recomputed}`);
}

for (let i = 0; i < N; i++) {
  const t = engine.genStreckeMessen();
  assert(t.answer.cm * 10 + t.answer.mm === t.mm, "streckemessen cm/mm decomposition");
  assert(t.answer.mm >= 0 && t.answer.mm <= 9, "streckemessen mm digit range");
}

for (let i = 0; i < N; i++) {
  const t = engine.genStreckeZeichnen();
  assert(t.mm >= 20 && t.mm <= 150, "streckezeichnen range");
  assert(t.answer === t.mm, "streckezeichnen answer matches target mm");
}

for (let i = 0; i < N; i++) {
  const t = engine.genRechteckZeichnen();
  assert(t.w !== t.h, "rechteckzeichnen sides must differ (avoid square ambiguity)");
  assert(t.w >= 2 && t.w <= 8 && t.h >= 2 && t.h <= 8, "rechteckzeichnen side range");
}

for (let i = 0; i < N; i++) {
  const t = engine.genParalleleGeradenZeichnen();
  assert([10, 15, 20, 25, 30].includes(t.distanceMm), "parallelezeichnen distance in pool");
  assert(t.answer === t.distanceMm, "parallelezeichnen answer matches distance");
  assert(t.prompt.includes("cm"), "parallelezeichnen prompt mentions cm");
}

for (let i = 0; i < N; i++) {
  const a = { T: randIntTest(0, 9), H: randIntTest(0, 9), Z: randIntTest(0, 9), E: randIntTest(0, 9) };
  const b = { T: randIntTest(0, 9), H: randIntTest(0, 9), Z: randIntTest(0, 9), E: randIntTest(0, 9) };
  const numA = engine.compose4(a);
  const numB = engine.compose4(b);
  if (numA + numB <= 9999) {
    const add = engine.columnAdd(a, b);
    assert(engine.compose4(add.result) === numA + numB, `columnAdd mismatch ${numA}+${numB}`);
  }
  if (numA >= numB) {
    const sub = engine.columnSub(a, b);
    assert(engine.compose4(sub.result) === numA - numB, `columnSub mismatch ${numA}-${numB}`);
    assert(sub.underflow === 0, "columnSub must not underflow when a>=b");
  }
}
function randIntTest(min, max) {
  return engine.randInt(min, max);
}

for (let i = 0; i < N; i++) {
  const t1 = engine.genKopfPlusMinus("hundert");
  assert(t1.answer >= 0 && t1.answer <= 999, `kopf hundert range ${t1.answer}`);
  assert(t1.answer === (t1.op === "+" ? t1.a + t1.b : t1.a - t1.b), "kopf hundert arithmetic");
  const t2 = engine.genKopfPlusMinus("tausend");
  assert(t2.answer >= 0 && t2.answer <= 9999, `kopf tausend range ${t2.answer}`);
  assert(t2.answer === (t2.op === "+" ? t2.a + t2.b : t2.a - t2.b), "kopf tausend arithmetic");

  const t3 = engine.genKopfMalGeteilt();
  assert(t3.answer >= 2 && t3.answer <= 100, `kopf malgeteilt range ${t3.answer}`);

  const t4 = engine.genKopfKette();
  assert(Number.isInteger(t4.answer), "kopf kette integer");
}

console.log(`${checks} Zusicherungen geprüft.`);
if (failures.length) {
  console.error(`${failures.length} FEHLER:`);
  const uniq = [...new Set(failures)].slice(0, 20);
  for (const f of uniq) console.error(" - " + f);
  process.exit(1);
} else {
  console.log("Alle Generatoren rechnerisch verifiziert. ✓");
}
