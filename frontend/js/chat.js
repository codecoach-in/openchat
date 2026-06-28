document.addEventListener('DOMContentLoaded', async () => {
  // 1. Session check
  const sessionUser = window.OpenChat.session.get('openchat_user');
  if (!sessionUser || !sessionUser.username || !sessionUser.room || !sessionUser.roomId) {
    window.location.href = 'index.html';
    return;
  }

  // 2. DOM Elements
  const roomsNav = document.getElementById('roomsNav');
  const sidebarCreateRoomBtn = document.getElementById('sidebarCreateRoomBtn');
  const createRoomModal = document.getElementById('createRoomModal');
  const modalRoomInput = document.getElementById('modalRoomInput');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');
  const currentUserAvatar = document.getElementById('currentUserAvatar');
  const currentUserName = document.getElementById('currentUserName');
  const currentRoomName = document.getElementById('currentRoomName');
  const currentRoomStatus = document.getElementById('currentRoomStatus');
  const memberCountBadge = document.getElementById('memberCountBadge');
  const leaveRoomBtn = document.getElementById('leaveRoomBtn');
  const chatFeed = document.getElementById('chatFeed');
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('messageInput');

  // 3. State Variables
  let activeRoomName = sessionUser.room;
  let activeRoomId = sessionUser.roomId;
  let rooms = []; // Fetched from backend
  let activeMessages = []; // Message history

  const userColors = ['green', 'blue', 'orange', 'pink', 'purple'];
  
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAvatarColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % userColors.length);
    return userColors[index];
  };

  // Set Profile Footer info
  currentUserName.textContent = sessionUser.username;
  currentUserAvatar.textContent = getInitials(sessionUser.username);

  // 4. API Operations
  async function refreshRooms() {
    try {
      rooms = await window.OpenChatAPI.getRooms();
      renderRoomsList();
    } catch (error) {
      window.OpenChat.showToast('Error loading rooms.', 'error');
    }
  }

  async function loadMessages() {
    try {
      chatFeed.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 20px; text-align: center;">Loading message history...</div>';
      activeMessages = await window.OpenChatAPI.getMessages(activeRoomId);
      renderChatFeed();
    } catch (error) {
      chatFeed.innerHTML = '<div style="color: var(--text-error); font-size: 0.9rem; padding: 20px; text-align: center;">Failed to load messages.</div>';
    }
  }

  // 5. Render Functions
  function renderRoomsList() {
    roomsNav.innerHTML = '';
    rooms.forEach((room, idx) => {
      const isActive = room._id === activeRoomId;
      const roomEl = document.createElement('div');
      roomEl.className = `sidebar-room-item ${isActive ? 'active' : ''}`;
      roomEl.dataset.roomId = room._id;
      
      // Mock online numbers for display
      const mockCounts = [12, 8, 5, 7, 3, 2];
      const onlineCount = mockCounts[idx % mockCounts.length];

      roomEl.innerHTML = `
        <span class="room-hash">#</span>
        <span class="room-title">${room.roomName}</span>
        <span class="room-user-count">${onlineCount} online</span>
      `;
      
      roomEl.addEventListener('click', () => switchRoom(room._id, room.roomName));
      roomsNav.appendChild(roomEl);
    });
  }

  function renderChatFeed() {
    chatFeed.innerHTML = '';
    
    if (activeMessages.length === 0) {
      chatFeed.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 20px; text-align: center;">No messages yet. Start the conversation!</div>';
      return;
    }

    activeMessages.forEach(msg => {
      const msgEl = document.createElement('div');
      const isSelf = msg.username === sessionUser.username;
      msgEl.className = `message-card ${isSelf ? 'self' : ''}`;
      
      const avatarColor = getAvatarColor(msg.username);
      const initials = getInitials(msg.username);
      const timeFormatted = window.OpenChat.formatTime(msg.createdAt);

      msgEl.innerHTML = `
        <div class="msg-avatar color-${avatarColor}">${initials}</div>
        <div class="msg-content-wrapper">
          <div class="msg-header">
            <span class="msg-username">${msg.username}</span>
            <span class="msg-time">${timeFormatted}</span>
          </div>
          <div class="msg-text">${msg.message}</div>
        </div>
      `;
      chatFeed.appendChild(msgEl);
    });

    scrollToBottom();
  }

  function updateHeader() {
    currentRoomName.textContent = `# ${activeRoomName}`;
    // Simple static count display
    const matched = rooms.find(r => r._id === activeRoomId);
    const mockCounts = [12, 8, 5, 7, 3, 2];
    const roomIdx = rooms.findIndex(r => r._id === activeRoomId);
    const onlineCount = mockCounts[roomIdx >= 0 ? roomIdx % mockCounts.length : 1];
    
    currentRoomStatus.textContent = `${onlineCount} members online`;
    memberCountBadge.textContent = onlineCount;
  }

  async function switchRoom(roomId, roomName) {
    if (activeRoomId === roomId) return;
    activeRoomId = roomId;
    activeRoomName = roomName;

    // Save to session
    sessionUser.roomId = activeRoomId;
    sessionUser.room = activeRoomName;
    window.OpenChat.session.set('openchat_user', sessionUser);

    renderRoomsList();
    updateHeader();
    await loadMessages();
    
    window.OpenChat.showToast(`Switched to room: #${roomName}`, 'success');
  }

  function scrollToBottom() {
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // 6. Action Triggers & Form Submits
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    try {
      // Send to server
      const savedMsg = await window.OpenChatAPI.sendMessage(activeRoomId, sessionUser.username, text);
      
      // Append returned message and render
      activeMessages.push(savedMsg);
      renderChatFeed();
      
      messageInput.value = '';
      messageInput.style.height = 'auto';
    } catch (error) {
      window.OpenChat.showToast(error.message || 'Failed to send message.', 'error');
    }
  });

  // Grow textarea automatically with typing
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
  });

  // Support Enter to send, Shift+Enter for newline
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // Create Room Modal Handlers
  sidebarCreateRoomBtn.addEventListener('click', () => {
    createRoomModal.classList.add('show');
    modalRoomInput.focus();
  });

  modalCancelBtn.addEventListener('click', () => {
    createRoomModal.classList.remove('show');
    modalRoomInput.value = '';
  });

  modalConfirmBtn.addEventListener('click', async () => {
    const newRoomName = modalRoomInput.value.trim();
    const error = window.OpenChat.validation.validateRoomName(newRoomName);
    
    if (error) {
      window.OpenChat.showToast(error, 'error');
      modalRoomInput.focus();
      return;
    }

    try {
      const newRoom = await window.OpenChatAPI.createRoom(newRoomName);
      createRoomModal.classList.remove('show');
      modalRoomInput.value = '';
      
      // Refresh list, then switch to it
      await refreshRooms();
      await switchRoom(newRoom._id, newRoom.roomName);
    } catch (error) {
      window.OpenChat.showToast(error.message || 'Error creating room.', 'error');
      modalRoomInput.focus();
    }
  });

  // Leave room button
  leaveRoomBtn.addEventListener('click', () => {
    window.OpenChat.session.clear();
    window.OpenChat.showToast('Leaving chat room...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  });

  // Initial Load calls
  await refreshRooms();
  updateHeader();
  await loadMessages();
});
