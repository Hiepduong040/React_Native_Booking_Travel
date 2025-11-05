import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to booking screen when index is accessed
    router.replace('/(tabs)/booking');
  }, []);

  return null;
}
