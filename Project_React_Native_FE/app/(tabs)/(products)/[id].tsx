// app/product/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../../services/product';
import { theme } from '../../../constants/theme';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: product!.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{product!.name}</Text>
        <Text style={styles.price}>${product!.price}</Text>
        <Text style={styles.category}>Category: {product!.category}</Text>
        <Text style={styles.eco}>Eco Score: {product!.ecoScore}/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  price: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary, marginTop: 8 },
  category: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 8 },
  eco: { fontSize: 16, color: '#4CAF50', marginTop: 8, fontWeight: '600' },
});