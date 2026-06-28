const Accessibility = {
  fontSize: 16,
  highContrast: false,
  speaking: false,

  init() {
    this.fontSize = parseInt(localStorage.getItem('ability-fontsize') || '16');
    this.highContrast = localStorage.getItem('ability-highcontrast') === 'true';
    document.documentElement.style.fontSize = this.fontSize + 'px';
    if (this.highContrast) document.body.classList.add('high-contrast');

    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  },

  handleKeyboard(e) {
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      this.toggleHighContrast();
    }
    if (e.altKey && (e.key === '=' || e.key === '+')) {
      e.preventDefault();
      this.increaseFontSize();
    }
    if (e.altKey && e.key === '-') {
      e.preventDefault();
      this.decreaseFontSize();
    }
    if (e.key === 'Escape') {
      this.stopSpeaking();
    }
  },

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    document.body.classList.toggle('high-contrast', this.highContrast);
    localStorage.setItem('ability-highcontrast', this.highContrast);
    showToast(`High contrast ${this.highContrast ? 'enabled' : 'disabled'}`, 'info');
  },

  increaseFontSize() {
    if (this.fontSize < 28) {
      this.fontSize += 2;
      document.documentElement.style.fontSize = this.fontSize + 'px';
      localStorage.setItem('ability-fontsize', this.fontSize);
      showToast(`Font size: ${this.fontSize}px`, 'info');
    }
  },

  decreaseFontSize() {
    if (this.fontSize > 12) {
      this.fontSize -= 2;
      document.documentElement.style.fontSize = this.fontSize + 'px';
      localStorage.setItem('ability-fontsize', this.fontSize);
      showToast(`Font size: ${this.fontSize}px`, 'info');
    }
  },

  speakText(text) {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech not supported in this browser', 'error');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { this.speaking = true; };
    utterance.onend = () => { this.speaking = false; };

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.speaking = false;
    }
  },

  readPageContent() {
    const main = document.querySelector('main') || document.body;
    const elements = main.querySelectorAll('h1, h2, h3, p, a, button, label, th, td');
    let text = '';
    elements.forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (['h1', 'h2', 'h3'].includes(tag)) {
        text += el.textContent.trim() + '. ';
      } else if (tag === 'p') {
        text += el.textContent.trim() + ' ';
      }
    });
    if (text) this.speakText(text.substring(0, 3000));
  },

  readElement(element) {
    if (element) {
      const text = element.getAttribute('aria-label') || element.textContent.trim();
      this.speakText(text);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => Accessibility.init());
