document.addEventListener('DOMContentLoaded', () => {
  const joinForm = document.getElementById('joinForm');
  const displayNameInput = document.getElementById('displayName');
  const customRoomInput = document.getElementById('customRoom');
  const roomRadios = document.querySelectorAll('input[name="room"]');

  // Handle custom room input interaction: deselect radio buttons if user starts typing a custom room
  customRoomInput.addEventListener('input', () => {
    if (customRoomInput.value.trim() !== '') {
      roomRadios.forEach(radio => {
        radio.checked = false;
        // Remove active class styling from room cards if needed
        radio.closest('.room-option').style.borderColor = 'var(--border-color)';
        radio.closest('.room-option').style.background = 'rgba(17, 24, 39, 0.4)';
      });
    }
  });

  // Handle radio button interaction: clear custom room input if a preset room is clicked
  roomRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        customRoomInput.value = '';
        // Reset border colors on other options
        roomRadios.forEach(r => {
          const option = r.closest('.room-option');
          if (r !== radio) {
            option.style.borderColor = 'var(--border-color)';
            option.style.background = 'rgba(17, 24, 39, 0.4)';
          } else {
            option.style.borderColor = 'var(--primary)';
            option.style.background = 'rgba(37, 99, 235, 0.08)';
          }
        });
      }
    });
  });

  // Form submission
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = displayNameInput.value;
    const customRoom = customRoomInput.value;
    
    // Determine selected preset room
    let selectedRoom = '';
    roomRadios.forEach(radio => {
      if (radio.checked) {
        selectedRoom = radio.value;
      }
    });

    // Determine final room choice
    const finalRoom = customRoom.trim() !== '' ? customRoom.trim() : selectedRoom;

    // Validate Display Name
    const usernameError = window.OpenChat.validation.validateUsername(username);
    if (usernameError) {
      window.OpenChat.showToast(usernameError, 'error');
      displayNameInput.focus();
      return;
    }

    // Validate Room Choice
    if (!finalRoom) {
      window.OpenChat.showToast('Please select an existing room or create a new one.', 'error');
      return;
    }

    // Validate Custom Room Name if specified
    if (customRoom.trim() !== '') {
      const roomError = window.OpenChat.validation.validateRoomName(customRoom);
      if (roomError) {
        window.OpenChat.showToast(roomError, 'error');
        customRoomInput.focus();
        return;
      }
    }

    // Success! Save details to sessionStorage
    const userSession = {
      username: username.trim(),
      room: finalRoom
    };
    
    window.OpenChat.session.set('openchat_user', userSession);
    window.OpenChat.showToast(`Joining room "${finalRoom}"...`, 'success');

    // Redirect to chat page after a brief delay for toast visibility
    setTimeout(() => {
      window.location.href = 'chat.html';
    }, 800);
  });
});
