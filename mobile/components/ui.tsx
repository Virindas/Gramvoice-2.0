import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal as RNModal,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Check, Info, AlertTriangle, AlertCircle, X, ChevronDown, Sparkles } from "lucide-react-native";
import type { Status } from "@/lib/mock-data";

export const theme = {
  colors: {
    background: "#FAF7F2",
    foreground: "#1F2937",
    card: "#FFFFFF",
    cardForeground: "#1F2937",
    primary: "#1D7A73",
    primaryForeground: "#FFFFFF",
    primarySoft: "#E6F2F1",
    secondary: "#E0A526",
    secondaryForeground: "#3B2B04",
    secondarySoft: "#FDF6E3",
    muted: "#F3EFE6",
    mutedForeground: "#6B7280",
    border: "#E5DEC9",
    input: "#E2DBC7",
    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",
    success: "#16A34A",
    successForeground: "#FFFFFF",
    // Statuses
    review: "#2563EB",
    reviewSoft: "#EFF6FF",
    progress: "#D97706",
    progressSoft: "#FFFBEB",
    completed: "#16A34A",
    completedSoft: "#F0FDF4",
    rejected: "#DC2626",
    rejectedSoft: "#FEF2F2",
    // Admin
    admin: "#4C1D95",
    adminForeground: "#FFFFFF",
    adminSoft: "#F3E8FF",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};

/* ----------------------------- Button ----------------------------- */

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "admin" | "ghost";
  size?: "md" | "lg";
  full?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  full,
  loading,
  disabled,
  icon,
  onClick,
}: ButtonProps) {
  const isDanger = variant === "danger";
  const isOutline = variant === "outline";
  const isAdmin = variant === "admin";
  const isGhost = variant === "ghost";

  let bg = theme.colors.primary;
  let textCol = theme.colors.primaryForeground;
  let borderCol = "transparent";

  if (variant === "secondary") {
    bg = theme.colors.secondary;
    textCol = theme.colors.secondaryForeground;
  } else if (isOutline) {
    bg = "transparent";
    textCol = theme.colors.foreground;
    borderCol = theme.colors.border;
  } else if (isDanger) {
    bg = theme.colors.destructive;
    textCol = theme.colors.destructiveForeground;
  } else if (isAdmin) {
    bg = theme.colors.admin;
    textCol = theme.colors.adminForeground;
  } else if (isGhost) {
    bg = "transparent";
    textCol = theme.colors.mutedForeground;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onClick}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor: borderCol,
          borderWidth: isOutline ? 2 : 0,
          minHeight: size === "lg" ? 52 : 44,
          opacity: disabled || loading ? 0.5 : 1,
          alignSelf: full ? "stretch" : "flex-start",
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textCol} />
      ) : (
        <View style={styles.buttonInner}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={[styles.buttonText, { color: textCol }]}>{children}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ----------------------------- Card ----------------------------- */

export function Card({
  children,
  elevated,
  style,
}: {
  children: React.ReactNode;
  elevated?: boolean;
  style?: any;
}) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ----------------------------- Input ----------------------------- */

export function Input({
  label,
  error,
  hint,
  value,
  onChangeText,
  onChange,
  placeholder,
  type,
  inputMode,
  rightElement,
  secureTextEntry,
  ...props
}: any) {
  const handleTextChange = (text: string) => {
    if (onChangeText) onChangeText(text);
    if (onChange) onChange({ target: { value: text } });
  };

  const isSecure = secureTextEntry ?? type === "password";

  return (
    <View style={styles.fieldContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={{ position: "relative", justifyContent: "center" }}>
        <TextInput
          style={[
            styles.input,
            rightElement && { paddingRight: 44 },
            !!error && styles.inputError,
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedForeground}
          secureTextEntry={isSecure}
          keyboardType={inputMode === "numeric" ? "number-pad" : "default"}
          {...props}
        />
        {rightElement && (
          <View style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}>
            {rightElement}
          </View>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

/* ----------------------------- TextArea ----------------------------- */

export function TextArea({
  label,
  error,
  hint,
  value,
  onChangeText,
  onChange,
  placeholder,
  rows = 4,
  ...props
}: any) {
  const handleTextChange = (text: string) => {
    if (onChangeText) onChangeText(text);
    if (onChange) onChange({ target: { value: text } });
  };

  return (
    <View style={styles.fieldContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { height: rows * 24, textAlignVertical: "top", paddingTop: 12 },
          !!error && styles.inputError,
        ]}
        multiline
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

/* ----------------------------- Select ----------------------------- */

export function Select({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder,
}: any) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = typeof options[0] === "object"
    ? options.find((o: any) => o.value === value)?.label
    : value;

  return (
    <View style={styles.fieldContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, styles.selectTrigger, !!error && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: value ? theme.colors.foreground : theme.colors.mutedForeground }}>
          {selectedOption || placeholder || "Select an option"}
        </Text>
        <ChevronDown size={20} color={theme.colors.mutedForeground} />
      </TouchableOpacity>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}

      <RNModal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <ScrollView style={{ maxHeight: 300 }}>
              {options.map((opt: any) => {
                const val = typeof opt === "object" ? opt.value : opt;
                const lbl = typeof opt === "object" ? opt.label : opt;
                return (
                  <TouchableOpacity
                    key={val}
                    style={styles.selectItem}
                    onPress={() => {
                      if (onChange) onChange({ target: { value: val } });
                      setModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 16, color: theme.colors.foreground }}>{lbl}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </RNModal>
    </View>
  );
}

/* ----------------------------- StatusBadge ----------------------------- */

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; text: string }> = {
    "Under Review": { bg: theme.colors.reviewSoft, text: theme.colors.review },
    "In Progress": { bg: theme.colors.progressSoft, text: theme.colors.progress },
    Completed: { bg: theme.colors.completedSoft, text: theme.colors.completed },
    Rejected: { bg: theme.colors.rejectedSoft, text: theme.colors.rejected },
  };
  const conf = map[status] ?? { bg: theme.colors.muted, text: theme.colors.mutedForeground };

  return (
    <View style={[styles.badge, { backgroundColor: conf.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: conf.text }]} />
      <Text style={[styles.badgeText, { color: conf.text }]}>{status}</Text>
    </View>
  );
}

/* ----------------------------- PinInput ----------------------------- */

export function PinInput({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
}) {
  const inputRefs = React.useRef<any[]>([]);
  const digits = [0, 1, 2, 3].map((i) => value[i] ?? "");

  const handleDigitChange = (i: number, text: string) => {
    const clean = text.replace(/\D/g, "").slice(-1);
    const next = digits.map((x, idx) => (idx === i ? clean : x)).join("");
    onChange(next.replace(/\s/g, ""));
    if (clean && i < 3) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyPress = (i: number, key: string) => {
    if (key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  return (
    <View style={styles.fieldContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-start" }}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            style={[
              styles.input,
              {
                width: 52,
                height: 56,
                fontSize: 22,
                fontWeight: "700",
                textAlign: "center",
                paddingHorizontal: 0,
              },
              !!error && styles.inputError,
            ]}
            maxLength={1}
            keyboardType="number-pad"
            secureTextEntry
            value={d}
            onChangeText={(t) => handleDigitChange(i, t)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
          />
        ))}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

/* ----------------------------- Alert ----------------------------- */

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  let bg = theme.colors.primarySoft;
  let fg = theme.colors.primary;
  let IconComp = Info;

  if (tone === "success") {
    bg = theme.colors.completedSoft;
    fg = theme.colors.completed;
    IconComp = Check;
  } else if (tone === "error") {
    bg = theme.colors.rejectedSoft;
    fg = theme.colors.rejected;
    IconComp = AlertCircle;
  }

  return (
    <View style={[styles.alertContainer, { backgroundColor: bg }]}>
      <IconComp size={20} color={fg} style={{ marginRight: 8 }} />
      <Text style={[styles.alertText, { color: fg }]}>{children}</Text>
    </View>
  );
}

/* ----------------------------- Modal ----------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <RNModal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView>{children}</ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

/* ----------------------------- EmptyState ----------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.emptyContainer}>
      {icon && <View style={{ marginBottom: 12 }}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDesc}>{description}</Text>
      {action && <View style={{ marginTop: 16 }}>{action}</View>}
    </View>
  );
}

/* ----------------------------- VoiceRecorderControl ----------------------------- */

export function VoiceRecorderControl({
  phase,
  setPhase,
  onTranscript,
}: {
  phase: "idle" | "recording" | "transcribing" | "done";
  setPhase: (p: "idle" | "recording" | "transcribing" | "done") => void;
  onTranscript: (t: string) => void;
}) {
  return (
    <View style={styles.voiceControlContainer}>
      <Text style={{ textAlign: "center", color: theme.colors.mutedForeground, marginBottom: 16 }}>
        Tap the microphone and speak your complaint
      </Text>
      <TouchableOpacity
        style={[
          styles.voiceBtn,
          phase === "recording" && { backgroundColor: theme.colors.destructive },
        ]}
        onPress={() => {
          if (phase === "idle" || phase === "done") {
            setPhase("recording");
          } else if (phase === "recording") {
            setPhase("transcribing");
            setTimeout(() => {
              onTranscript("Street light opposite the Mariamman temple has been dark for 4 days.");
              setPhase("done");
            }, 1200);
          }
        }}
      >
        <Sparkles size={32} color={theme.colors.primaryForeground} />
      </TouchableOpacity>
      <Text style={{ textAlign: "center", fontWeight: "bold", marginTop: 12 }}>
        {phase === "idle"
          ? "Tap to record"
          : phase === "recording"
          ? "Recording... Tap to stop"
          : phase === "transcribing"
          ? "Transcribing..."
          : "Voice recorded! Edit transcript below if needed."}
      </Text>
    </View>
  );
}

/* ----------------------------- ChatBubble ----------------------------- */

export function ChatBubble({ from, text }: { from: "bot" | "user"; text: string }) {
  const isBot = from === "bot";
  return (
    <View
      style={[
        styles.chatBubble,
        isBot ? styles.botBubble : styles.userBubble,
      ]}
    >
      <Text style={[styles.chatText, { color: isBot ? theme.colors.foreground : theme.colors.primaryForeground }]}>
        {text}
      </Text>
    </View>
  );
}

/* ----------------------------- LanguageSwitcher ----------------------------- */

import { LanguageSwitcher as LanguageSwitcherComp } from "./LanguageSwitcher";

export function LanguageSwitcher() {
  return <LanguageSwitcherComp />;
}

/* ----------------------------- LoadingSpinner ----------------------------- */

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label && <Text style={{ marginTop: 12, color: theme.colors.mutedForeground }}>{label}</Text>}
    </View>
  );
}

export function useToast() {
  return (msg: string) => {
    // Basic toast simulation for React Native
    console.log("[TOAST]:", msg);
  };
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    shadowColor: "#1D7A73",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.foreground,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: theme.colors.foreground,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  selectTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: theme.colors.mutedForeground,
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.foreground,
  },
  selectItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  emptyDesc: {
    fontSize: 14,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginTop: 4,
  },
  voiceControlContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.lg,
  },
  voiceBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBubble: {
    padding: 12,
    borderRadius: theme.radius.lg,
    maxWidth: "80%",
    marginBottom: 8,
  },
  botBubble: {
    backgroundColor: theme.colors.muted,
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-end",
  },
  chatText: {
    fontSize: 15,
  },
});
