import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Easing, Alert } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function Dashboard() {
  const { products, sales, purchases, consortiums, draws, invoices, prizeDeliveries, logout, currentUserEmail } = useContext(AppContext);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  }, []);

  const now = new Date();
  const currentMonthStr = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYearStr = now.getFullYear().toString();

  const isCurrentMonth = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return false;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return parts[1] === currentMonthStr && parts[2] === currentYearStr;
    }
    return false;
  };

  const currentMonthSales = sales.filter(s => isCurrentMonth(s.date) && s.paymentType !== 'prazo');
  const currentMonthPaidInvoices = invoices.filter(i => i.status === 'paid' && i.type !== 'out' && i.dueDate && isCurrentMonth(new Date(i.dueDate).toLocaleDateString('pt-BR')));
  const currentMonthPaidInvoicesOut = invoices.filter(i => i.status === 'paid' && i.type === 'out' && i.dueDate && isCurrentMonth(new Date(i.dueDate).toLocaleDateString('pt-BR')));
  
  const currentMonthPurchases = purchases.filter(p => isCurrentMonth(p.date));
  const currentMonthDeliveries = prizeDeliveries.filter(d => isCurrentMonth(d.date));

  const totalSalesCash = currentMonthSales.reduce((sum, s) => sum + s.total, 0);
  const totalInvoicesPaidIn = currentMonthPaidInvoices.reduce((sum, i) => sum + i.value, 0);
  const totalSales = totalSalesCash + totalInvoicesPaidIn;
  
  const totalPurchases = currentMonthPurchases.reduce((sum, p) => sum + p.total, 0);
  const totalDeliveries = currentMonthDeliveries.reduce((sum, d) => sum + d.total, 0);
  const totalInvoicesPaidOut = currentMonthPaidInvoicesOut.reduce((sum, i) => sum + i.value, 0);
  const profit = totalSales - (totalPurchases + totalDeliveries + totalInvoicesPaidOut);

  // Calculando Saldo Geral em Caixa (Todo o Histórico)
  const allTimeSalesCash = sales.filter(s => s.paymentType !== 'prazo').reduce((sum, s) => sum + s.total, 0);
  const allTimeInvoicesPaidIn = invoices.filter(i => i.status === 'paid' && i.type !== 'out').reduce((sum, i) => sum + i.value, 0);
  const allTimeInvoicesPaidOut = invoices.filter(i => i.status === 'paid' && i.type === 'out').reduce((sum, i) => sum + i.value, 0);
  const allTimePurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const allTimeDeliveries = prizeDeliveries.reduce((sum, d) => sum + d.total, 0);
  
  const cashBalance = (allTimeSalesCash + allTimeInvoicesPaidIn) - (allTimePurchases + allTimeDeliveries + allTimeInvoicesPaidOut);
  
  const lowStock = products.filter(p => p.stock < 10).length;

  const activeConsortium = consortiums[0];
  let nextDrawText = 'Nenhum ativo';
  let nextDrawSub = '-';
  if (activeConsortium) {
    const hasDrawnThisMonth = draws.some(d => d.consortiumId === activeConsortium.id && d.month === now.getMonth() + 1);
    nextDrawText = hasDrawnThisMonth ? 'Já realizado' : 'Pendente este mês';
    nextDrawSub = activeConsortium.name;
  }

  // Calc Notifications Count
  let notificationsCount = 0;
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const today = now.getDate();

  invoices.forEach(i => {
    if (i.status === 'pending') {
      const diffDays = Math.ceil((new Date(i.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) notificationsCount++;
    }
  });

  consortiums.forEach(c => {
    const drawDay = c.drawDay || 15;
    if (drawDay - today <= 3) {
      const unpaid = c.participants.filter(p => !p.hasWon && (!p.payments || !p.payments.some(pay => pay.month === currentMonth && pay.year === currentYear)));
      if (unpaid.length > 0) notificationsCount++;
    }
  });

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header Curve */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.logoText}>L'OCCITANE</Text>
              <Text style={styles.subLogoText}>AU BRÉSIL</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ position: 'relative', marginRight: 15 }}>
                <Icon name="notifications-outline" size={24} color={theme.colors.secondary} />
                {notificationsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notificationsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
                <Icon name="person-circle-outline" size={28} color={theme.colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.greeting}>Olá, Consultora!</Text>
          <Text style={styles.welcomeMessage}>{currentUserEmail ? currentUserEmail : 'Bem-vinda de volta'}</Text>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Main Balance Card */}
          <View style={styles.mainBalanceCard}>
            <Text style={styles.mainBalanceLabel}>Saldo em Caixa</Text>
            <Text style={styles.mainBalanceValue}>R$ {cashBalance.toFixed(2)}</Text>
            <Text style={styles.mainBalanceSub}>Disponível para compras/retiradas</Text>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Vendas do mês</Text>
              <Text style={styles.metricValue}>R$ {totalSales.toFixed(2)}</Text>
              <Text style={[styles.metricChange, { color: theme.colors.success }]}>{currentMonthSales.length} vendas</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Compras do mês</Text>
              <Text style={styles.metricValue}>R$ {totalPurchases.toFixed(2)}</Text>
              <Text style={[styles.metricChange, { color: theme.colors.danger }]}>{currentMonthPurchases.length} compras</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Lucro Líquido</Text>
              <Text style={[styles.metricValue, { color: theme.colors.primary }]}>R$ {profit.toFixed(2)}</Text>
              {totalDeliveries > 0 ? (
                 <Text style={[styles.metricChange, { color: theme.colors.danger }]}>- R$ {totalDeliveries.toFixed(2)} em prêmios</Text>
              ) : (
                 <Text style={[styles.metricChange, { color: profit >= 0 ? theme.colors.success : theme.colors.danger }]}>Este mês</Text>
              )}
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Produtos em estoque</Text>
              <Text style={styles.metricValue}>{products.reduce((sum, p) => sum + p.stock, 0)}</Text>
              <Text style={[styles.metricChange, { color: theme.colors.textLight }]}>{products.length} itens</Text>
            </View>
          </View>

          {/* Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Icon name="cube-outline" size={20} color={theme.colors.secondary} style={{marginBottom: 5}} />
              <Text style={styles.infoLabel}>Estoque baixo</Text>
              <Text style={styles.infoValue}>{lowStock} produtos</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="gift-outline" size={20} color={theme.colors.secondary} style={{marginBottom: 5}} />
              <Text style={styles.infoLabel}>Próximo sorteio</Text>
              <Text style={styles.infoValue}>{nextDrawText}</Text>
              <Text style={styles.infoSub}>{nextDrawSub}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('NewSale')}>
              <View style={styles.iconCircle}>
                <Icon name="cart-outline" size={24} color={theme.colors.secondary} />
              </View>
              <Text style={styles.actionText}>Nova Venda</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('NewPurchase')}>
              <View style={styles.iconCircle}>
                <Icon name="bag-add-outline" size={24} color={theme.colors.secondary} />
              </View>
              <Text style={styles.actionText}>Nova Compra</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ProductForm')}>
              <View style={styles.iconCircle}>
                <Icon name="add-circle-outline" size={24} color={theme.colors.secondary} />
              </View>
              <Text style={styles.actionText}>Novo Produto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('NewBonus')}>
              <View style={styles.iconCircle}>
                <Icon name="gift-outline" size={24} color={theme.colors.secondary} />
              </View>
              <Text style={styles.actionText}>Nova Bonificação</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary, // Matches top header
  },
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  header: { 
    backgroundColor: theme.colors.primary, 
    padding: 20, 
    paddingTop: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: { 
    fontSize: 22, 
    fontWeight: 'serif', 
    color: theme.colors.secondary,
    letterSpacing: 1,
  },
  subLogoText: {
    fontSize: 10,
    color: theme.colors.secondary,
    letterSpacing: 2,
  },
  greeting: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#fff',
    marginTop: 10,
  },
  welcomeMessage: { 
    fontSize: 14, 
    color: '#ddd' 
  },
  profileButton: {
    padding: 2
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  content: {
    padding: 16,
    marginTop: -30, // Pulls content up over the blue curve
  },
  mainBalanceCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  mainBalanceLabel: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  mainBalanceValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  mainBalanceSub: {
    color: '#eee',
    fontSize: 12,
    marginTop: 8,
  },
  metricsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
  },
  metricCard: { 
    width: '48%', 
    backgroundColor: theme.colors.card, 
    padding: 15, 
    borderRadius: 16, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: { fontSize: 13, color: theme.colors.textLight, marginBottom: 8 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  metricChange: { fontSize: 12, fontWeight: '500' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 15,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: { fontSize: 13, color: theme.colors.textLight, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  infoSub: { fontSize: 12, color: theme.colors.textLight, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 15, marginLeft: 4 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: { 
    width: '23%', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  iconCircle: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: theme.colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionText: { fontSize: 12, color: theme.colors.text, textAlign: 'center', fontWeight: '500' }
});
