// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { ScrollView } from 'react-native';


// const BASE_URL = 'http://192.168.10.7/fypProject';

// export default function ViewFaculty({ navigation }) {
//   const [teachers, setTeachers] = useState([]);
//   const [search, setSearch] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [refreshing, setRefreshing] = useState(false);
//   const pageSize = 10;

//   // 🔹 FETCH DATA
//   const fetchTeachers = async (pageNumber = 1) => {
//   if (pageNumber > totalPages) return;

//   try {
//     if (pageNumber === 1) setLoading(true);

//     const response = await fetch(
//       `${BASE_URL}/api/faculty/get_teachers?page=${pageNumber}&pageSize=${pageSize}`
//     );
//     const json = await response.json();

//     if (response.ok && json.data) {
//       let newData = json.data;

//       if (pageNumber !== 1) {
//         // append previous data
//         newData = [...teachers, ...json.data];

//         // 🔹 Remove duplicates by Id
//         const uniqueData = [];
//         const ids = new Set();
//         newData.forEach(item => {
//           if (!ids.has(item.Id)) {
//             ids.add(item.Id);
//             uniqueData.push(item);
//           }
//         });
//         newData = uniqueData;
//       }

//       setTeachers(newData);
//       setTotalPages(Math.ceil(json.total / pageSize));
//       setPage(pageNumber);
//     } else {
//       setTeachers([]);
//     }
//   } catch (error) {
//     console.log('NETWORK ERROR:', error);
//     setTeachers([]);
//   } finally {
//     setLoading(false);
//     setRefreshing(false);
//   }
// };
//  useEffect(() => {
//     fetchTeachers(1);
//   }, []);

//   // 🔹 SEARCH FILTER
//   const filteredData = teachers.filter(item =>
//     item.Name?.toLowerCase().includes(search.toLowerCase()) ||
//     item.Email?.toLowerCase().includes(search.toLowerCase()) ||
//     item.Phone?.includes(search)
//   );

//   // 🔹 CARD UI
//   const renderFaculty = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <View style={styles.avatar}>
//           <Text style={styles.avatarText}>{item.Name?.charAt(0)}</Text>
//         </View>
//         <Text style={styles.cardName}>{item.Name}</Text>
//       </View>

//       <View style={styles.cardBody}>
//         <View style={styles.infoRow}>
//           <View style={styles.iconCircle}>
//             <Ionicons name="mail-outline" size={18} color="#0A9F6C" />
//           </View>
//           <View>
//             <Text style={styles.label}>Email Address</Text>
//             <Text style={styles.value}>{item.Email}</Text>
//           </View>
//         </View>

//         <View style={styles.infoRow}>
//           <View style={styles.iconCircle}>
//             <Ionicons name="call-outline" size={18} color="#0A9F6C" />
//           </View>
//           <View>
//             <Text style={styles.label}>Phone Number</Text>
//             <Text style={styles.value}>{item.Phone}</Text>
//           </View>
//         </View>

//         <View style={styles.buttonRow}>
//           <TouchableOpacity style={styles.callBtn}>
//             <Ionicons name="call" size={18} color="#fff" />
//             <Text style={styles.callText}> Call</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.emailBtn}>
//             <Ionicons name="mail" size={18} color="#0A9F6C" />
//             <Text style={styles.emailText}> Email</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   // 🔹 LOAD MORE
//   const handleLoadMore = () => {
//     if (page < totalPages) {
//       fetchTeachers(page + 1);
//     }
//   };

//   // 🔹 PULL TO REFRESH
//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchTeachers(1);
//   };

//   return (
   
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//               <TouchableOpacity onPress={() => navigation.goBack()}>
//                 <Text style={styles.back}>{'<'}</Text>
//               </TouchableOpacity>
//               <Text style={styles.headerTitle}>Faculty Details</Text>
//               <View style={{ width: 24 }} />
//             </View>
           
           
//       <View style={styles.searchBox}>
//         <Ionicons name="search" size={18} color="#999" />
//         <TextInput
//           placeholder="Search by name, email or phone..."
//           placeholderTextColor="#999"
//           style={styles.searchInput}
//           value={search}
//           onChangeText={setSearch}
//         />
//       </View>
 

//       {loading && page === 1 ? (
//         <ActivityIndicator
//           size="large"
//           color="#0A9F6C"
//           style={{ marginTop: 40 }}
//         />
//       ) : (
//         <FlatList
//           data={filteredData}
//           renderItem={renderFaculty}
//           keyExtractor={(item, index) => `${item.Id}_${index}`}
//           showsVerticalScrollIndicator={false}
//           onEndReached={handleLoadMore}
//           onEndReachedThreshold={0.5}
//           refreshing={refreshing}
//           onRefresh={handleRefresh}
//           ListEmptyComponent={
//             <Text style={{ textAlign: 'center', marginTop: 40 }}>
//               No faculty found
//             </Text>
//           }
//         />
//       )}
//     </SafeAreaView>
    
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F4F6F8',
//     paddingHorizontal: 16,
//   },
//   header: {
//     backgroundColor: '#0B8F5A',
//     padding: 18,
//     borderRadius: 18,
//     marginBottom: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   headerTitle: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   back: {
//     color: '#fff',
//     fontSize: 26,
//     fontWeight: '700',
//   },

//    heading: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#0A9F6C',
//     marginVertical: 12,
//   },
//   searchBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     marginBottom: 16,
//     height: 45,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     marginBottom: 16,
//     overflow: 'hidden',
//     elevation: 3,
//   },
//   cardHeader: {
//     backgroundColor: '#0A9F6C',
//     padding: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     color: '#0A9F6C',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   cardName: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   cardBody: {
//     padding: 14,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   iconCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#E6F6F0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   label: {
//     fontSize: 12,
//     color: '#777',
//   },
//   value: {
//     fontSize: 14,
//     color: '#111',
//     fontWeight: '500',
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   callBtn: {
//     flex: 1,
//     backgroundColor: '#0A9F6C',
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginRight: 8,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   callText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   emailBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#0A9F6C',
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginLeft: 8,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emailText: {
//     color: '#0A9F6C',
//     fontWeight: '600',
//   },
// });
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../../config/Api';

export default function ViewFaculty({ navigation }) {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  const fetchTeachers = async (pageNumber = 1) => {
    if (pageNumber > totalPages) return;

    try {
      if (pageNumber === 1) setLoading(true);

      const response = await fetch(
        `${BASE_URL}/faculty/get_teachers?page=${pageNumber}&pageSize=${pageSize}`
      );
      const json = await response.json();

      if (response.ok && json.data) {
        let newData =
          pageNumber === 1 ? json.data : [...teachers, ...json.data];

        const uniqueData = [];
        const ids = new Set();
        newData.forEach(item => {
          if (!ids.has(item.Id)) {
            ids.add(item.Id);
            uniqueData.push(item);
          }
        });

        setTeachers(uniqueData);
        setTotalPages(Math.ceil(json.total / pageSize));
        setPage(pageNumber);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.log('NETWORK ERROR:', error);
      setTeachers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeachers(1);
  }, []);

  const filteredData = teachers.filter(item =>
    item.Name?.toLowerCase().includes(search.toLowerCase()) ||
    item.Email?.toLowerCase().includes(search.toLowerCase()) ||
    item.Phone?.includes(search)
  );

  const renderFaculty = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.Name?.charAt(0)}
          </Text>
        </View>
        <Text style={styles.cardName}>{item.Name}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={18} color="#0A9F6C" />
          </View>
          <View>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>{item.Email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="call-outline" size={18} color="#0A9F6C" />
          </View>
          <View>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{item.Phone}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          {/* <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${item.Phone}`)}
          >
            <Ionicons name="call-outline" size={18} color="#fff" />
            <Text style={styles.callText}>Call</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
  style={styles.callBtn}
  onPress={() => {
    const cleanNumber = item.Phone
      ? item.Phone.replace(/[^0-9+]/g, '')
      : '';

    if (cleanNumber) {
      Linking.openURL(`tel:${cleanNumber}`);
    } else {
      console.log('Invalid phone number');
    }
  }}
>
  <Ionicons name="call-outline" size={18} color="#fff" />
  <Text style={styles.callText}>Call</Text>
</TouchableOpacity>


          <TouchableOpacity
            style={styles.emailBtn}
            onPress={() => Linking.openURL(`mailto:${item.Email}`)}
          >
            <Ionicons name="mail-outline" size={18} color="#0A9F6C" />
            <Text style={styles.emailText}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      fetchTeachers(page + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeachers(1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <FlatList
        data={filteredData}
        renderItem={renderFaculty}
        keyExtractor={(item) => `${item.Id}`}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <>
            {/* <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle2}>Faculty</Text>
              <View style={{ width: 26 }} />
            </View>
 */}
 <View style={styles.header}>
             <View style={{ width: 24 }} />
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={26} color="#fff"  />
              </TouchableOpacity>
             <Text style={styles.headerTitle}>faculty</Text>
              </View>

            <Text style={styles.headerTitle3}>Faculty Detail</Text>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#999" />
              <TextInput
                placeholder="Search by name, email or phone..."
                placeholderTextColor="#999"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {loading && page === 1 && (
              <ActivityIndicator
                size="large"
                color="#0A9F6C"
                style={{ marginVertical: 20 }}
              />
            )}
          </>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>
              No faculty found
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0B8F5A',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: 'Column',
     justifyContent: 'flex-start',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  backButton: {
  position: 'absolute',   // Icon ko parent ke relative position ke hisaab se place kare
  left: 10,               // Left edge se 10px dur
  top: '50%',             // Vertically center karne ke liye
  transform: [{ translateY: -13 }], // Icon height ka half (26/2 = 13) adjust kare
  padding: 10,            // Touch area badi ho
  zIndex: 1,              // Ensure ke upar show ho
}
,
  headerTitle2: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle3: {
    color: '#0B8F5A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    elevation: 4,
  },
  cardHeader: {
    backgroundColor: '#0A9F6C',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#0A9F6C',
    fontWeight: 'bold',
    fontSize: 20,
  },
  cardName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F6F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    fontSize: 12,
    color: '#777',
  },
  value: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A9F6C',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 10,
    
  },
  callText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0A9F6C',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  emailText: {
    color: '#0A9F6C',
    marginLeft: 6,
    fontWeight: '600',
  },
});
