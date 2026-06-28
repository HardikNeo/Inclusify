const Chatbot = {
  geminiKey: null,
  knowledgeBase: {
    'hello': 'Hello! Welcome to Ability. How can I help you today?',
    'hi': 'Hi there! I\'m the Ability assistant. Ask me anything about opportunities, accessibility, or using this platform.',
    'help': 'I can help you with:\n- Finding jobs, scholarships, or training\n- Understanding accessibility features\n- Navigating the platform\n- Voice commands\n\nJust ask!',
    'what is ability': 'Ability is an accessible platform connecting differently-abled individuals with specialized opportunities including jobs, scholarships, training, events, and resources.',
    'accessibility': 'Ability offers:\n- High contrast mode (Alt+C)\n- Adjustable font size (Alt+Plus/Minus)\n- Text-to-speech (click the speaker icon)\n- Voice navigation (click the microphone icon)\n- Screen reader support',
    'voice commands': 'Available voice commands:\n- "Go home" - Navigate to homepage\n- "Browse opportunities" - View listings\n- "Toggle contrast" - Switch high contrast\n- "Read page" - Read content aloud\n- "Increase/decrease font" - Adjust text size\n- "Stop" - Stop reading',
    'how to apply': 'To apply for an opportunity:\n1. Browse opportunities on the listings page\n2. Click on an opportunity to view details\n3. Click "Apply Now"\n4. Upload your resume and write a cover letter\n5. Submit your application',
    'jobs': 'You can find jobs by visiting our Browse Opportunities page and filtering by type "Job". Many employers on our platform are committed to inclusive hiring.',
    'scholarships': 'Scholarships are listed on our Browse Opportunities page. Filter by "Scholarship" type to find educational funding opportunities.',
    'register': 'To register, click "Sign Up" and choose whether you\'re a Job Seeker or an Employer/NGO. Fill in your details and you\'re ready to go!',
    'login': 'Click "Log In" in the navigation bar and enter your email and password.',
    'contact': 'For support, email us at support@ability.org or use this chat for immediate assistance.',
    'thanks': 'You\'re welcome! Is there anything else I can help with?',
    'thank you': 'You\'re welcome! Happy to help.'
  },

  init() {
    this.render();
  },

  render() {
    const container = document.createElement('div');
    container.className = 'chatbot-container';
    container.innerHTML = `
      <div id="chatbot-window" class="chatbot-window bg-white">
        <div class="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <i class="fas fa-robot"></i>
            </div>
            <div>
              <p class="font-semibold text-sm">Ability Assistant</p>
              <p class="text-xs text-blue-100">Always here to help</p>
            </div>
          </div>
          <button onclick="Chatbot.toggle()" class="text-white hover:text-blue-200 text-xl" aria-label="Close chat">&times;</button>
        </div>
        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chat-message bot">
            <div class="chat-bubble">
              Hello! I'm the Ability assistant. How can I help you today? You can ask about opportunities, accessibility features, or how to use the platform.
            </div>
          </div>
        </div>
        <div class="p-3 border-t bg-white">
          <form onsubmit="Chatbot.sendMessage(event)" class="flex gap-2">
            <input type="text" id="chatbot-input" class="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Type a message..." aria-label="Chat message">
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" aria-label="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
      <button onclick="Chatbot.toggle()" class="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition flex items-center justify-center text-xl" aria-label="Open chat assistant" title="Chat with assistant">
        <i class="fas fa-comments"></i>
      </button>
    `;
    document.body.appendChild(container);
  },

  toggle() {
    const win = document.getElementById('chatbot-window');
    win.classList.toggle('active');
    if (win.classList.contains('active')) {
      document.getElementById('chatbot-input').focus();
    }
  },

  async sendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    input.value = '';

    const response = this.getResponse(message);
    setTimeout(() => {
      this.addMessage(response, 'bot');
    }, 500);
  },

  getResponse(message) {
    const lower = message.toLowerCase();

    for (const [key, value] of Object.entries(this.knowledgeBase)) {
      if (lower.includes(key)) {
        return value;
      }
    }

    if (lower.includes('job') || lower.includes('work') || lower.includes('employ')) {
      return 'We have many job opportunities available! Visit our Browse Opportunities page and filter by "Job" type. Many employers actively seek to hire people with disabilities.';
    }

    if (lower.includes('scholar') || lower.includes('education') || lower.includes('study')) {
      return 'Check out our scholarships section! Filter by "Scholarship" type on the Browse Opportunities page to find educational funding.';
    }

    if (lower.includes('train') || lower.includes('course') || lower.includes('learn')) {
      return 'We offer various training programs! Filter by "Training" type to find skill-building courses and workshops.';
    }

    if (lower.includes('event') || lower.includes('meetup') || lower.includes('conference')) {
      return 'Check our Events section for networking opportunities, workshops, and inclusive community events near you!';
    }

    if (lower.includes('disab') || lower.includes('accommodation') || lower.includes('support')) {
      return 'Ability is designed with accessibility in mind. We offer screen reader support, voice navigation, high contrast mode, and adjustable text sizes. You can also note your accessibility needs in your profile.';
    }

    return 'I\'m not sure I understand that question. Try asking about jobs, scholarships, training, events, accessibility features, or how to use the platform. Type "help" for a list of topics.';
  },

  addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `<div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};

document.addEventListener('DOMContentLoaded', () => Chatbot.init());
