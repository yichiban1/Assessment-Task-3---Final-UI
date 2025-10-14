const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" },
  envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 2 },
}).chain(
  new Tone.FeedbackDelay("8n", 0.4).set({ wet: 0.35 }),
  Tone.Destination
);

// Chinese-English comparison table
const dict = {
  对酒当歌: "Before wine, sing a song!",
  人生几何: "How can life last long?",
  譬如朝露: "Dissipated like morning dew,",
  去日苦多: "Happy time is woefully gone.",
  慨当以慷: "Noble ideas soar and overflow",
  忧思难忘: "Innermost concerns keep in mind",
  何以解忧: "How to drown such grief and sorrow?",
  唯有杜康: "Best resort to Du Kang Wine.",
};

let currentLine = null; // Remember which line is displaying English
document.querySelectorAll(".line").forEach((line) => {
  // Save both Chinese and English to your phone
  line.dataset.chinese = line.textContent;
  line.dataset.english = dict[line.textContent];

  // Create a span to hold English
  const span = document.createElement("span");
  span.className = "english-overlay";
  span.textContent = line.dataset.english;
  line.appendChild(span);

  // Click event
  line.addEventListener("click", async () => {
    await Tone.start(); // The browser requires unlocking first
    synth.triggerAttackRelease(line.dataset.note, "8n");

    // Switch to English display
    if (currentLine === line) {
      span.classList.remove("show");
      currentLine = null;
    } else {
      if (currentLine) {
        currentLine.querySelector(".english-overlay").classList.remove("show");
      }
      span.classList.add("show");
      currentLine = line;
    }
    // Typewriter: Works the first time
    if (!span.dataset.typed) {
      span.dataset.typed = "1";
      typeWriter(span, line.dataset.english);
    }

    // Random color change
    const hue = Math.random() * 360;
    line.style.color = `hsl(${hue}, 100%, 70%)`;
    /* === Star Halo Blast Patch === */
    const col = line.parentElement;
    col.style.setProperty("--colHue", hue); // 把点击颜色同步给星晕
    col.animate(
      [
        { filter: "brightness(1)" },
        { filter: "brightness(2.5)" },
        { filter: "brightness(1)" },
      ],
      { duration: 600, easing: "ease-out" }
    );
  });
});

const lines = Array.from(document.querySelectorAll(".line"));
// Three functions
document.getElementById("play").onclick = () => playLines(lines);
document.getElementById("reverse").onclick = () =>
  playLines([...lines].reverse());
document.getElementById("random").onclick = () =>
  playLines([...lines].sort(() => 0.5 - Math.random()));

async function playLines(arr) {
  await Tone.start();
  let i = 0;
  const timer = setInterval(() => {
    if (i >= arr.length) {
      clearInterval(timer);
      return;
    }
    const nowLine = arr[i];
    synth.triggerAttackRelease(nowLine.dataset.note, "8n");
    nowLine.style.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
    i++;
  }, 500);
}
const captions = [
  "按下空格键切换显示模式",
  "Press the spacebar to switch display modes",
  "双击文本可获取注释",
  "Double-click text to get annotations",
  "东汉·曹操　|　建安十三年",
  "Eastern Han Dynasty - Cao Cao | Jian'an 13th Year",
  "对酒当歌，人生几何　|　唐·吴兢《乐府古题要解》",
  "Before wine, sing a song! | Tang Dynasty, Wu Jing, 《Essentials of Ancient Yuefu Poems》",
  "本页英译仅供娱乐，学术版本请参《Cao Cao Poems》",
  "This English translation is for entertainment purposes only. For the academic version, please refer to Cao Cao Poems.",
];
let capIndex = 0;
const capEl = document.getElementById("caption");
function showCap() {
  capEl.style.transition = "opacity .8s";
  capEl.style.opacity = 0;
  setTimeout(() => {
    capEl.textContent = captions[capIndex];
    capEl.style.opacity = 0.58;
    capIndex = (capIndex + 1) % captions.length;
  }, 800);
}
showCap();
setInterval(showCap, 4300);
/* ===== Typewriter effect ===== */
function typeWriter(el, txt, speed = 70) {
  el.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    el.textContent += txt[i++];
    if (i === txt.length) clearInterval(timer);
  }, speed);
}

// Typewriter effect: works on the first click
document.querySelectorAll(".line").forEach((line) => {
  line.addEventListener("click", () => {
    const span = line.querySelector(".english-overlay");
    if (span.classList.contains("show") && !span.dataset.typed) {
      span.dataset.typed = "1"; // Mark Typed
      typeWriter(span, line.dataset.english);
    }
  });
});
// Museum-style background subtitles
const facts = {
  对酒当歌:
    "In the 13th year of Jian'an, Cao Cao led 830,000 naval forces south and wrote this sentence during a banquet.",
  人生几何:
    "Adapting the line “My heart burns with sorrow” from “诗经·采薇” in the Book of Songs, lamenting the brevity of life..",
  譬如朝露:
    "The quote comes from 《汉书》 “Life is like morning dew”, which means that time is fleeting.",
  去日苦多:
    "“去日” refers to the time that has passed, and “苦多” means the pain is great.",
  慨当以慷:
    "“慨慷” was a common expression in the Han and Wei dynasties, meaning high spirits.",
  忧思难忘:
    "On the eve of the Battle of Red Cliffs, Cao Cao was worried that the Eastern Wu had not yet been pacified.",
  何以解忧:
    "The term “worry” was already a set phrase in pre-Qin times, with 《说文》defining it as “grief.”",
  唯有杜康:
    "“杜康”, the legendary ancestor of winemaking in the Xia Dynasty, here serves as a metonym for fine wine.",
};
let infoTimer;
document.querySelectorAll(".line").forEach((line) => {
  line.addEventListener("dblclick", () => {
    clearTimeout(infoTimer);
    const el = document.getElementById("info");
    el.textContent = facts[line.dataset.chinese];
    el.style.opacity = 1;
    infoTimer = setTimeout(() => (el.style.opacity = 0), 9000);
  });
});
/* ===== Space to switch mode ===== */
let night = false;
addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  e.preventDefault();
  night = !night;
  document.body.style.background = night
    ? "linear-gradient(-45deg,#fff8e1,#ffecb3,#fff8e1,#ffcc80)"
    : "linear-gradient(-45deg,#111,#222,#111,#333)";
  document.body.style.color = night ? "#3e2723" : "#eee";
});
