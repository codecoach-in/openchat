document.addEventListener('DOMContentLoaded', async () => {
  const joinForm = document.getElementById('joinForm');
  const displayNameInput = document.getElementById('displayName');
  const customRoomInput = document.getElementById('customRoom');
  const roomsListContainer = document.querySelector('.rooms-list');
  let fetchedRooms = [];

  // 1. Fetch and render available rooms from API
  async function loadRooms() {
    try {
      roomsListContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 10px;">Loading rooms...</div>';
      fetchedRooms = await window.OpenChatAPI.getRooms();
      
      if (fetchedRooms.length === 0) {
        roomsListContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem; padding: 10px;">No rooms found. Create a new one below!</div>';
        return;
      }

      roomsListContainer.innerHTML = '';
      fetchedRooms.forEach((room, idx) => {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'room-option';
        
        // General online count mock display
        const mockOnline = [12, 8, 5, 7, 3, 2];
        const onlineCount = room.online || mockOnline[idx % mockOnline.length];
        
        optionLabel.innerHTML = `
          <input type="radio" name="room" value="${room._id}" ${idx === 0 ? 'checked' : ''}>
          <span class="room-radio-custom"></span>
          <span class="room-name">${room.roomName}</span>
          <span class="room-badge">${onlineCount} online</span>
        `;
        
        roomsListContainer.appendChild(optionLabel);
      });

      // Attach dynamic border styling handlers
      attachRadioHandlers();
    } catch (error) {
      console.error(error);
      roomsListContainer.innerHTML = '<div style="color: var(--text-error); font-size: 0.85rem; padding: 10px;">Failed to load rooms. Local server down?</div>';
    }
  }

  function attachRadioHandlers() {
    const roomRadios = document.querySelectorAll('input[name="room"]');
    
    // Auto-select styling for checked
    roomRadios.forEach(radio => {
      const option = radio.closest('.room-option');
      if (radio.checked) {
        option.style.borderColor = 'var(--primary)';
        option.style.background = 'rgba(37, 99, 235, 0.08)';
      }

      radio.addEventListener('change', () => {
        if (radio.checked) {
          customRoomInput.value = '';
          roomRadios.forEach(r => {
            const opt = r.closest('.room-option');
            if (r !== radio) {
              opt.style.borderColor = 'var(--border-color)';
              opt.style.background = 'rgba(17, 24, 39, 0.4)';
            } else {
              opt.style.borderColor = 'var(--primary)';
              opt.style.background = 'rgba(37, 99, 235, 0.08)';
            }
          });
        }
      });
    });

    // Clear radios if typing custom room
    customRoomInput.addEventListener('input', () => {
      if (customRoomInput.value.trim() !== '') {
        roomRadios.forEach(radio => {
          radio.checked = false;
          const opt = radio.closest('.room-option');
          if (opt) {
            opt.style.borderColor = 'var(--border-color)';
            opt.style.background = 'rgba(17, 24, 39, 0.4)';
          }
        });
      }
    });
  }

  // Load rooms on start
  await loadRooms();

  // Form submission
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = displayNameInput.value.trim();
    const customRoom = customRoomInput.value.trim();
    
    // Get selected room ID
    let selectedRoomId = '';
    const roomRadios = document.querySelectorAll('input[name="room"]');
    roomRadios.forEach(radio => {
      if (radio.checked) {
        selectedRoomId = radio.value;
      }
    });

    // Validate Display Name
    const usernameError = window.OpenChat.validation.validateUsername(username);
    if (usernameError) {
      window.OpenChat.showToast(usernameError, 'error');
      displayNameInput.focus();
      return;
    }

    let finalRoomId = selectedRoomId;
    let finalRoomName = '';

    if (customRoom !== '') {
      // Validate Custom Room Name
      const roomError = window.OpenChat.validation.validateRoomName(customRoom);
      if (roomError) {
        window.OpenChat.showToast(roomError, 'error');
        customRoomInput.focus();
        return;
      }

      try {
        window.OpenChat.showToast('Creating new room...', 'success');
        // Call backend API to create new room
        const createdRoom = await window.OpenChatAPI.createRoom(customRoom);
        finalRoomId = createdRoom._id;
        finalRoomName = createdRoom.roomName;
      } catch (error) {
        window.OpenChat.showToast(error.message || 'Error creating room.', 'error');
        return;
      }
    } else {
      // Get room name from selected preset
      if (!selectedRoomId) {
        window.OpenChat.showToast('Please select a room or type a new one.', 'error');
        return;
      }
      const matched = fetchedRooms.find(r => r._id === selectedRoomId);
      if (matched) {
        finalRoomName = matched.roomName;
      }
    }

    // Success! Save details to sessionStorage
    const userSession = {
      username: username,
      room: finalRoomName,
      roomId: finalRoomId
    };
    
    window.OpenChat.session.set('openchat_user', userSession);
    window.OpenChat.showToast(`Entering room "${finalRoomName}"...`, 'success');

    // Redirect to chat page after a brief delay
    setTimeout(() => {
      window.location.href = 'chat.html';
    }, 800);
  });
});
