import React, { useContext, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView, Image } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import * as DocumentPicker from 'expo-document-picker';
import { uploadToCloudinary } from '../config/cloudinary';

export default function Finance() {
  const { sales, purchases, invoices, prizeDeliveries, addInvoice, updateInvoice, updateSale, deleteSale } = useContext(AppContext);
  const [filterType, setFilterType] = useState('all'); // 'all', 'in', 'out', 'invoices'

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invDesc, setInvDesc] = useState('');
  const [invValue, setInvValue] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invInstallments, setInvInstallments] = useState('1');
  const [invType, setInvType] = useState('out'); // 'in' = Receber, 'out' = Pagar
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceiptUri, setCurrentReceiptUri] = useState(null);

  const transactions = useMemo(() => {
    const incomes = sales.map(s => ({
      ...s,
      type: 'in',
      title: `Venda - ${s.client}${s.paymentType === 'prazo' ? ' (A Prazo)' : ' (À Vista)'}`,
      amount: s.total,
    }));
    
    const expenses = purchases.map(p => ({
      ...p,
      type: 'out',
      title: `Compra - ${p.supplier}`,
      amount: p.total,
    }));

    const deliveries = prizeDeliveries.map(d => ({
      ...d,
      type: 'out',
      title: `Prêmio Entregue - ${d.winnerName}`,
      amount: d.total,
    }));

    return [...incomes, ...expenses, ...deliveries].sort((a, b) => b.id - a.id);
  }, [sales, purchases, prizeDeliveries]);

  const filteredData = useMemo(() => {
    if (filterType === 'invoices') {
      return invoices.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      });
    }
    return transactions.filter(t => {
      if (filterType === 'all') return true;
      return t.type === filterType;
    });
  }, [transactions, invoices, filterType]);

  // Saldo real: Vendas à vista + Faturas pagas (Entrada) - Faturas pagas (Saída) - Compras - Prêmios
  const totalSalesCash = sales.filter(s => s.paymentType !== 'prazo').reduce((sum, s) => sum + s.total, 0);
  const totalInvoicesPaidIn = invoices.filter(i => i.status === 'paid' && i.type !== 'out').reduce((sum, i) => sum + i.value, 0);
  const totalIn = totalSalesCash + totalInvoicesPaidIn;
  
  const totalOutPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalOutDeliveries = prizeDeliveries.reduce((sum, d) => sum + d.total, 0);
  const totalInvoicesPaidOut = invoices.filter(i => i.status === 'paid' && i.type === 'out').reduce((sum, i) => sum + i.value, 0);
  const totalOut = totalOutPurchases + totalOutDeliveries + totalInvoicesPaidOut;
  const balance = totalIn - totalOut;

  const handleDateChange = (text) => {
    let cleaned = ('' + text).replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    let match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (match) {
      let result = match[1];
      if (match[2]) result += '/' + match[2];
      if (match[3]) result += '/' + match[3];
      setInvDueDate(result);
    } else {
      setInvDueDate(text);
    }
  };

  const handleAddInvoice = () => {
    if (!invDesc || !invValue || !invDueDate) {
      if (Platform.OS === 'web') window.alert('Preencha todos os campos da fatura.');
      else Alert.alert('Erro', 'Preencha todos os campos da fatura.');
      return;
    }

    const value = parseFloat(invValue.replace(',', '.'));
    const installments = parseInt(invInstallments, 10);

    if (isNaN(installments) || installments < 1) {
      if (Platform.OS === 'web') window.alert('Parcelas inválidas.');
      else Alert.alert('Erro', 'Parcelas inválidas.');
      return;
    }

    const installmentValue = value / installments;
    let baseDate;
    if (invDueDate.includes('/')) {
      const [day, month, year] = invDueDate.split('/');
      baseDate = new Date(year, month - 1, day);
    } else if (invDueDate.includes('-')) {
      const [year, month, day] = invDueDate.split('-');
      baseDate = new Date(year, month - 1, day);
    } else {
      if (Platform.OS === 'web') window.alert('Formato de data inválido. Use DD/MM/YYYY');
      else Alert.alert('Erro', 'Formato de data inválido. Use DD/MM/YYYY');
      return;
    }

    if (isNaN(baseDate.getTime())) {
      if (Platform.OS === 'web') window.alert('Data inválida.');
      else Alert.alert('Erro', 'Data inválida.');
      return;
    }

    for (let i = 0; i < installments; i++) {
      const currentDueDate = new Date(baseDate);
      currentDueDate.setMonth(baseDate.getMonth() + i);
      
      const yr = currentDueDate.getFullYear();
      const mo = String(currentDueDate.getMonth() + 1).padStart(2, '0');
      const da = String(currentDueDate.getDate()).padStart(2, '0');
      const newDateString = `${yr}-${mo}-${da}`;

      addInvoice({
        description: installments > 1 ? `${invDesc} (${i + 1}/${installments})` : invDesc,
        value: installmentValue,
        dueDate: newDateString,
        status: 'pending',
        type: invType
      });
    }

    setInvDesc('');
    setInvValue('');
    setInvDueDate('');
    setInvInstallments('1');
    setShowInvoiceModal(false);
    
    if (Platform.OS === 'web') window.alert('Fatura(s) adicionada(s).');
    else Alert.alert('Sucesso', 'Fatura(s) adicionada(s).');
  };

  const handlePayInvoice = (invoice) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Marcar a fatura "${invoice.description}" como paga? O valor entrará no Saldo Atual.`)) {
        updateInvoice({ ...invoice, status: 'paid' });
      }
    } else {
      Alert.alert(
        'Dar Baixa',
        `Marcar a fatura "${invoice.description}" como paga? O valor entrará no Saldo Atual.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Confirmar', 
            onPress: () => {
              updateInvoice({ ...invoice, status: 'paid' });
            }
          }
        ]
      );
    }
  };

  const handleAttachReceipt = async (item) => {
    if (item.type !== 'in') return;
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setIsUploadingReceipt(true);
        try {
          const cloudinaryUrl = await uploadToCloudinary(uri);
          // The item in transactions is a copy of sale. We find the original sale by id
          const originalSale = sales.find(s => s.id === item.id);
          if (originalSale) {
            updateSale({ ...originalSale, receiptUri: cloudinaryUrl });
            Alert.alert('Sucesso', 'Comprovante enviado para Cloudinary e anexado à venda!');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Erro', 'Falha ao fazer upload do comprovante. Tente novamente.');
          // Não salva URI local como fallback pois blob URLs expiram
        } finally {
          setIsUploadingReceipt(false);
        }
      }
    } catch (err) {
      console.log('Error picking receipt', err);
      setIsUploadingReceipt(false);
    }
  };

  const handleDeleteSale = (item) => {
    if (item.type !== 'in') return;
    
    if (Platform.OS === 'web') {
      if (window.confirm(`Tem certeza que deseja excluir esta venda? O estoque dos produtos será restaurado.`)) {
        deleteSale(item.id);
        window.alert('Venda excluída com sucesso.');
      }
    } else {
      Alert.alert(
        'Excluir Venda',
        'Tem certeza que deseja excluir esta venda? O estoque dos produtos será restaurado.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: () => {
            deleteSale(item.id);
            Alert.alert('Sucesso', 'Venda excluída com sucesso.');
          }}
        ]
      );
    }
  };

  const handleViewReceipt = (uri) => {
    if (!uri) {
      Alert.alert('Aviso', 'Nenhum comprovante disponível.');
      return;
    }
    setCurrentReceiptUri(uri);
    setShowReceiptModal(true);
  };

  const renderTransactionItem = ({ item }) => {
    if (filterType === 'invoices') {
      const isPaid = item.status === 'paid';
      const now = new Date();
      const diffDays = item.dueDate ? Math.ceil((new Date(item.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const isLate = !isPaid && diffDays < 0;

      return (
        <View style={[styles.transactionCard, { borderLeftWidth: 4, borderLeftColor: isPaid ? theme.colors.success : isLate ? theme.colors.danger : theme.colors.warning }]}>
          <View style={styles.invoiceInfo}>
            <Text style={styles.transactionTitle}>{item.description}</Text>
            <Text style={styles.transactionDate}>Vencimento: {item.dueDate && typeof item.dueDate === 'string' ? item.dueDate.split('-').reverse().join('/') : 'S/ Data'}</Text>
            <Text style={[styles.transactionAmount, { color: item.type === 'out' ? theme.colors.danger : theme.colors.success, marginTop: 4 }]}>
              {item.type === 'out' ? '-' : '+'} R$ {item.value ? item.value.toFixed(2) : '0.00'}
            </Text>
          </View>
          <View style={styles.transactionAmountContainer}>
            {isPaid ? (
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>PAGO</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.payButton} onPress={() => handlePayInvoice(item)}>
                <Icon name="checkmark" size={18} color="#fff" />
                <Text style={styles.payButtonText}>Baixa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    const isIn = item.type === 'in';
    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionIconContainer}>
          <Icon 
            name={isIn ? "arrow-up-circle" : "arrow-down-circle"} 
            size={36} 
            color={isIn ? theme.colors.success : theme.colors.danger} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
          {item.receiptUri ? (
            <TouchableOpacity onPress={() => handleViewReceipt(item.receiptUri)} style={styles.attachBtn}>
              <Icon name="eye" size={14} color={theme.colors.primary} />
              <Text style={styles.attachBtnText}>Ver Comprovante</Text>
            </TouchableOpacity>
          ) : isIn ? (
            isUploadingReceipt ? (
              <View style={styles.attachBtn}>
                <ActivityIndicator size={12} color={theme.colors.secondary} />
                <Text style={styles.attachBtnText}>Enviando...</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => handleAttachReceipt(item)} style={styles.attachBtn}>
                <Icon name="attach" size={14} color={theme.colors.secondary} />
                <Text style={styles.attachBtnText}>Anexar Comprovante</Text>
              </TouchableOpacity>
            )
          ) : null}
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text style={[styles.transactionAmount, { color: isIn ? theme.colors.success : theme.colors.danger }]}>
            {isIn ? '+' : '-'} R$ {item.amount.toFixed(2)}
          </Text>
          {isIn && (
            <TouchableOpacity onPress={() => handleDeleteSale(item)} style={styles.deleteBtn}>
              <Icon name="trash-outline" size={16} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Financeiro</Text>
        {filterType === 'invoices' && (
          <TouchableOpacity onPress={() => setShowInvoiceModal(true)} style={styles.addInvoiceBtn}>
            <Icon name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {filterType !== 'invoices' && (
        <View style={styles.summaryContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Atual (Recebido)</Text>
            <Text style={styles.balanceValue}>R$ {balance.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.summaryBox, { borderLeftColor: theme.colors.success }]}>
              <Text style={styles.summaryLabel}>Entradas Reais</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>R$ {totalIn.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryBox, { borderLeftColor: theme.colors.danger }]}>
              <Text style={styles.summaryLabel}>Saídas</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>R$ {totalOut.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, filterType === 'all' && styles.activeTab]} onPress={() => setFilterType('all')}>
          <Text style={[styles.tabText, filterType === 'all' && styles.activeTabText]}>Tudo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, filterType === 'in' && styles.activeTab]} onPress={() => setFilterType('in')}>
          <Text style={[styles.tabText, filterType === 'in' && styles.activeTabText]}>Vendas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, filterType === 'out' && styles.activeTab]} onPress={() => setFilterType('out')}>
          <Text style={[styles.tabText, filterType === 'out' && styles.activeTabText]}>Compras</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, filterType === 'invoices' && styles.activeTab]} onPress={() => setFilterType('invoices')}>
          <Text style={[styles.tabText, filterType === 'invoices' && styles.activeTabText]}>Faturas</Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt-outline" size={60} color={theme.colors.border} />
            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
          </View>
        }
      />

      {/* Modal Nova Fatura */}
      <Modal visible={showInvoiceModal} transparent animationType="fade">
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
                <Text style={styles.modalTitle}>Nova Fatura</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tipo de Fatura</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, backgroundColor: invType === 'in' ? theme.colors.success : '#f0f0f0', borderRadius: 8, marginRight: 5, alignItems: 'center' }}
                      onPress={() => setInvType('in')}
                    >
                      <Text style={{ color: invType === 'in' ? '#fff' : '#333', fontWeight: 'bold' }}>Recebimento (+)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, backgroundColor: invType === 'out' ? theme.colors.danger : '#f0f0f0', borderRadius: 8, marginLeft: 5, alignItems: 'center' }}
                      onPress={() => setInvType('out')}
                    >
                      <Text style={{ color: invType === 'out' ? '#fff' : '#333', fontWeight: 'bold' }}>Pagamento (-)</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Descrição</Text>
                  <TextInput style={styles.input} placeholder="Ex: Conta de Luz" value={invDesc} onChangeText={setInvDesc} />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Valor (R$)</Text>
                    <TextInput style={styles.input} placeholder="0,00" keyboardType="numeric" value={invValue} onChangeText={setInvValue} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Parcelas</Text>
                    <TextInput style={styles.input} placeholder="Ex: 1" keyboardType="numeric" value={invInstallments} onChangeText={setInvInstallments} />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Vencimento (1ª Parcela)</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="DD/MM/YYYY" 
                    value={invDueDate} 
                    onChangeText={handleDateChange} 
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowInvoiceModal(false)}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleAddInvoice}>
                    <Text style={styles.saveBtnText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para visualizar comprovante */}
      <Modal visible={showReceiptModal} transparent animationType="fade">
        <View style={styles.receiptModalOverlay}>
          <View style={styles.receiptModalContent}>
            <View style={styles.receiptModalHeader}>
              <Text style={styles.receiptModalTitle}>Comprovante</Text>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                <Icon name="close" size={28} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.receiptImageContainer}>
              {currentReceiptUri ? (
                <Image 
                  source={{ uri: currentReceiptUri }} 
                  style={styles.receiptImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.receiptPlaceholder}>
                  <Icon name="image-outline" size={60} color={theme.colors.textLight} />
                  <Text style={styles.receiptPlaceholderText}>Nenhum comprovante disponível</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={styles.receiptCloseBtn} 
              onPress={() => setShowReceiptModal(false)}
            >
              <Text style={styles.receiptCloseBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addInvoiceBtn: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: { marginHorizontal: 20, marginTop: -40, marginBottom: 20 },
  balanceCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 15,
  },
  balanceLabel: { fontSize: 14, color: theme.colors.textLight, marginBottom: 5 },
  balanceValue: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryBox: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryLabel: { fontSize: 12, color: theme.colors.textLight, marginBottom: 5 },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  tabsScroll: { flexGrow: 0, marginBottom: 15 },
  tabsContainer: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E8ECEF',
    marginRight: 10,
  },
  activeTab: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 14, color: theme.colors.textLight, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionIconContainer: { marginRight: 15 },
  transactionInfo: { flex: 1 },
  invoiceInfo: { flex: 1 },
  transactionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  transactionDate: { fontSize: 12, color: theme.colors.textLight },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EEF3FF',
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  attachBtnText: {
    fontSize: 11,
    color: theme.colors.secondary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deleteBtn: {
    marginTop: 4,
    padding: 4,
  },
  transactionAmountContainer: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  // Receipt Modal
  receiptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  receiptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  receiptModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  receiptImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f5f5f5',
  },
  receiptImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    minHeight: 300,
  },
  receiptPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  receiptPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.textLight,
  },
  receiptCloseBtn: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    alignItems: 'center',
  },
  receiptCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 15, fontSize: 16, color: theme.colors.textLight, fontWeight: 'bold' },
  payButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.success,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  payButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  paidBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  paidBadgeText: { color: theme.colors.success, fontSize: 12, fontWeight: 'bold' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textLight, marginBottom: 5 },
  input: { backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, height: 48, paddingHorizontal: 15, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, marginRight: 10, alignItems: 'center' },
  cancelBtnText: { color: theme.colors.textLight, fontWeight: 'bold', fontSize: 16 },
  saveBtn: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: theme.colors.primary, marginLeft: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
