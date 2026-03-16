document.addEventListener('DOMContentLoaded', () => {
    // Chat widget elements
    const chatbotWidget = document.getElementById('chatbot-widget');
    const openChatBtn = document.getElementById('open-chat-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const thinkingAnimation = document.getElementById('thinking-animation');

    // Open chatbot
    openChatBtn.addEventListener('click', () => {
        chatbotWidget.classList.add('open');
    });

    // Close chatbot
    closeChatBtn.addEventListener('click', () => {
        chatbotWidget.classList.remove('open');
    });

    // Handle chat form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userMessage = userInput.value.trim();
        if (!userMessage) {
            return;
        }

        addMessageToChatBox('user', userMessage);
        userInput.value = '';
        
        // Show thinking animation
        thinkingAnimation.style.display = 'flex';
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation: [{ role: 'user', text: userMessage }],
                }),
            });
            
            // Hide thinking animation
            thinkingAnimation.style.display = 'none';

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                addMessageToChatBox('bot', 'Gagal mendapat respon dari server.');
                console.error('Server Error:', response.status, errorData);
                return;
            }

            const data = await response.json();

            if (data && data.reply) {
                addMessageToChatBox('bot', data.reply);
            } else {
                addMessageToChatBox('bot', 'Maaf, tidak ada respon yang diterima.');
            }
        } catch (error) {
            // Hide thinking animation
            thinkingAnimation.style.display = 'none';
            addMessageToChatBox('bot', 'Gagal mendapat respon dari server.');
            console.error('Fetch Error:', error);
        }
    });

    function addMessageToChatBox(role, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${role}-message`);

        if (role === 'bot') {
            // For bot messages, we can interpret some simple formatting.
            // Convert **text** to <b>text</b>
            // and newlines to <br> tags for better readability.
            // Using innerHTML is safe here as the content comes from a trusted API.
            const formattedText = text
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
                .replace(/\n/g, '<br>');                 // Newlines
            messageElement.innerHTML = formattedText;
        } else {
            // For user messages, always use textContent to prevent self-XSS.
            messageElement.textContent = text;
        }

        chatBox.appendChild(messageElement);
        // Scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Also attach the listener to the CTA button in the hero section
    const ctaButton = document.querySelector('#cta button');
    if(ctaButton) {
        ctaButton.addEventListener('click', () => {
            chatbotWidget.classList.add('open');
        });
    }
});
