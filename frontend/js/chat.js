document.addEventListener('DOMContentLoaded', () => {
  // 1. Session check
  const sessionUser = window.OpenChat.session.get('openchat_user');
  if (!sessionUser || !sessionUser.username || !sessionUser.room) {
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

  // 3. Application State (Mock Data)
  let activeRoom = sessionUser.room;
  let rooms = {
    'General': { online: 12, messages: [] },
    'JavaScript': { online: 8, messages: [] },
    'Movies': { online: 5, messages: [] },
    'Sports': { online: 7, messages: [] }
  };

  // Seed custom room if user created one from join screen
  if (!rooms[activeRoom]) {
    rooms[activeRoom] = { online: 1, messages: [] };
  }

  // Sample seed messages
  const userColors = ['green', 'blue', 'orange', 'pink', 'purple'];
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  // Initialize mock history
  rooms['General'].messages = [
    { type: 'system', text: 'Alice joined the room', time: '10:32 AM', class: 'joined' },
    { type: 'system', text: 'Bob joined the room', time: '10:33 AM', class: 'joined-alt' },
    { type: 'user', username: 'Alice', text: 'Hello everyone! 👋', time: '10:34 AM', avatarColor: 'green' },
    { type: 'user', username: 'Bob', text: 'Hi Alice! Welcome to the room.', time: '10:35 AM', avatarColor: 'blue' },
    { type: 'user', username: 'Charlie', text: 'Good morning all ☀️', time: '10:36 AM', avatarColor: 'orange' },
    { type: 'user', username: 'Diana', text: 'Nice to see you all here!', time: '10:37 AM', avatarColor: 'pink' },
    { type: 'system', text: 'Charlie joined the room', time: '10:36 AM', class: 'joined-alt' }
  ];

  rooms['JavaScript'].messages = [
    { type: 'system', text: 'JS Bot joined the room', time: '09:00 AM', class: 'joined' },
    { type: 'user', username: 'Sarah', text: 'Anyone know why my async function is returning undefined?', time: '09:15 AM', avatarColor: 'purple' },
    { type: 'user', username: 'Devin', text: 'Make sure you are actually awaiting the promise call!', time: '09:16 AM', avatarColor: 'orange' }
  ];

  rooms['Movies'].messages = [
    { type: 'user', username: 'Cinephile', text: 'What did everyone think of the new interstellar release?', time: '11:05 AM', avatarColor: 'blue' }
  ];

  rooms['Sports'].messages = [
    { type: 'system', text: 'SportsRoom started', time: 'Yesterday', class: 'joined' }
  ];

  // Set Profile Footer info
  currentUserName.textContent = sessionUser.username;
  currentUserAvatar.textContent = getInitials(sessionUser.username);

  // 4. Helper Render Functions
  function renderRoomsList() {
    roomsNav.innerHTML = '';
    Object.keys(rooms).forEach(roomName => {
      const room = rooms[roomName];
      const isActive = roomName === activeRoom;
      
      const roomEl = document.createElement('div');
      roomEl.className = `sidebar-room-item ${isActive ? 'active' : ''}`;
      roomEl.dataset.room = roomName;
      roomEl.innerHTML = `
        <span class="room-hash">#</span>
        <span class="room-title">${roomName}</span>
        <span class="room-user-count">${room.online} online</span>
      `;
      
      roomEl.addEventListener('click', () => switchRoom(roomName));
      roomsNav.appendChild(roomEl);
    });
  }

  function renderChatFeed() {
    chatFeed.innerHTML = '';
    const messages = rooms[activeRoom].messages;

    messages.forEach(msg => {
      if (msg.type === 'system') {
        const sysEl = document.createElement('div');
        sysEl.className = `system-msg ${msg.class || 'joined'}`;
        sysEl.innerHTML = `
          <span>👋 ${msg.text}</span>
          <span class="system-msg-time">${msg.time}</span>
        `;
        chatFeed.appendChild(sysEl);
      } else {
        const msgEl = document.createElement('div');
        const isSelf = msg.username === sessionUser.username;
        msgEl.className = `message-card ${isSelf ? 'self' : ''}`;
        
        const avatarColor = msg.avatarColor || 'blue';
        const initials = getInitials(msg.username);

        msgEl.innerHTML = `
          <div class="msg-avatar color-${avatarColor}">${initials}</div>
          <div class="msg-content-wrapper">
            <div class="msg-header">
              <span class="msg-username">${msg.username}</span>
              <span class="msg-time">${msg.time}</span>
            </div>
            <div class="msg-text">${msg.text}</div>
          </div>
        `;
        chatFeed.appendChild(msgEl);
      }
    });

    scrollToBottom();
  }

  function updateHeader() {
    currentRoomName.textContent = `# ${activeRoom}`;
    const onlineCount = rooms[activeRoom].online;
    currentRoomStatus.textContent = `${onlineCount} members online`;
    memberCountBadge.textContent = onlineCount;
  }

  function switchRoom(roomName) {
    if (activeRoom === roomName) return;
    activeRoom = roomName;
    
    // Save to session
    sessionUser.room = activeRoom;
    window.OpenChat.session.set('openchat_user', sessionUser);

    renderRoomsList();
    updateHeader();
    renderChatFeed();
    
    window.OpenChat.showToast(`Switched to room: #${roomName}`, 'success');
  }

  function scrollToBottom() {
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  // 5. Actions / Events
  
  // Submit Message
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    const timeString = window.OpenChat.formatTime(new Date());

    // Add user message
    rooms[activeRoom].messages.push({
      type: 'user',
      username: sessionUser.username,
      text: text,
      time: timeString,
      avatarColor: 'blue' // Current user color
    });

    renderChatFeed();
    messageInput.value = '';
    messageInput.style.height = 'auto'; // Reset text area height

    // Simple simulated chatbot reply for premium feel
    setTimeout(() => {
      const replies = [
        "That's interesting! Let's talk more.",
        "I totally agree with that point.",
        "Could you expand on that?",
        "Interesting... this matches what I read yesterday.",
        "Wow, nice! Thanks for sharing."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botTime = window.OpenChat.formatTime(new Date());

      rooms[activeRoom].messages.push({
        type: 'user',
        username: 'ChatBot',
        text: randomReply,
        time: botTime,
        avatarColor: 'purple'
      });
      renderChatFeed();
    }, 1500);
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

  // Create Room modal triggers
  sidebarCreateRoomBtn.addEventListener('click', () => {
    createRoomModal.classList.add('show');
    modalRoomInput.focus();
  });

  modalCancelBtn.addEventListener('click', () => {
    createRoomModal.classList.remove('show');
    modalRoomInput.value = '';
  });

  modalConfirmBtn.addEventListener('click', () => {
    const newRoomName = modalRoomInput.value.trim();
    const error = window.OpenChat.validation.validateRoomName(newRoomName);
    
    if (error) {
      window.OpenChat.showToast(error, 'error');
      modalRoomInput.focus();
      return;
    }

    if (rooms[newRoomName]) {
      window.OpenChat.showToast('Room already exists.', 'error');
      modalRoomInput.focus();
      return;
    }

    // Add room
    rooms[newRoomName] = { online: 1, messages: [] };
    
    // Add system starter message
    rooms[newRoomName].messages.push({
      type: 'system',
      text: `${sessionUser.username} created room #${newRoomName}`,
      time: window.OpenChat.formatTime(new Date()),
      class: 'joined'
    });

    createRoomModal.classList.remove('show');
    modalRoomInput.value = '';
    
    // Switch to new room
    switchRoom(newRoomName);
  });

  // Leave room button
  leaveRoomBtn.addEventListener('click', () => {
    window.OpenChat.session.clear();
    window.OpenChat.showToast('Leaving chat room...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  });

  // Initial render calls
  renderRoomsList();
  updateHeader();
  renderChatFeed();
});
