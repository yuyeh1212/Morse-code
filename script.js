// 使用 Map 資料結構以提升查找效能 O(1)
class MorseCodeTranslator {
  constructor() {
    const morseData =
      "A;.-|B;-...|C;-.-.|D;-..|E;.|F;..-.|G;--.|H;....|I;..|J;.---|K;-.-|L;.-..|M;--|N;-.|O;---|P;.--.|Q;--.-|R;.-.|S;...|T;-|U;..-|V;...-|W;.--|X;-..-|Y;-.--|Z;--..|/;-..-.|1;.----|2;..---|3;...--|4;....-|5;.....|6;-....|7;--...|8;---..|9;----.|0;-----";

    this.charToMorse = new Map();
    this.morseToChar = new Map();
    this.playTimer = null;
    this.isPlaying = false;

    this.init(morseData);
    this.bindEvents();
    this.setupAudio();
  }

  init(morseData) {
    const pairs = morseData.split("|");
    const listEl = document.getElementById("translist");

    pairs.forEach((pair) => {
      const [char, code] = pair.split(";");
      this.charToMorse.set(char, code);
      this.morseToChar.set(code, char);

      const li = document.createElement("li");
      li.textContent = `${char} ${code}`;
      listEl.appendChild(li);
    });
  }

  setupAudio() {
    this.shortBeep = document.getElementById("shortBeep");
    this.longBeep = document.getElementById("longBeep");
    this.shortBeep.volume = 0.3;
    this.longBeep.volume = 0.3;
  }

  bindEvents() {
    document
      .getElementById("btnMorse")
      .addEventListener("click", () => this.translateToMorse());
    document
      .getElementById("btnEng")
      .addEventListener("click", () => this.translateToEnglish());
    document
      .getElementById("btnPlay")
      .addEventListener("click", () => this.playMorse());
    document
      .getElementById("btnStop")
      .addEventListener("click", () => this.stopPlaying());
    document
      .getElementById("input")
      .addEventListener("input", (e) => this.sanitizeInput(e));
  }

  sanitizeInput(e) {
    const original = e.target.value;
    const cleaned = original.toUpperCase().replace(/[^A-Z0-9/\s]/g, "");
    if (original !== cleaned) {
      e.target.value = cleaned;
      this.showError("已移除不支援的字元");
      setTimeout(() => this.clearError(), 2000);
    }
  }

  translateToMorse() {
    const input = document.getElementById("input").value.trim();
    if (!input) {
      this.showError("請輸入文字");
      return;
    }

    const result = input
      .toUpperCase()
      .split("")
      .map((char) => {
        if (char === " ") return " ";
        return this.charToMorse.get(char) || char;
      })
      .join(" ");

    this.updateOutput(result);
    this.animateSymbol();
    this.clearError();
  }

  translateToEnglish() {
    const input = document.getElementById("output").value.trim();
    if (!input) {
      this.showError("請輸入摩斯密碼");
      return;
    }

    const codes = input.split(" ");
    const result = codes
      .map((code) => {
        if (code === "") return " ";
        return this.morseToChar.get(code) || code;
      })
      .join("");

    this.updateInput(result);
    this.animateSymbol();
    this.clearError();
  }

  updateOutput(text) {
    const output = document.getElementById("output");
    output.value = text;
    output.classList.add("highlight");
    setTimeout(() => output.classList.remove("highlight"), 500);
  }

  updateInput(text) {
    const input = document.getElementById("input");
    input.value = text;
    input.classList.add("highlight");
    setTimeout(() => input.classList.remove("highlight"), 500);
  }

  animateSymbol() {
    const symbol = document.querySelector(".symbol");
    symbol.classList.add("rotating");
    setTimeout(() => symbol.classList.remove("rotating"), 500);
  }

  async playMorse() {
    const morse = document.getElementById("output").value.trim();
    if (!morse) {
      this.showError("請先翻譯成摩斯密碼");
      return;
    }

    if (this.isPlaying) {
      this.showError("正在播放中");
      return;
    }

    this.isPlaying = true;
    document.getElementById("btnPlay").style.display = "none";
    document.getElementById("btnStop").style.display = "inline-block";

    const playlist = document.getElementById("playlist");
    playlist.innerHTML = "";

    // 建立播放清單視覺效果
    for (const char of morse) {
      const span = document.createElement("span");
      span.textContent = char;
      playlist.appendChild(span);
    }

    await this.playSequence(morse, 0);
  }

  async playSequence(morse, index) {
    if (!this.isPlaying || index >= morse.length) {
      this.stopPlaying();
      return;
    }

    const char = morse[index];
    const spans = document.querySelectorAll(".playlist span");

    // 移除之前的 playing class
    spans.forEach((span) => span.classList.remove("playing"));

    // 加入當前的 playing class
    if (spans[index]) {
      spans[index].classList.add("playing");
    }

    let duration = 0;

    if (char === ".") {
      this.shortBeep.currentTime = 0;
      await this.shortBeep.play();
      duration = 300;
    } else if (char === "-") {
      this.longBeep.currentTime = 0;
      await this.longBeep.play();
      duration = 500;
    } else if (char === " ") {
      duration = 300;
    } else {
      duration = 100;
    }

    this.playTimer = setTimeout(() => {
      this.playSequence(morse, index + 1);
    }, duration);
  }

  stopPlaying() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }

    document.getElementById("btnPlay").style.display = "inline-block";
    document.getElementById("btnStop").style.display = "none";
    document.getElementById("playlist").innerHTML = "";

    // 停止音訊
    this.shortBeep.pause();
    this.longBeep.pause();
    this.shortBeep.currentTime = 0;
    this.longBeep.currentTime = 0;
  }

  showError(message) {
    document.getElementById("errorMsg").textContent = message;
  }

  clearError() {
    document.getElementById("errorMsg").textContent = "";
  }
}

// 初始化應用程式
document.addEventListener("DOMContentLoaded", () => {
  new MorseCodeTranslator();
});
