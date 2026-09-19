import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageCode } from '../i18n/translations';
import { Globe, ChevronDown } from 'lucide-react-native';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef<View>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 50, right: 16, width: 110 });

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  const handlePress = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }

    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        const screenWidth = Dimensions.get('window').width;
        setMenuPosition({
          top: y + height + 3,
          right: Math.max(12, screenWidth - (x + width)),
          width: Math.max(width, 105),
        });
        setDropdownOpen(true);
      });
    } else {
      setDropdownOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef}
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.dropdownBox}
      >
        <Globe size={16} color="#059669" />
        <Text style={styles.dropdownText}>{currentLang.label}</Text>
        <ChevronDown size={14} color="#0f172a" />
      </TouchableOpacity>

      <Modal
        visible={dropdownOpen}
        transparent
        animationType="none"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setDropdownOpen(false)}>
          <View
            style={[
              styles.dropdownMenu,
              {
                top: menuPosition.top,
                right: menuPosition.right,
                minWidth: menuPosition.width,
              },
            ]}
          >
            {languages.map((lang) => {
              const selected = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  activeOpacity={0.8}
                  style={[styles.menuItem, selected && styles.menuItemSelected]}
                  onPress={() => {
                    setLanguage(lang.code);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.menuItemText, selected && styles.menuItemTextSelected]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  menuItemSelected: {
    backgroundColor: '#1d4ed8',
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  menuItemTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

