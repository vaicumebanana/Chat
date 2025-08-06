// Credenciais fixas
const CORRECT_USERNAME = "Escola";
const CORRECT_PASSWORD = "Senha";

// Elementos do DOM
const loginContainer = document.getElementById('login-container');
const nameContainer = document.getElementById('name-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('login-form');
const nameForm = document.getElementById('name-form');
const userNameInput = document.getElementById('user-name');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const publicChatBtn = document.getElementById('public-chat-btn');
const privateChatBtn = document.getElementById('private-chat-btn');
const recipientSelect = document.getElementById('private-recipient');
const currentUserDisplay = document.getElementById('current-user-display');

// Estado do chat
let currentUser = null;
let isPublicChat = true;
let allUsers = [];
let allMessages = {
    public: [],
    private: {}
};

// Carregar dados do localStorage
function loadFromStorage() {
    const users = localStorage.getItem('chatUsers');
    const messages = localStorage.getItem('chatMessages');
    
    if (users) allUsers = JSON.parse(users);
    if (messages) allMessages = JSON.parse(messages);
}

// Salvar dados no localStorage
function saveToStorage() {
    localStorage.setItem('chatUsers', JSON.stringify(allUsers));
    localStorage.setItem('chatMessages', JSON.stringify(allMessages));
}

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        loginContainer.classList.add('hidden');
        nameContainer.classList.remove('hidden');
    } else {
        alert('Credenciais incorretas! Use Escola/Senha');
    }
});

// Definir nome do usuário
nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userName = userNameInput.value.trim();
    
    if (userName) {
        currentUser = userName;
        currentUserDisplay.textContent = userName;
        
        // Adicionar usuário à lista se não existir
        if (!allUsers.includes(userName)) {
            allUsers.push(userName);
            saveToStorage();
        }
        
        nameContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        initChat();
    }
});

// Inicializar chat
function initChat() {
    loadFromStorage();
    updateRecipientList();
    loadMessages();
    
    // Configurar envio de mensagens
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        const recipient = recipientSelect.value;
        
        if (!messageText) return;
        
        const newMessage = {
            sender: currentUser,
            text: messageText,
            timestamp: new Date().toISOString(),
            isPublic: isPublicChat
        };
        
        if (isPublicChat) {
            // Mensagem pública
            newMessage.isPublic = true;
            allMessages.public.push(newMessage);
        } else if (recipient) {
            // Mensagem privada
            newMessage.recipient = recipient;
            newMessage.isPublic = false;
            
            // Criar estrutura se não existir
            if (!allMessages.private[currentUser]) allMessages.private[currentUser] = {};
            if (!allMessages.private[recipient]) allMessages.private[recipient] = {};
            
            // Adicionar mensagem para ambos
            allMessages.private[currentUser][recipient] = allMessages.private[currentUser][recipient] || [];
            allMessages.private[recipient][currentUser] = allMessages.private[recipient][currentUser] || [];
            
            allMessages.private[currentUser][recipient].push(newMessage);
            allMessages.private[recipient][currentUser].push(newMessage);
        } else {
            alert('Selecione um destinatário para o chat privado');
            return;
        }
        
        saveToStorage();
        displayMessage(newMessage);
        messageInput.value = '';
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
    
    // Atualizar mensagens quando mudar o destinatário
    recipientSelect.addEventListener('change', loadMessages);
}

// Atualizar lista de destinatários
function updateRecipientList() {
    recipientSelect.innerHTML = '<option value="">Selecione um usuário</option>';
    
    allUsers.forEach(user => {
        if (user !== currentUser) {
            const option = document.createElement('option');
            option.value = user;
            option.textContent = user;
            recipientSelect.appendChild(option);
        }
    });
}

// Carregar mensagens
function loadMessages() {
    chatMessages.innerHTML = '';
    
    if (isPublicChat) {
        allMessages.public.forEach(msg => displayMessage(msg));
    } else {
        const recipient = recipientSelect.value;
        if (recipient && allMessages.private[currentUser]?.[recipient]) {
            allMessages.private[currentUser][recipient].forEach(msg => displayMessage(msg));
        }
    }
    
    // Rolagem automática para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Exibir mensagem
function displayMessage(message) {
    // Verificar se a mensagem deve ser exibida
    if (!message.isPublic && 
        message.sender !== currentUser && 
        message.recipient !== currentUser) {
        return;
    }
    
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
        <span class="time">${new Date(message.timestamp).toLocaleTimeString()}</span>
    `;
    
    messageElement.innerHTML = content;
    chatMessages.appendChild(messageElement);
}

// Carregar dados ao iniciar
loadFromStorage();
