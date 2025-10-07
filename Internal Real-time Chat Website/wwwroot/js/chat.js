// Chat Application JavaScript
class ChatApp {
    constructor() {
        this.connection = null;
        this.currentUserId = null;
        this.currentChatUserId = null;
        this.currentChatUserName = null;
        this.messages = [];
        this.isConnected = false;
        
        this.initializeElements();
        this.initializeSignalR();
        this.bindEvents();
        this.updateOnlineCount();
    }

    initializeElements() {
        this.elements = {
            usersList: document.getElementById('usersList'),
            messagesList: document.getElementById('messagesList'),
            messagesContainer: document.getElementById('messagesContainer'),
            messageInput: document.getElementById('messageInput'),
            messageForm: document.getElementById('messageForm'),
            messageInputArea: document.getElementById('messageInputArea'),
            chatHeader: document.getElementById('chatHeader'),
            noChatSelected: document.getElementById('noChatSelected'),
            chatUserName: document.getElementById('chatUserName'),
            chatUserStatus: document.getElementById('chatUserStatus'),
            onlineCount: document.getElementById('onlineCount'),
            attachBtn: document.getElementById('attachBtn'),
            fileInput: document.getElementById('fileInput'),
            loadingSpinner: document.getElementById('loadingSpinner')
        };
    }

    async initializeSignalR() {
        try {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl("/chathub", {
                    skipNegotiation: true,
                    transport: signalR.HttpTransportType.WebSockets
                })
                .withAutomaticReconnect()
                .build();

            // Connection events
            this.connection.onclose(() => {
                this.isConnected = false;
                console.log('SignalR connection closed');
            });

            this.connection.onreconnecting(() => {
                this.isConnected = false;
                console.log('SignalR reconnecting...');
            });

            this.connection.onreconnected(() => {
                this.isConnected = true;
                console.log('SignalR reconnected');
            });

            // Chat events
            this.connection.on("ReceiveMessage", (message) => {
                this.handleReceivedMessage(message);
            });

            this.connection.on("MessageSent", (message) => {
                this.handleMessageSent(message);
            });

            this.connection.on("UserStatusChanged", (userId, isOnline) => {
                this.updateUserStatus(userId, isOnline);
            });

            // Start connection
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR connected successfully');

        } catch (error) {
            console.error('SignalR connection error:', error);
            this.showNotification('Connection error. Please refresh the page.', 'error');
            // Retry connection after 5 seconds
            setTimeout(() => {
                this.initializeSignalR();
            }, 5000);
        }
    }

    bindEvents() {
        // User selection
        this.elements.usersList.addEventListener('click', (e) => {
            e.preventDefault();
            const userItem = e.target.closest('.user-item');
            if (userItem) {
                this.selectUser(userItem);
            }
        });

        // Message form submission
        this.elements.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Enter key to send message
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // File attachment
        this.elements.attachBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.uploadFile(e.target.files[0]);
            }
        });

        // Auto-scroll messages
        this.elements.messagesContainer.addEventListener('DOMNodeInserted', () => {
            this.scrollToBottom();
        });
    }

    selectUser(userItem) {
        // Remove active class from all users
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('bg-primary-50', 'border-primary-200');
            item.classList.add('border-transparent');
        });

        // Add active class to selected user
        userItem.classList.add('bg-primary-50', 'border-primary-200');
        userItem.classList.remove('border-transparent');

        // Get user info
        const userId = userItem.dataset.userId;
        const userName = userItem.dataset.userName;
        const statusBadge = userItem.querySelector('.status-indicator');
        const isOnline = statusBadge.classList.contains('bg-green-500');

        // Update current chat
        this.currentChatUserId = userId;
        this.currentChatUserName = userName;

        // Show chat interface
        this.showChatInterface(userName, isOnline);

        // Load messages
        this.loadMessages(userId);
    }

    showChatInterface(userName, isOnline) {
        this.elements.chatHeader.classList.remove('hidden');
        this.elements.noChatSelected.classList.add('hidden');
        this.elements.messageInputArea.style.display = 'block';

        this.elements.chatUserName.textContent = userName;
        this.elements.chatUserInitial.textContent = userName.charAt(0).toUpperCase();
        this.elements.chatUserStatus.textContent = isOnline ? 'Online' : 'Offline';
        
        const statusDot = document.getElementById('chatUserStatusDot');
        if (statusDot) {
            statusDot.className = `w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`;
        }

        this.elements.messageInput.focus();
    }

    async loadMessages(userId) {
        try {
            this.showLoading(true);
            this.elements.messagesList.innerHTML = '';

            const response = await fetch(`/Chat/GetMessages?receiverId=${userId}`);
            if (response.ok) {
                const messages = await response.json();
                this.messages = messages;
                this.displayMessages(messages);
            } else {
                throw new Error('Failed to load messages');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showNotification('Failed to load messages', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayMessages(messages) {
        this.elements.messagesList.innerHTML = '';
        
        messages.forEach(message => {
            this.addMessageToUI(message);
        });

        this.scrollToBottom();
    }

    addMessageToUI(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'} ${message.isFromCurrentUser ? 'message-sent' : 'message-received'}`;
        messageDiv.dataset.messageId = message.id;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = `max-w-xs lg:max-w-md px-4 py-2 rounded-2xl message-bubble-shadow ${
            message.isFromCurrentUser 
                ? 'bg-primary-600 text-white rounded-br-md' 
                : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
        }`;

        // Message content
        let content = this.escapeHtml(message.content);
        
        // Handle attachments
        if (message.attachmentPath) {
            if (message.attachmentType && message.attachmentType.startsWith('image/')) {
                content += `<br><img src="${message.attachmentPath}" class="mt-2 max-w-full h-auto rounded-lg" alt="Attachment">`;
            } else {
                const fileName = message.attachmentPath.split('/').pop();
                content += `<br><a href="${message.attachmentPath}" class="inline-flex items-center space-x-1 mt-2 text-sm underline hover:no-underline" target="_blank">
                    <i class="fas fa-paperclip"></i>
                    <span>${fileName}</span>
                </a>`;
            }
        }

        bubbleDiv.innerHTML = content;

        // Message time
        const timeDiv = document.createElement('div');
        timeDiv.className = `text-xs mt-1 ${message.isFromCurrentUser ? 'text-primary-100' : 'text-gray-500'}`;
        timeDiv.textContent = this.formatTime(message.timestamp);

        // Container for message and time
        const containerDiv = document.createElement('div');
        containerDiv.className = 'flex flex-col';
        containerDiv.appendChild(bubbleDiv);
        containerDiv.appendChild(timeDiv);

        messageDiv.appendChild(containerDiv);
        this.elements.messagesList.appendChild(messageDiv);
    }

    async sendMessage() {
        const content = this.elements.messageInput.value.trim();
        if (!content || !this.isConnected || !this.currentChatUserId) {
            console.log('Cannot send message:', { content: !!content, isConnected: this.isConnected, currentChatUserId: this.currentChatUserId });
            return;
        }

        try {
            console.log('Sending message:', { content, receiverId: this.currentChatUserId });
            
            // Clear input
            this.elements.messageInput.value = '';

            // Send via SignalR
            await this.connection.invoke("SendMessage", this.currentChatUserId, content, null, null);
            console.log('Message sent successfully');

        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Failed to send message: ' + error.message, 'error');
            // Restore input content
            this.elements.messageInput.value = content;
        }
    }

    async uploadFile(file) {
        try {
            this.showLoading(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/Chat/UploadFile', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                
                // Send message with attachment
                if (this.isConnected && this.currentChatUserId) {
                    await this.connection.invoke("SendMessage", 
                        this.currentChatUserId, 
                        `📎 ${file.name}`, 
                        result.filePath, 
                        result.fileType
                    );
                }
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            this.showNotification('Failed to upload file', 'error');
        } finally {
            this.showLoading(false);
            this.elements.fileInput.value = '';
        }
    }

    handleReceivedMessage(message) {
        console.log('Received message:', message);
        if (message.senderId === this.currentChatUserId) {
            this.addMessageToUI({
                ...message,
                isFromCurrentUser: false
            });
        }
    }

    handleMessageSent(message) {
        console.log('Message sent confirmation:', message);
        if (message.receiverId === this.currentChatUserId) {
            this.addMessageToUI({
                ...message,
                isFromCurrentUser: true
            });
        }
    }

    updateUserStatus(userId, isOnline) {
        const statusBadge = document.querySelector(`.status-indicator[data-user-id="${userId}"]`);
        const statusTextBadge = document.querySelector(`.status-badge[data-user-id="${userId}"]`);
        
        if (statusBadge) {
            statusBadge.className = `absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white status-indicator ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`;
        }
        
        if (statusTextBadge) {
            statusTextBadge.textContent = isOnline ? 'Online' : 'Offline';
            statusTextBadge.className = `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium status-badge ${isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`;
        }

        // Update chat header status if this is the current chat user
        if (userId === this.currentChatUserId) {
            this.elements.chatUserStatus.textContent = isOnline ? 'Online' : 'Offline';
            const statusDot = document.getElementById('chatUserStatusDot');
            if (statusDot) {
                statusDot.className = `w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`;
            }
        }

        this.updateOnlineCount();
    }

    updateOnlineCount() {
        const onlineUsers = document.querySelectorAll('.status-indicator.bg-green-500');
        this.elements.onlineCount.textContent = `${onlineUsers.length} online`;
    }

    scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    showLoading(show) {
        this.elements.loadingSpinner.style.display = show ? 'block' : 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500' : 'bg-primary-600';
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="${icon}"></i>
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            return `${Math.floor(diff / 3600000)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Initialize chat app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
