import { toast } from 'react-hot-toast';

const audioCache: { [key: string]: HTMLAudioElement } = {};

export const playSound = async (type: 'success' | 'error' | 'notification') => {
  try {
    const soundMap = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      notification: '/sounds/notification.mp3'
    };

    const soundUrl = soundMap[type];
    
    // If sound is already cached, use it
    if (audioCache[type]) {
      await audioCache[type].play().catch(() => {
        // If playing fails, remove from cache to try reloading next time
        delete audioCache[type];
      });
      return;
    }

    // Create new audio with timeout
    const audio = new Audio(soundUrl);
    
    // Set a timeout for loading the audio
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Audio load timeout')), 3000);
    });

    // Try to load the audio with timeout
    try {
      await Promise.race([
        new Promise((resolve) => {
          audio.oncanplaythrough = resolve;
          audio.load();
        }),
        timeoutPromise
      ]);

      // If loaded successfully, cache it and play
      audioCache[type] = audio;
      await audio.play();
    } catch (error) {
      console.warn(`Failed to load sound: ${type}`, error);
      // Don't show error toast to user - sound is non-critical
    }
  } catch (error) {
    console.warn('Error playing sound:', error);
    // Fail silently - sound is non-critical
  }
};

// Preload sounds
export const preloadSounds = () => {
  ['success', 'error', 'notification'].forEach(type => {
    playSound(type as 'success' | 'error' | 'notification')
      .catch(() => console.warn(`Failed to preload sound: ${type}`));
  });
};