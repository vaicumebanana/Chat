// Credenciais fixas
const CORRECT_USERNAME = "Escola";
const CORRECT_PASSWORD = "Senha";

// Elementos do DOM
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const publicChatBtn = document.getElementById('public-chat-btn');
const privateChatBtn = document.getElementById('private-chat-btn');
const recipientSelect = document.getElementById('private-recipient');

// Estado do chat
let currentUser = null;
let isPublicChat = true;
let users = ['Professor', 'Aluno1', 'Aluno2', 'Aluno3']; // Lista de usuários simulada
let messages = {
    public: [],
    private: {}
};

// Inicializar
function init() {
    // Popular lista de usuários para chat privado
    users.forEach(user => {
        if (user !== currentUser) {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            recipientSelect.appendChild(option);
        }
    });
    
    // Carregar mensagens existentes
    loadMessages();
}

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        currentUser = username;
        loginContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        init();
    } else {
        alert('Credenciais incorretas! Use Escola/Senha');
    }
});

// Alternar entre chat público e privado
publicChatBtn.addEventListener('click', () => {
    isPublicChat = true;
    publicChatBtn.classList.add('active');
    privateChatBtn.classList.remove('active');
    recipientSelect.classList.add('hidden');
    loadMessages();
});

privateChatBtn.addEventListener('click', () => {
    isPublicChat = false;
    privateChatBtn.classList.add('active');
    publicChatBtn.classList.remove('active');
    recipientSelect.classList.remove('hidden');
    loadMessages();
});

// Enviar mensagem
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = messageInput.value.trim();
    const recipient = recipientSelect.value;
    
    if (!messageText) return;
    
    if (isPublicChat) {
        // Mensagem pública
        const message = {
            sender: currentUser,
            text: messageText,
            timestamp: new Date(),
            isPublic: true
        };
        messages.public.push(message);
        displayMessage(message);
    } else if (recipient) {
        // Mensagem privada
        const message = {
            sender: currentUser,
            recipient: recipient,
            text: messageText,
            timestamp: new Date(),
            isPublic: false
        };
        
        // Armazenar em ambos os sentidos (para simular)
        if (!messages.private[currentUser]) messages.private[currentUser] = {};
        if (!messages.private[recipient]) messages.private[recipient] = {};
        
        messages.private[currentUser][recipient] = messages.private[currentUser][recipient] || [];
        messages.private[recipient][currentUser] = messages.private[recipient][currentUser] || [];
        
        messages.private[currentUser][recipient].push(message);
        messages.private[recipient][currentUser].push(message);
        
        displayMessage(message);
    } else {
        alert('Selecione um destinatário para o chat privado');
        return;
    }
    
    messageInput.value = '';
});

// Carregar mensagens
function loadMessages() {
    chatMessages.innerHTML = '';
    
    if (isPublicChat) {
        messages.public.forEach(msg => displayMessage(msg));
    } else {
        const recipient = recipientSelect.value;
        if (recipient && messages.private[currentUser]?.[recipient]) {
            messages.private[currentUser][recipient].forEach(msg => displayMessage(msg));
        }
    }
}

// Exibir mensagem
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (!message.isPublic) {
        messageElement.classList.add('private');
    }
    
    let content = `
        <span class="sender">${message.sender}</span>
    `;
    
    if (!message.isPublic) {
        content += ` para <span class="recipient">${message.recipient}</span>`;
    }
    
    content += `: ${message.text} 
        <span class="time">${message.timestamp.toLocaleTimeString()}</span>
    `;
    
    messageElement.innerHTML = content;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Atualizar mensagens quando mudar o destinatário
recipientSelect.addEventListener('change', loadMessages);
