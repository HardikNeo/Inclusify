const VoiceCommands = {
  recognition: null,
  active: false,
  commands: {
    'go home': () => window.location.href = '/',
    'go to home': () => window.location.href = '/',
    'browse opportunities': () => window.location.href = '/opportunities.html',
    'go to opportunities': () => window.location.href = '/opportunities.html',
    'my applications': () => window.location.href = '/my-applications.html',
    'go to applications': () => window.location.href = '/my-applications.html',
    'dashboard': () => window.location.href = '/dashboard.html',
    'go to dashboard': () => window.location.href = '/dashboard.html',
    'toggle contrast': () => Accessibility.toggleHighContrast(),
    'toggle high contrast': () => Accessibility.toggleHighContrast(),
    'increase font': () => Accessibility.increaseFontSize(),
    'larger text': () => Accessibility.increaseFontSize(),
    'decrease font': () => Accessibility.decreaseFontSize(),
    'smaller text': () => Accessibility.decreaseFontSize(),
    'read page': () => Accessibility.readPageContent(),
    'stop reading': () => Accessibility.stopSpeaking(),
    'stop': () => Accessibility.stopSpeaking(),
    'log out': () => Auth.logout(),
    'logout': () => Auth.logout(),
    'sign up': () => showSignupModal(),
    'log in': () => showLoginModal(),
    'login': () => showLoginModal(),
    'create opportunity': () => window.location.href = '/create-opportunity.html'
  },

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim().toLowerCase();
      console.log('Voice command:', transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (this.active) {
          setTimeout(() => this.start(), 1000);
        }
      }
    };

    this.recognition.onend = () => {
      if (this.active) {
        this.recognition.start();
      }
    };
  },

  processCommand(transcript) {
    let matched = false;
    for (const [phrase, action] of Object.entries(this.commands)) {
      if (transcript.includes(phrase)) {
        action();
        Accessibility.speakText(`Executing: ${phrase}`);
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (transcript.includes('fill form') || transcript.includes('fill in')) {
        this.handleFormFill(transcript);
      } else {
        Accessibility.speakText(`Command not recognized: ${transcript}`);
      }
    }
  },

  handleFormFill(transcript) {
    const parts = transcript.split('fill form').pop().split(' with ');
    if (parts.length === 2) {
      const fieldName = parts[0].trim();
      const value = parts[1].trim();
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const label = input.getAttribute('aria-label') || input.getAttribute('placeholder') || input.name || '';
        if (label.toLowerCase().includes(fieldName)) {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          Accessibility.speakText(`Filled ${fieldName} with ${value}`);
        }
      });
    }
  },

  start() {
    if (!this.recognition) {
      this.init();
    }
    if (this.recognition) {
      this.active = true;
      this.recognition.start();
      showToast('Voice control activated', 'success');
    } else {
      showToast('Voice control not supported', 'error');
    }
  },

  stop() {
    this.active = false;
    if (this.recognition) {
      this.recognition.stop();
    }
    showToast('Voice control deactivated', 'info');
  },

  toggle() {
    if (this.active) {
      this.stop();
    } else {
      this.start();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  VoiceCommands.init();
});
