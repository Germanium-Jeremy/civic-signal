import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font'
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'EBGaramond': require('../assets/fonts/EB_Garamond/static/EBGaramond-Regular.ttf'),
  })

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name='(auth)' />
      <StatusBar style="auto" />
    </Stack>
  );
}
