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
            item.classList.remove('active');
        });

        // Add active class to selected user
        userItem.classList.add('active');

        // Get user info
        const userId = userItem.dataset.userId;
        const userName = userItem.dataset.userName;
        const statusBadge = userItem.querySelector('.status-indicator');
        const isOnline = statusBadge.classList.contains('bg-success');

        // Update current chat
        this.currentChatUserId = userId;
        this.currentChatUserName = userName;

        // Show chat interface
        this.showChatInterface(userName, isOnline);

        // Load messages
        this.loadMessages(userId);
    }

    showChatInterface(userName, isOnline) {
        this.elements.chatHeader.classList.remove('d-none');
        this.elements.noChatSelected.classList.add('d-none');
        this.elements.messageInputArea.style.display = 'block';

        this.elements.chatUserName.textContent = userName;
        this.elements.chatUserStatus.textContent = isOnline ? 'Online' : 'Offline';
        this.elements.chatUserStatus.className = `badge ms-2 ${isOnline ? 'bg-success' : 'bg-secondary'}`;

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
        messageDiv.className = `message ${message.isFromCurrentUser ? 'sent' : 'received'}`;
        messageDiv.dataset.messageId = message.id;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';

        // Message content
        let content = this.escapeHtml(message.content);
        
        // Handle attachments
        if (message.attachmentPath) {
            if (message.attachmentType && message.attachmentType.startsWith('image/')) {
                content += `<br><img src="${message.attachmentPath}" class="attachment-preview" alt="Attachment">`;
            } else {
                const fileName = message.attachmentPath.split('/').pop();
                content += `<br><a href="${message.attachmentPath}" class="file-attachment" target="_blank">
                    <i class="fas fa-paperclip"></i> ${fileName}
                </a>`;
            }
        }

        bubbleDiv.innerHTML = content;

        // Message time
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(message.timestamp);

        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timeDiv);
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
        if (statusBadge) {
            statusBadge.textContent = isOnline ? 'Online' : 'Offline';
            statusBadge.className = `badge ms-2 status-indicator ${isOnline ? 'bg-success' : 'bg-secondary'}`;
        }

        // Update chat header status if this is the current chat user
        if (userId === this.currentChatUserId) {
            this.elements.chatUserStatus.textContent = isOnline ? 'Online' : 'Offline';
            this.elements.chatUserStatus.className = `badge ms-2 ${isOnline ? 'bg-success' : 'bg-secondary'}`;
        }

        this.updateOnlineCount();
    }

    updateOnlineCount() {
        const onlineUsers = document.querySelectorAll('.status-indicator.bg-success');
        this.elements.onlineCount.textContent = onlineUsers.length;
    }

    scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    showLoading(show) {
        this.elements.loadingSpinner.style.display = show ? 'block' : 'none';
    }

    showNotification(message, type = 'info') {
        // Simple notification - you can enhance this with a proper notification library
        const alertClass = type === 'error' ? 'alert-danger' : 'alert-info';
        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
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
