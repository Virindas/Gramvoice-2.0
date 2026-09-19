import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Keyboard, Send, Square, RotateCcw, CheckCircle2, ArrowRight, FileText } from "lucide-react";
import { Shell } from "@/components/layout";
import { Alert, Button, Card, Select, TextArea, StatusBadge, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";

export default function NewComplaint() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"voice" | "text">("voice");

  const categories = [
    { value: "Water", label: t("complaint.cat.water") },
    { value: "Electricity", label: t("complaint.cat.electricity") },
    { value: "Sanitation", label: t("complaint.cat.sanitation") },
    { value: "Infrastructure", label: t("complaint.cat.infra") },
    { value: "Health & Agriculture", label: t("complaint.cat.health_agri") },
    { value: "General", label: t("complaint.cat.general") },
  ];

  // Category selection state
  const [category, setCategory] = useState("Water");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  // Form state
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const valid = (mode === "voice" ? audioBlob !== null || text.trim().length >= 10 : text.trim().length >= 10) && !isRecording;

  async function startRecording() {
    setError("");
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev: number) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError("Microphone access denied or audio device not available.");
    }
  }

  function stopRecording() {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const finalComplaintText = text.trim() || (audioBlob ? t("complaint.voice_submitted") : "No text details provided");
      let saved: any;

      if (mode === "voice" && audioBlob) {
        const res = await api.createVoiceComplaint(audioBlob, finalComplaintText, category);
        saved = res.complaint || res;
      } else {
        const res = await api.createComplaint({
          textDescription: finalComplaintText,
          complaint_text: finalComplaintText,
          category: category,
          inputMethod: mode === "voice" ? "Voice" : "Manual",
        });
        saved = res.complaint || res;
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
    setAudioBlob(null);
    setAudioUrl(null);
    setText("");
    setRecordTimer(0);
    setMode("voice");
    setError("");
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Shell
      portal="citizen"
      title={t("raiseTitle")}
      subtitle={t("raiseSubtitle")}
    >
      {submittedComplaint ? (
        /* Post-Submission Confirmation View with Instant Playback */
        <Card elevated className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center py-2">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 shadow-soft">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">{t("complaint.success_toast")}</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Your grievance has been lodged directly into the Panchayat portal.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-muted/60 p-4 border border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t("citizen.ref_id")}</p>
              <p className="font-mono text-base font-black text-primary">#{submittedComplaint.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t("citizen.category_tag")}</p>
              <p className="text-sm font-bold text-foreground">{submittedComplaint.category || category}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t("citizen.status_tag")}</p>
              <div className="mt-0.5">
                <StatusBadge status={submittedComplaint.status || "Under Review"} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{t("citizen.date_filed_tag")}</p>
              <p className="text-sm font-bold text-foreground">
                {new Date(submittedComplaint.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Immediate Audio Playback for Voice Submissions */}
          {(submittedComplaint.voice_recording_url || audioUrl || submittedComplaint.type === "voice") && (
            <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 space-y-2">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">
                {t("record.playback.title")} (Your Voice Submission)
              </p>
              <audio
                src={audioUrl || `/api/complaints/${submittedComplaint.id}/audio`}
                controls
                className="w-full rounded-xl"
              />
            </div>
          )}

          {/* Description summary */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
              <FileText className="size-4" /> Complaint Summary
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {submittedComplaint.transcript || submittedComplaint.complaint_text || text || "Voice recording submitted"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              full
              onClick={() => navigate("/citizen/complaints")}
              icon={<ArrowRight className="size-4" />}
            >
              Track Complaints
            </Button>
            <Button
              full
              variant="outline"
              onClick={resetForm}
              icon={<RotateCcw className="size-4" />}
            >
              Register Another Complaint
            </Button>
          </div>
        </Card>
      ) : (
        /* Standard Complaint Entry Form */
        <>
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5">
            {(
              [
                { key: "voice", label: t("complaint.tab.voice"), icon: Mic },
                { key: "text", label: t("complaint.tab.text"), icon: Keyboard },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setMode(item.key);
                  if (isRecording) stopRecording();
                }}
                className={cn(
                  "flex min-h-12 items-center justify-center gap-2 rounded-xl text-base font-bold transition-colors",
                  mode === item.key ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
                )}
              >
                <item.icon className="size-5" /> {item.label}
              </button>
            ))}
          </div>

          <Card elevated className="space-y-5">
            {error && <Alert tone="error">{error}</Alert>}

            {/* Complaint Category Dropdown */}
            <div className="space-y-1.5">
              <Select
                label={t("complaint.cat_label")}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categories}
              />
            </div>

            {/* Voice Recording Control */}
            {mode === "voice" && (
              <div className="rounded-2xl border border-dashed border-border bg-primary-soft/30 p-6 text-center">
                <div className="mx-auto flex flex-col items-center justify-center">
                  {!isRecording && !audioUrl && (
                    <>
                      <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft animate-pulse">
                        <Mic className="size-8" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold">{t("record.voice.tap")}</h3>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t("record.voice.hint")}</p>
                      <Button className="mt-4" onClick={startRecording} icon={<Mic className="size-5" />}>
                        {t("record.voice.start")}
                      </Button>
                    </>
                  )}

                  {isRecording && (
                    <>
                      <div className="flex size-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-soft animate-bounce">
                        <Mic className="size-8" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-destructive">{t("record.voice.recording")}</h3>
                      <p className="mt-1 font-mono text-2xl font-black text-foreground">{formatTime(recordTimer)}</p>
                      <button
                        onClick={stopRecording}
                        className="mt-4 flex items-center gap-2 rounded-xl bg-destructive px-6 py-3 text-base font-bold text-destructive-foreground transition-transform hover:scale-105"
                      >
                        <Square className="size-5 fill-current" /> {t("record.voice.stop")}
                      </button>
                    </>
                  )}

                  {audioUrl && !isRecording && (
                    <div className="w-full space-y-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase">{t("record.playback.title")}</p>
                      <audio src={audioUrl} controls className="w-full rounded-xl" />
                      <div className="flex justify-center pt-1">
                        <Button variant="outline" onClick={startRecording} icon={<RotateCcw className="size-4" />}>
                          {t("record.voice.rerecord")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional/Required Complaint Text Area */}
            <TextArea
              label={
                mode === "voice"
                  ? t("complaint.notes_label_voice")
                  : t("complaint.notes_label_text")
              }
              rows={5}
              value={text}
              placeholder={mode === "voice" ? t("complaint.placeholder_voice") : t("complaint.placeholder_text")}
              onChange={(e) => setText(e.target.value)}
              hint={mode === "text" ? t("complaint.min_chars", { count: text.trim().length }) : undefined}
              error={mode === "text" && text.length > 0 && text.trim().length < 10 ? t("complaint.detail_err") : ""}
            />

            <Button full loading={loading} disabled={!valid} onClick={submit} icon={<Send className="size-5" />}>
              {t("complaint.submit_btn")}
            </Button>
          </Card>
        </>
      )}
    </Shell>
  );
}
