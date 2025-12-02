import { initBotBrain, processMessage } from './bot-brain.js';

class BotWidget {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    async init() {
        // הזרקת HTML לדף
        this.injectStyles();
        this.createDOM();
        this.attachEvents();
        
        // טעינת המוח
        await initBotBrain();
        this.addMessage("bot", "היי! אני הבוט של סבן סייבר. איך אפשר לעזור?");
    }

    injectStyles() {
        if (!document.getElementById('tailwind-cdn')) {
            const script = document.createElement('script');
            script.id = 'tailwind-cdn';
            script.src = "https://cdn.tailwindcss.com";
            document.head.appendChild(script);
        }
    }

    createDOM() {
        const container = document.createElement('div');
        container.innerHTML = `
            <!-- Chat Button -->
            <button id="chat-toggle-btn" class="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            <!-- Chat Window -->
            <div id="chat-window" class="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col hidden z-50 border border-gray-200">
                <!-- Header -->
                <div class="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
                    <span class="font-bold">Saban Cyber Bot</span>
                    <button id="chat-close-btn" class="text-white hover:text-gray-200">&times;</button>
                </div>
                
                <!-- Messages Area -->
                <div id="chat-messages" class="flex-1 p-3 overflow-y-auto bg-gray-50 text-sm space-y-2"></div>
                
                <!-- Input Area -->
                <div class="p-3 border-t border-gray-200 flex">
                    <input type="text" id="chat-input" class="flex-1 border rounded-l-md p-2 focus:outline-none focus:border-blue-500 text-right" placeholder="הקלד שאלה...">
                    <button id="chat-send" class="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700">שלח</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    attachEvents() {
        this.ui = {
            toggleBtn: document.getElementById('chat-toggle-btn'),
            window: document.getElementById('chat-window'),
            closeBtn: document.getElementById('chat-close-btn'),
            messages: document.getElementById('chat-messages'),
            input: document.getElementById('chat-input'),
            sendBtn: document.getElementById('chat-send')
        };

        this.ui.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.ui.closeBtn.addEventListener('click', () => this.toggleChat());
        
        this.ui.sendBtn.addEventListener('click', () => this.handleSend());
        this.ui.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.ui.window.classList.remove('hidden');
        } else {
            this.ui.window.classList.add('hidden');
        }
    }

    addMessage(sender, text, data = null) {
        const div = document.createElement('div');
        const isBot = sender === 'bot';
        
        div.className = `max-w-[80%] p-2 rounded-lg ${isBot ? 'bg-gray-200 self-start text-gray-800' : 'bg-blue-100 self-end text-blue-900 ml-auto'}`;
        div.innerHTML = text;

        if (data && data.image) {
            div.innerHTML += `<br><img src="${data.image}" class="mt-2 w-full rounded h-24 object-cover">`;
            div.innerHTML += `<div class="font-bold mt-1 text-green-600">${data.price} ₪</div>`;
        }

        this.ui.messages.appendChild(div);
        this.ui.messages.scrollTop = this.ui.messages.scrollHeight;
    }

    async handleSend() {
        const text = this.ui.input.value.trim();
        if (!text) return;

        this.addMessage('user', text);
        this.ui.input.value = '';

        // Bot typing indication could go here
        
        const response = await processMessage(text);
        this.addMessage('bot', response.text, response.data);
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new BotWidget());
} else {
    new BotWidget();
}