// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StatusBar,
//   Modal,
//   Platform,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { HotelCard } from "@/components/booking/hotel-card"; 
// import { BOOKING_COLORS, Hotel } from "@/constants/booking";
// import {
//   getAllRooms,
//   searchRooms,
//   getRoomsByHotelId,
//   RoomResponse,
// } from "@/apis/roomApi";

// interface FilterModalProps {
//   visible: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
//   onApply?: () => void;
//   onClearAll?: () => void;
// }

// const FilterModal: React.FC<FilterModalProps> = ({
//   visible,
//   onClose,
//   title,
//   children,
//   onApply,
//   onClearAll,
// }) => (
//   <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
//     <View style={styles.modalOverlay}>
//       <View style={styles.modalContent}>
//         <View style={styles.modalHeader}>
//           <Text style={styles.modalTitle}>{title}</Text>
//           <TouchableOpacity onPress={onClose}>
//             <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
//           </TouchableOpacity>
//         </View>
//         <ScrollView style={styles.modalBody}>{children}</ScrollView>
//         {(onApply || onClearAll) && (
//           <View style={styles.modalFooter}>
//             {onClearAll && (
//               <TouchableOpacity style={styles.clearButton} onPress={onClearAll}>
//                 <Text style={styles.clearButtonText}>Clear All</Text>
//               </TouchableOpacity>
//             )}
//             {onApply && (
//               <TouchableOpacity style={styles.applyButton} onPress={onApply}>
//                 <Text style={styles.applyButtonText}>Apply</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       </View>
//     </View>
//   </Modal>
// );

// export default function FilterRoomScreen(): React.JSX.Element {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();

//   const [allRooms, setAllRooms] = useState<RoomResponse[]>([]);
//   const [rooms, setRooms] = useState<Hotel[]>([]); // dùng lại kiểu Hotel để hiển thị dạng card
//   const [loading, setLoading] = useState(true);

//   const [sortModalVisible, setSortModalVisible] = useState(false);
//   const [hotelModalVisible, setHotelModalVisible] = useState(false);
//   const [priceModalVisible, setPriceModalVisible] = useState(false);

//   const [selectedSort, setSelectedSort] = useState("popularity");
//   const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
//   const [selectedPriceRange, setSelectedPriceRange] = useState("");

//   // --- Load toàn bộ phòng ---
//   useEffect(() => {
//     const fetchRooms = async () => {
//       try {
//         setLoading(true);
//         const data = await getAllRooms();
//         setAllRooms(data);
//         setRooms(mapRoomResponseToRoom(data));
//       } catch (err) {
//         console.error("Load rooms error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRooms();
//   }, []);

//   // --- Map dữ liệu RoomResponse -> Card model ---
//   const mapRoomResponseToRoom = useCallback((data: RoomResponse[]): Hotel[] => {
//     return data.map((item) => ({
//       id: item.roomId.toString(),
//       name: item.roomType,
//       location: item.hotelName || "",
//       price: item.price || 0,
//       rating: 0,
//       reviewCount: 0,
//       imageUrl:
//         (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : "") ||
//         "",
//       isFavorite: false,
//     }));
//   }, []);

//   // --- Lấy danh sách khách sạn (để lọc theo hotel) ---
//   const getHotelOptions = useCallback((): string[] => {
//     const hotels = new Set<string>();
//     allRooms.forEach((r) => r.hotelName && hotels.add(r.hotelName));
//     return Array.from(hotels).sort();
//   }, [allRooms]);

//   // --- Apply filters ---
//   const applyFilters = useCallback(async () => {
//     setLoading(true);
//     let filtered = [...allRooms];

//     // Lọc theo khách sạn
//     if (selectedHotels.length > 0) {
//       const hotelSet = new Set(selectedHotels.map((h) => h.trim().toLowerCase()));
//       filtered = filtered.filter(
//         (room) => room.hotelName && hotelSet.has(room.hotelName.trim().toLowerCase())
//       );
//     }

//     // Lọc theo giá (placeholder)
//     if (selectedPriceRange) {
//       filtered = filtered.filter(() => true);
//     }

//     // Sắp xếp
//     switch (selectedSort) {
//       case "price-low":
//         filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
//         break;
//       case "price-high":
//         filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
//         break;
//       default:
//         break;
//     }

//     setRooms(mapRoomResponseToRoom(filtered));
//     setLoading(false);
//   }, [allRooms, selectedHotels, selectedPriceRange, selectedSort, mapRoomResponseToRoom]);

//   const handleClearFilters = () => {
//     setSelectedHotels([]);
//     setSelectedPriceRange("");
//     setSelectedSort("popularity");
//     setRooms(mapRoomResponseToRoom(allRooms));
//   };

//   const sortOptions = [
//     { id: "popularity", label: "Phổ biến", icon: "grid-outline" },
//     { id: "price-low", label: "Giá: thấp đến cao", icon: "arrow-up-outline" },
//     { id: "price-high", label: "Giá: cao đến thấp", icon: "arrow-down-outline" },
//   ];

//   const hotelOptions = getHotelOptions();
//   const priceRanges = ["Liên hệ", "Tùy chọn", "Theo thỏa thuận"];

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor={BOOKING_COLORS.BACKGROUND} />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
//           <Ionicons name="arrow-back" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Tìm kiếm phòng</Text>
//         <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
//           <Ionicons name="close" size={24} color={BOOKING_COLORS.TEXT_PRIMARY} />
//         </TouchableOpacity>
//       </View>

//       {/* Filter Bar */}
//       <View style={styles.filterBar}>
//         <TouchableOpacity style={styles.filterButton} onPress={() => setSortModalVisible(true)}>
//           <Ionicons name="swap-vertical-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
//           <Text style={styles.filterButtonText}>Sắp xếp</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.filterButton} onPress={() => setHotelModalVisible(true)}>
//           <Text style={styles.filterButtonText}>Khách sạn</Text>
//           <Ionicons name="chevron-down-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.filterButton} onPress={() => setPriceModalVisible(true)}>
//           <Text style={styles.filterButtonText}>Giá</Text>
//           <Ionicons name="chevron-down-outline" size={16} color={BOOKING_COLORS.PRIMARY} />
//         </TouchableOpacity>
//       </View>

//       {/* Rooms List */}
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color={BOOKING_COLORS.PRIMARY} />
//             <Text style={styles.loadingText}>Đang tải...</Text>
//           </View>
//         ) : rooms.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>Không tìm thấy phòng</Text>
//           </View>
//         ) : (
//           <View style={styles.hotelsList}>
//             {rooms.map((room) => (
//               <HotelCard
//                 key={room.id}
//                 hotel={room}
//                 variant="vertical"
//                 onPress={() => router.push(`/room-detail/${room.id}`)}
//               />
//             ))}
//           </View>
//         )}
//       </ScrollView>

//       {/* Sort Modal */}
//       <FilterModal
//         visible={sortModalVisible}
//         onClose={() => setSortModalVisible(false)}
//         title="Sắp xếp theo"
//       >
//         {sortOptions.map((opt) => (
//           <TouchableOpacity
//             key={opt.id}
//             style={styles.optionItem}
//             onPress={() => {
//               setSelectedSort(opt.id);
//               setSortModalVisible(false);
//               setTimeout(applyFilters, 100);
//             }}
//           >
//             <Ionicons
//               name={opt.icon as any}
//               size={20}
//               color={
//                 selectedSort === opt.id
//                   ? BOOKING_COLORS.PRIMARY
//                   : BOOKING_COLORS.TEXT_SECONDARY
//               }
//             />
//             <Text
//               style={[
//                 styles.optionText,
//                 selectedSort === opt.id && styles.optionTextSelected,
//               ]}
//             >
//               {opt.label}
//             </Text>
//             {selectedSort === opt.id && (
//               <Ionicons name="checkmark" size={20} color={BOOKING_COLORS.PRIMARY} />
//             )}
//           </TouchableOpacity>
//         ))}
//       </FilterModal>

//       {/* Hotel (filter) Modal */}
//       <FilterModal
//         visible={hotelModalVisible}
//         onClose={() => setHotelModalVisible(false)}
//         title="Khách sạn"
//         onApply={() => {
//           setHotelModalVisible(false);
//           applyFilters();
//         }}
//         onClearAll={handleClearFilters}
//       >
//         {hotelOptions.length === 0 ? (
//           <Text style={styles.emptyText}>Chưa có khách sạn nào</Text>
//         ) : (
//           hotelOptions.map((name) => {
//             const isSelected = selectedHotels.includes(name);
//             return (
//               <TouchableOpacity
//                 key={name}
//                 style={styles.checkboxItem}
//                 onPress={() =>
//                   setSelectedHotels((prev) =>
//                     isSelected ? prev.filter((h) => h !== name) : [...prev, name]
//                   )
//                 }
//               >
//                 <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
//                   {isSelected && (
//                     <Ionicons
//                       name="checkmark"
//                       size={16}
//                       color={BOOKING_COLORS.BACKGROUND}
//                     />
//                   )}
//                 </View>
//                 <Text
//                   style={[
//                     styles.checkboxText,
//                     isSelected && styles.checkboxTextSelected,
//                   ]}
//                 >
//                   {name}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })
//         )}
//       </FilterModal>

//       {/* Price Modal */}
//       <FilterModal
//         visible={priceModalVisible}
//         onClose={() => setPriceModalVisible(false)}
//         title="Giá"
//         onApply={() => {
//           setPriceModalVisible(false);
//           applyFilters();
//         }}
//         onClearAll={() => setSelectedPriceRange("")}
//       >
//         {priceRanges.map((range) => {
//           const isSelected = selectedPriceRange === range;
//           return (
//             <TouchableOpacity
//               key={range}
//               style={styles.radioItem}
//               onPress={() => setSelectedPriceRange(range)}
//             >
//               <View style={styles.radioButton}>
//                 {isSelected && <View style={styles.radioButtonInner} />}
//               </View>
//               <Text
//                 style={[styles.radioText, isSelected && styles.radioTextSelected]}
//               >
//                 {range}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </FilterModal>
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: BOOKING_COLORS.BACKGROUND,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: BOOKING_COLORS.BACKGROUND,
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: BOOKING_COLORS.TEXT_PRIMARY,
//   },
//   filterBar: {
//     flexDirection: 'row',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: BOOKING_COLORS.BORDER,
//     gap: 12,
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
//   },
//   filterButtonText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: BOOKING_COLORS.PRIMARY,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   hotelsList: {
//     padding: 16,
//     gap: 16,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: BOOKING_COLORS.BACKGROUND,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '80%',
//     ...Platform.select({
//       android: {
//         elevation: 8,
//       },
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {
//           width: 0,
//           height: -4,
//         },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//       },
//     }),
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: BOOKING_COLORS.BORDER,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: BOOKING_COLORS.TEXT_PRIMARY,
//   },
//   modalBody: {
//     padding: 16,
//     maxHeight: 400,
//   },
//   modalFooter: {
//     flexDirection: 'row',
//     padding: 16,
//     gap: 12,
//     borderTopWidth: 1,
//     borderTopColor: BOOKING_COLORS.BORDER,
//   },
//   clearButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: BOOKING_COLORS.BACKGROUND,
//     borderWidth: 1,
//     borderColor: BOOKING_COLORS.PRIMARY,
//     alignItems: 'center',
//   },
//   clearButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: BOOKING_COLORS.PRIMARY,
//   },
//   loadingContainer: {
//     paddingVertical: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: BOOKING_COLORS.TEXT_SECONDARY,
//   },
//   emptyContainer: {
//     paddingVertical: 60,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: BOOKING_COLORS.TEXT_SECONDARY,
//   },
//   applyButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: BOOKING_COLORS.PRIMARY,
//     alignItems: 'center',
//   },
//   applyButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: BOOKING_COLORS.BACKGROUND,
//   },
//   optionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     gap: 12,
//   },
//   optionText: {
//     flex: 1,
//     fontSize: 16,
//     color: BOOKING_COLORS.TEXT_PRIMARY,
//   },
//   optionTextSelected: {
//     fontWeight: '600',
//     color: BOOKING_COLORS.PRIMARY,
//   },
//   checkboxItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     gap: 12,
//   },
//   checkbox: {
//     width: 24,
//     height: 24,
//     borderRadius: 4,
//     borderWidth: 2,
//     borderColor: BOOKING_COLORS.BORDER,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   checkboxSelected: {
//     backgroundColor: BOOKING_COLORS.PRIMARY,
//     borderColor: BOOKING_COLORS.PRIMARY,
//   },
//   checkboxText: {
//     flex: 1,
//     fontSize: 16,
//     color: BOOKING_COLORS.TEXT_PRIMARY,
//   },
//   checkboxTextSelected: {
//     fontWeight: '600',
//     color: BOOKING_COLORS.PRIMARY,
//   },
//   showMore: {
//     paddingVertical: 12,
//     marginTop: 8,
//   },
//   showMoreText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: BOOKING_COLORS.PRIMARY,
//   },
//   radioItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     gap: 12,
//   },
//   radioButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: BOOKING_COLORS.BORDER,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioButtonInner: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: BOOKING_COLORS.PRIMARY,
//   },
//   radioText: {
//     flex: 1,
//     fontSize: 16,
//     color: BOOKING_COLORS.TEXT_PRIMARY,
//   },
//   radioTextSelected: {
//     fontWeight: '600',
//     color: BOOKING_COLORS.PRIMARY,
//   },
//   priceRangeSection: {
//     marginTop: 24,
//     paddingTop: 24,
//     borderTopWidth: 1,
//     borderTopColor: BOOKING_COLORS.BORDER,
//   },
//   priceRangeTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: BOOKING_COLORS.TEXT_PRIMARY,
//     marginBottom: 16,
//   },
//   priceRangeContainer: {
//     gap: 12,
//   },
//   priceRangeValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: BOOKING_COLORS.PRIMARY,
//   },
//   priceSliderPlaceholder: {
//     height: 60,
//     backgroundColor: BOOKING_COLORS.CARD_BACKGROUND,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 8,
//   },
//   priceSliderText: {
//     fontSize: 14,
//     color: BOOKING_COLORS.TEXT_SECONDARY,
//   },
// });

// Temporary default export to fix warning
export default function FilterScreen() {
  return null;
}