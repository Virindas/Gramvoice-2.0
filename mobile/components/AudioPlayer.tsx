import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Play, Pause, Volume2 } from "lucide-react-native";
import { theme } from "./ui";
import { API_BASE } from "@/lib/api";

interface AudioPlayerProps {
  uri: string;
  title?: string;
  onPlaybackComplete?: () => void;
}

export function AudioPlayer({ uri, title, onPlaybackComplete }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isMountedRef = useRef(true);

  // Normalize URI if relative
  const resolvedUri = uri.startsWith("/") ? `${API_BASE}${uri}` : uri;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [resolvedUri]);

  async function loadAudio() {
    if (soundRef.current) return soundRef.current;
    setIsLoading(true);
    setError(null);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: resolvedUri },
        { shouldPlay: false, progressUpdateIntervalMillis: 200 },
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      if (isMountedRef.current) {
        setSound(newSound);
        if (status.isLoaded && status.durationMillis) {
          setDurationMillis(status.durationMillis);
        }
      }
      return newSound;
    } catch (err: any) {
      console.error("AudioPlayer load error:", err);
      if (isMountedRef.current) {
        setError("Unable to play audio");
      }
      return null;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }

  function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!isMountedRef.current) return;

    if (!status.isLoaded) {
      if (status.error) {
        setError("Playback error");
        setIsPlaying(false);
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setPositionMillis(status.positionMillis);
    if (status.durationMillis) {
      setDurationMillis(status.durationMillis);
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPositionMillis(0);
      if (onPlaybackComplete) onPlaybackComplete();
    }
  }

  async function togglePlay() {
    try {
      let currentSound = soundRef.current;
      if (!currentSound) {
        currentSound = await loadAudio();
        if (!currentSound) return;
      }

      if (isPlaying) {
        await currentSound.pauseAsync();
      } else {
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded && status.positionMillis >= (status.durationMillis || 0) && (status.durationMillis || 0) > 0) {
          await currentSound.replayAsync();
        } else {
          await currentSound.playAsync();
        }
      }
    } catch (err: any) {
      console.error("togglePlay error:", err);
      setError("Playback failed");
    }
  }

  async function handleSeek(fraction: number) {
    if (!soundRef.current || durationMillis <= 0) return;
    try {
      const targetMillis = Math.floor(fraction * durationMillis);
      await soundRef.current.setPositionAsync(targetMillis);
      setPositionMillis(targetMillis);
    } catch (err) {
      console.error("Seek error:", err);
    }
  }

  const formatTime = (millis: number) => {
    if (!millis || isNaN(millis)) return "00:00";
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = durationMillis > 0 ? Math.min(100, Math.max(0, (positionMillis / durationMillis) * 100)) : 0;

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.titleRow}>
          <Volume2 size={16} color={theme.colors.primary} />
          <Text style={styles.titleText}>{title}</Text>
        </View>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={togglePlay}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : isPlaying ? (
              <Pause size={18} color="#FFFFFF" />
            ) : (
              <Play size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <View style={styles.sliderContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.track}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                const width = 180;
                const fraction = Math.max(0, Math.min(1, locationX / width));
                handleSeek(fraction);
              }}
            >
              <View style={[styles.progress, { width: `${progressPercent}%` }]} />
            </TouchableOpacity>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(positionMillis)}</Text>
              <Text style={styles.timeText}>
                {durationMillis > 0 ? formatTime(durationMillis) : "--:--"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginVertical: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: "center",
  },
  track: {
    height: 8,
    backgroundColor: "#dcfce7",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: theme.colors.mutedForeground,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.destructive,
    fontWeight: "600",
  },
});
