import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function Clients() {
  const { clients, addClient, updateClient } = useContext(AppContext);
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const openEditModal = (client) => {
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone || '');
    setNotes(client.notes || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do cliente é obrigatório.');
      return;
    }
    
    if (editingClient) {
      updateClient({
        ...editingClient,
        name,
        phone,
        notes,
      });
      Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
    } else {
      addClient({
        name,
        phone,
        notes,
      });
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
    }
    
    setName('');
    setPhone('');
    setNotes('');
    setEditingClient(null);
    setShowModal(false);
  };

  const closeModal = () => {
    setName('');
    setPhone('');
    setNotes('');
    setEditingClient(null);
    setShowModal(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.phone ? <Text style={styles.phone}><Icon name="call" size={12}/> {item.phone}</Text> : null}
      </View>
      <TouchableOpacity 
        style={styles.editBtn} 
        onPress={(e) => {
          e.stopPropagation();
          openEditModal(item);
        }}
      >
        <Icon name="create-outline" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clientes</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar clientes..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum cliente cadastrado.</Text>
          </View>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps='handled'
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo *</Text>
                  <TextInput style={styles.input} placeholder="Ex: Maria da Silva" value={name} onChangeText={setName} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Telefone / WhatsApp</Text>
                  <TextInput style={styles.input} placeholder="(00) 00000-0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Observações</Text>
                  <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline placeholder="Gosta de perfumes florais..." value={notes} onChangeText={setNotes} />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>{editingClient ? 'Atualizar' : 'Salvar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addButton: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  phone: { fontSize: 13, color: theme.colors.textLight, marginTop: 4 },
  editBtn: { padding: 8, marginLeft: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyText: { marginTop: 10, fontSize: 16, color: theme.colors.textLight },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 5 },
  input: { backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, height: 48, paddingHorizontal: 15, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, marginRight: 10, alignItems: 'center' },
  cancelBtnText: { color: theme.colors.textLight, fontWeight: 'bold', fontSize: 16 },
  saveBtn: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: theme.colors.primary, marginLeft: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
