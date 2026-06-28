// Common utility functions
const OpenChat = {
  // Session storage helpers
  session: {
    set(key, val) {
      sessionStorage.setItem(key, JSON.stringify(val));
    },
    get(key) {
      const val = sessionStorage.getItem(key);
      try {
        return val ? JSON.parse(val) : null;
      } catch (e) {
        return val;
      }
    },
    remove(key) {
      sessionStorage.removeItem(key);
    },
    clear() {
      sessionStorage.clear();
    }
  },

  // Form validation helpers
  validation: {
    validateUsername(name) {
      if (!name) return 'Display name is required.';
      const trimmed = name.trim();
      if (trimmed.length < 3 || trimmed.length > 20) {
        return 'Display name must be between 3 and 20 characters.';
      }
      return null;
    },
    validateRoomName(room) {
      if (!room) return 'Room name is required.';
      if (room.startsWith(' ') || room.endsWith(' ')) {
        return 'Room name cannot start or end with spaces.';
      }
      const trimmed = room.trim();
      if (trimmed.length < 3 || trimmed.length > 30) {
        return 'Room name must be between 3 and 30 characters.';
      }
      return null;
    }
  },

  // Date/time formatting helpers
  formatTime(dateInput) {
    const date = new Date(dateInput);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  },

  // Toast / alert helper
  showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add brief icon representation or content
    const icon = type === 'success' ? '✓' : '⚠';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Auto-remove toast
    setTimeout(() => {
      toast.style.animation = 'toast-out 0.2s ease forwards';
      toast.addEventListener('animationend', () => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      });
    }, 3000);
  }
};

// Add standard keyframe CSS for toast exit programmatically if not defined
const style = document.createElement('style');
style.textContent = `
  @keyframes toast-out {
    to {
      transform: translateY(-20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
window.OpenChat = OpenChat;
