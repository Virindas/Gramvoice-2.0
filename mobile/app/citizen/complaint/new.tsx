import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { Mic, Keyboard, Send, Square, RotateCcw, CheckCircle2, ArrowRight, FileText } from "lucide-react-native";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Select, TextArea, StatusBadge, theme, useToast } from "@/components/ui";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useApi } from "@/lib/store";
import { useLanguage } from "@/i18n/LanguageContext";

export default function NewComplaintScreen() {
  const api = useApi();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [category, setCategory] = useState("Water");
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "Water", label: t("complaint.cat.water") },
    { value: "Electricity", label: t("complaint.cat.electricity") },
    { value: "Sanitation", label: t("complaint.cat.sanitation") },
    { value: "Infrastructure", label: t("complaint.cat.infra") },
    { value: "Health & Agriculture", label: t("complaint.cat.health_agri") },
    { value: "General", label: t("complaint.cat.general") },
  ];

  const valid = (mode === "voice" ? !!audioUri || text.trim().length >= 10 : text.trim().length >= 10) && !isRecording;

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    setError("");
    setAudioUri(null);
    setAudioBlob(null);

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone permission is required to record voice complaints.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordTimer(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to start recording:", err);
      setError("Microphone access denied or audio device not available.");
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      recordingRef.current = null;

      if (uri) {
        setAudioUri(uri);
        if (Platform.OS === "web") {
          try {
            const resp = await fetch(uri);
            const blob = await resp.blob();
            setAudioBlob(blob);
          } catch (e) {
            console.error("Web blob extraction error:", e);
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to stop recording:", err);
      setError("Failed to process audio recording.");
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const finalComplaintText = text.trim() || (audioUri ? t("complaint.voice_submitted") : "No text details provided");
      let saved: any;

      if (mode === "voice" && (audioUri || audioBlob)) {
        let uploadPayload: any;
        if (Platform.OS === "web" && audioBlob) {
          uploadPayload = audioBlob;
        } else {
          uploadPayload = {
            uri: audioUri!,
            name: `voice-${Date.now()}.m4a`,
            type: "audio/m4a",
          };
        }
        saved = await api.createVoiceComplaint(uploadPayload, finalComplaintText, category);
      } else {
        saved = await api.createComplaint({
          body: finalComplaintText,
          category,
          mode: "text",
        });
      }

      toast(t("complaint.success_toast"));
      setSubmittedComplaint(saved);
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setSubmittedComplaint(null);
    setAudioUri(null);
    setAudioBlob(null);
    setText("");
    setRecordTimer(0);
    setMode("voice");
    setError("");
  }

  return (
    <Shell
      portal="citizen"
      title={t("raiseTitle")}
      subtitle={t("raiseSubtitle")}
    >
      {submittedComplaint ? (
        /* Post-Submission Confirmation View with Instant Playback */
        <Card elevated style={{ gap: 16 }}>
          <View style={styles.confirmHeader}>
            <View style={styles.confirmSuccessBadge}>
              <CheckCircle2 size={32} color="#059669" />
            </View>
            <Text style={styles.confirmTitle}>{t("complaint.success_toast")}</Text>
            <Text style={styles.confirmSubtitle}>
              Your grievance has been submitted to the Panchayat administration.
            </Text>
          </View>

          <View style={styles.ticketDetailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("citizen.ref_ticket_id")}</Text>
              <Text style={styles.ticketIdText}>#{submittedComplaint.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("citizen.category_tag")}</Text>
              <Text style={styles.detailValue}>{submittedComplaint.category || category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("citizen.initial_status_tag")}</Text>
              <StatusBadge status={submittedComplaint.status || "Under Review"} />
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("citizen.date_submitted_tag")}</Text>
              <Text style={styles.detailValue}>
                {new Date(submittedComplaint.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Immediate Voice Recording Playback Confirmation */}
          {submittedComplaint.mode === "voice" || submittedComplaint.voice_recording_url || audioUri ? (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.playbackSectionTitle}>
                {t("record.playback.title")} (Submitted Recording)
              </Text>
              <AudioPlayer
                uri={submittedComplaint.voice_recording_url || audioUri || ""}
                title="Your Voice Submission"
              />
            </View>
          ) : null}

          {/* Text Summary Confirmation */}
          <View style={styles.submittedTextBox}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <FileText size={16} color={theme.colors.mutedForeground} />
              <Text style={styles.submittedTextLabel}>Complaint Details</Text>
            </View>
            <Text style={styles.submittedTextContent}>
              {submittedComplaint.body || text || "Voice recording submitted"}
            </Text>
          </View>

          <View style={{ gap: 10, marginTop: 8 }}>
            <Button
              full
              onClick={() => router.push("/citizen/complaints" as any)}
              icon={<ArrowRight size={18} color="#FFFFFF" />}
            >
              Track Complaints
            </Button>
            <Button
              full
              variant="outline"
              onClick={resetForm}
              icon={<RotateCcw size={16} color={theme.colors.foreground} />}
            >
              Register Another Complaint
            </Button>
          </View>
        </Card>
      ) : (
        /* Standard Complaint Entry Form */
        <>
          <View style={styles.tabContainer}>
            {(
              [
                { key: "voice", label: t("complaint.tab.voice"), icon: Mic },
                { key: "text", label: t("complaint.tab.text"), icon: Keyboard },
              ] as const
            ).map((tabItem) => {
              const active = mode === tabItem.key;
              const IconComp = tabItem.icon;
              return (
                <TouchableOpacity
                  key={tabItem.key}
                  style={[styles.tabBtn, active && styles.activeTabBtn]}
                  onPress={() => {
                    setMode(tabItem.key);
                    if (isRecording) stopRecording();
                  }}
                >
                  <IconComp size={20} color={active ? theme.colors.primary : theme.colors.mutedForeground} />
                  <Text style={[styles.tabLabel, { color: active ? theme.colors.primary : theme.colors.mutedForeground }]}>
                    {tabItem.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card elevated style={{ gap: 16 }}>
            {error ? <Alert tone="error">{error}</Alert> : null}

            {/* Category Dropdown */}
            <Select
              label={t("complaint.cat_label")}
              value={category}
              onChange={(val: string) => setCategory(val)}
              options={categories}
            />

            {/* Voice Recording Control */}
            {mode === "voice" && (
              <View style={styles.voiceContainer}>
                {!isRecording && !audioUri && (
                  <View style={styles.voiceInner}>
                    <View style={styles.micCircle}>
                      <Mic size={32} color={theme.colors.primaryForeground} />
                    </View>
                    <Text style={styles.voiceHeading}>{t("record.voice.tap")}</Text>
                    <Text style={styles.voiceSubtitle}>{t("record.voice.hint")}</Text>
                    <TouchableOpacity
                      style={styles.startBtn}
                      activeOpacity={0.8}
                      onPress={startRecording}
                    >
                      <Mic size={18} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.startBtnText}>{t("record.voice.start")}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isRecording && (
                  <View style={styles.voiceInner}>
                    <View style={styles.micCircleRecording}>
                      <Mic size={32} color="#ffffff" />
                    </View>
                    <Text style={styles.recordingHeading}>{t("record.voice.recording")}</Text>
                    <Text style={styles.timerText}>{formatTime(recordTimer)}</Text>
                    <TouchableOpacity
                      style={styles.stopBtn}
                      activeOpacity={0.8}
                      onPress={stopRecording}
                    >
                      <Square size={16} color="#ffffff" fill="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.stopBtnText}>{t("record.voice.stop")}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {audioUri && !isRecording && (
                  <View style={styles.playbackContainer}>
                    <Text style={styles.playbackTitle}>{t("record.playback.title")}</Text>
                    <AudioPlayer uri={audioUri} title="Recorded Audio Preview" />
                    <View style={{ alignItems: "center", marginTop: 12 }}>
                      <TouchableOpacity
                        style={styles.rerecordBtn}
                        activeOpacity={0.7}
                        onPress={startRecording}
                      >
                        <RotateCcw size={16} color={theme.colors.foreground} style={{ marginRight: 6 }} />
                        <Text style={styles.rerecordBtnText}>{t("record.voice.rerecord")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            <TextArea
              label={mode === "voice" ? t("complaint.notes_label_voice") : t("complaint.notes_label_text")}
              rows={5}
              value={text}
              placeholder={mode === "voice" ? t("complaint.placeholder_voice") : t("complaint.placeholder_text")}
              onChangeText={setText}
              hint={mode === "text" ? t("complaint.min_chars", { count: text.trim().length }) : undefined}
              error={mode === "text" && text.length > 0 && text.trim().length < 10 ? t("complaint.detail_err") : ""}
            />

            <Button
              full
              loading={loading}
              disabled={!valid}
              onClick={submit}
              icon={<Send size={20} color={theme.colors.primaryForeground} />}
            >
              {t("complaint.submit_btn")}
            </Button>
          </Card>
        </>
      )}
    </Shell>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.lg,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  activeTabBtn: {
    backgroundColor: theme.colors.card,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  voiceContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#99f6e4",
    backgroundColor: "rgba(20, 184, 166, 0.08)",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  voiceInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  micCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  voiceHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
    marginTop: 16,
    textAlign: "center",
  },
  voiceSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 260,
  },
  startBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  startBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  micCircleRecording: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.destructive,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  recordingHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.destructive,
    marginTop: 16,
    textAlign: "center",
  },
  timerText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.foreground,
    marginTop: 6,
    marginBottom: 4,
  },
  stopBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.destructive,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stopBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  playbackContainer: {
    width: "100%",
  },
  playbackTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  audioPlayerSim: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  waveformPlaceholder: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 32,
  },
  waveBar: {
    width: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  audioDuration: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
  },
  rerecordBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rerecordBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  confirmHeader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  confirmSuccessBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.foreground,
    textAlign: "center",
  },
  confirmSubtitle: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 4,
  },
  ticketDetailsBox: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.lg,
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.mutedForeground,
  },
  ticketIdText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  playbackSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  submittedTextBox: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  submittedTextLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    textTransform: "uppercase",
  },
  submittedTextContent: {
    fontSize: 14,
    color: theme.colors.foreground,
    lineHeight: 20,
  },
});
