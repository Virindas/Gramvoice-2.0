import { useColorScheme as useRNColorScheme } from 'react-native';

export function useTheme() {
  const scheme = useRNColorScheme();
  return {
    background: '#020617',
    text: '#ffffff',
    primary: '#10b981',
    isDark: scheme !== 'light',
  };
}
