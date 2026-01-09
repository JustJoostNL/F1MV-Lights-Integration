let currentAudio: HTMLAudioElement | null = null;

interface PlayAudioOptions {
  filePath: string;
  volume?: number;
}

/**
 * Play an audio file
 * @param filePath - The path to the audio file
 * @param volume - Volume level (0-1), defaults to 1
 */
export function playAudioFile(filePath: string, volume: number = 1): void {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    const audio = new Audio(`file://${filePath}`);
    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    audio.addEventListener("ended", () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    });

    currentAudio = audio;
  } catch (error) {
    console.error("Error creating audio element:", error);
  }
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function initializeAudioPlayer(): () => void {
  const unsubscribe = window.f1mvli.utils.on(
    "f1mvli:utils:play-audio",
    (data: PlayAudioOptions) => {
      if (data.filePath) {
        playAudioFile(data.filePath, data.volume);
      }
    },
  );

  return unsubscribe;
}
