const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const statsBtn = document.getElementById('statsBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const infoPanel = document.getElementById('infoPanel');
const infoPanelContent = document.getElementById('infoPanelContent');
const closePanelBtn = document.getElementById('closePanelBtn');

let messageCount = 0;

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatText(text) {
    // Convert markdown-style bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    return text;
}

function addMessage(content, isAgent = false, metadata = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAgent ? 'agent-message' : 'user-message'}`;
    
    let messageHTML = '';
    
    if (isAgent) {
        messageHTML += '<div class="message-avatar">🤖</div>';
    }
    
    messageHTML += '<div class="message-bubble">';
    messageHTML += `<div class="message-content">${formatText(escapeHtml(content))}</div>`;
    
    if (metadata && metadata.tools_used && metadata.tools_used.length > 0) {
        messageHTML += '<div class="message-metadata">';
        messageHTML += '<div class="tools-used">';
        messageHTML += '<span class="metadata-label">🔧 Tools:</span> ';
        messageHTML += metadata.tools_used.map(tool => {
            const [system, action] = tool.split(':');
            return `<span class="tool-badge ${system.toLowerCase()}">${tool}</span>`;
        }).join(' ');
        messageHTML += '</div>';
        
        if (metadata.intent) {
            messageHTML += `<div class="intent-info">🎯 Intent: <span class="intent-badge">${metadata.intent}</span></div>`;
        }
        
        if (metadata.found_orders > 0 || metadata.found_knowledge > 0) {
            messageHTML += '<div class="data-info">';
            if (metadata.found_orders > 0) {
                messageHTML += `<span class="data-badge">📦 ${metadata.found_orders} order(s)</span>`;
            }
            if (metadata.found_knowledge > 0) {
                messageHTML += `<span class="data-badge">📚 ${metadata.found_knowledge} article(s)</span>`;
            }
            messageHTML += '</div>';
        }
        
        messageHTML += '</div>';
    }
    
    if (!isAgent) {
        messageHTML += '<div class="message-avatar">👤</div>';
    }
    
    messageHTML += '</div>';
    
    messageDiv.innerHTML = messageHTML;
    chatContainer.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    setTimeout(() => {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
    
    messageCount++;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, false);
    messageInput.value = '';
    
    // Show loading
    loadingIndicator.style.display = 'flex';
    sendBtn.disabled = true;
    
    const startTime = Date.now();
    
    try {
        const response = await fetch('/api/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: message })
        });
        
        const data = await response.json();
        
        const elapsed = Date.now() - startTime;
        console.log(`Query processed in ${elapsed}ms`);
        
        if (data.success) {
            addMessage(data.response, true, {
                tools_used: data.tools_used,
                intent: data.intent,
                found_orders: data.metadata?.found_orders || 0,
                found_knowledge: data.metadata?.found_knowledge || 0
            });
        } else {
            addMessage(`❌ Error: ${data.error}`, true);
        }
    } catch (error) {
        addMessage(`❌ Connection error: ${error.message}`, true);
    } finally {
        loadingIndicator.style.display = 'none';
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

async function loadAnalytics() {
    try {
        infoPanelContent.innerHTML = '<div class="loading-analytics">Loading analytics...</div>';
        infoPanel.classList.add('active');
        
        const response = await fetch('/api/analytics/dashboard');
        const data = await response.json();
        
        if (data.success) {
            const analytics = data.data;
            
            let html = '<div class="analytics-grid">';
            
            // Order stats
            html += '<div class="analytics-card">';
            html += '<h4>📦 Orders</h4>';
            html += `<div class="stat-value">${analytics.orders.total}</div>`;
            html += '<div class="stat-breakdown">';
            analytics.orders.byStatus.forEach(stat => {
                const icon = getStatusIcon(stat._id);
                html += `<div class="stat-item">${icon} ${stat._id}: ${stat.count}</div>`;
            });
            html += '</div>';
            html += '</div>';
            
            // Knowledge stats
            html += '<div class="analytics-card">';
            html += '<h4>📚 Knowledge Base</h4>';
            html += `<div class="stat-value">${analytics.knowledge.total}</div>`;
            html += '<div class="stat-breakdown">';
            analytics.knowledge.byCategory.forEach(stat => {
                html += `<div class="stat-item">${stat._id}: ${stat.count} (${stat.totalViews} views)</div>`;
            });
            html += '</div>';
            html += '</div>';
            
            // Recent orders
            if (analytics.orders.recent.length > 0) {
                html += '<div class="analytics-card full-width">';
                html += '<h4>🕒 Recent Orders</h4>';
                html += '<div class="recent-list">';
                analytics.orders.recent.forEach(order => {
                    html += `<div class="recent-item">`;
                    html += `<span class="order-id">${order.order_id}</span>`;
                    html += `<span class="status-badge ${order.status}">${order.status}</span>`;
                    html += `<span class="order-email">${order.customer_email}</span>`;
                    html += `</div>`;
                });
                html += '</div>';
                html += '</div>';
            }
            
            // Top knowledge
            if (analytics.knowledge.topArticles.length > 0) {
                html += '<div class="analytics-card full-width">';
                html += '<h4>⭐ Top Knowledge Articles</h4>';
                html += '<div class="knowledge-list">';
                analytics.knowledge.topArticles.forEach(kb => {
                    html += `<div class="knowledge-item">`;
                    html += `<div class="kb-title">${kb.title}</div>`;
                    html += `<div class="kb-stats">`;
                    html += `<span class="kb-badge">${kb.category}</span>`;
                    html += `<span>👁️ ${kb.views}</span>`;
                    html += `<span>👍 ${kb.helpful_count}</span>`;
                    html += `</div>`;
                    html += `</div>`;
                });
                html += '</div>';
                html += '</div>';
            }
            
            html += '</div>';
            
            infoPanelContent.innerHTML = html;
        } else {
            infoPanelContent.innerHTML = '<div class="error">Failed to load analytics</div>';
        }
    } catch (error) {
        infoPanelContent.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

function getStatusIcon(status) {
    const icons = {
        'pending': '⏳',
        'processing': '⚙️',
        'shipped': '🚚',
        'delivered': '✅',
        'cancelled': '❌'
    };
    return icons[status] || '📦';
}

function resetConversation() {
    if (messageCount === 0 || confirm('Start a new conversation? Your chat history will be cleared.')) {
        chatContainer.innerHTML = `
            <div class="message agent-message">
                <div class="message-avatar">🤖</div>
                <div class="message-bubble">
                    <div class="message-content">
                        <strong>Hello! I'm your Bookly AI assistant.</strong>
                        <p>I can help you with:</p>
                        <ul>
                            <li>📦 Order status and tracking</li>
                            <li>🔄 Returns and refunds</li>
                            <li>🚚 Shipping information</li>
                            <li>🔐 Account and password issues</li>
                            <li>💳 Payment questions</li>
                            <li>ℹ️ General inquiries</li>
                        </ul>
                        <p><em>Try asking: "What's the status of order ORD-12345?" or "How do I return a book?"</em></p>
                    </div>
                </div>
            </div>
        `;
        messageCount = 0;
        messageInput.focus();
    }
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
resetBtn.addEventListener('click', resetConversation);
statsBtn.addEventListener('click', loadAnalytics);
closePanelBtn.addEventListener('click', () => {
    infoPanel.classList.remove('active');
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize input on focus
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
});

// Focus input on load
messageInput.focus();

// Show welcome animation
setTimeout(() => {
    const firstMessage = document.querySelector('.message');
    if (firstMessage) {
        firstMessage.classList.add('animate-in');
    }
}, 100);
