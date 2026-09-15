import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons as Icon } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

import Dashboard from '../screens/Dashboard';
import Products from '../screens/Products';
import Consortium from '../screens/Consortium';
import ConsortiumDetail from '../screens/ConsortiumDetail';
import Login from '../screens/Login';
import ProductForm from '../screens/ProductForm';
import NewSale from '../screens/NewSale';
import NewPurchase from '../screens/NewPurchase';
import NewBonus from '../screens/NewBonus';
import Draws from '../screens/Draws';
import DrawsTab from '../screens/DrawsTab';
import Finance from '../screens/Finance';
import NewConsortium from '../screens/NewConsortium';
import Notifications from '../screens/Notifications';
import Clients from '../screens/Clients';
import ClientDetail from '../screens/ClientDetail';
import FulfillDraw from '../screens/FulfillDraw';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: theme.colors.primary },
  headerTintColor: theme.colors.secondary,
  headerTitleStyle: { fontWeight: 'bold' },
};

const ConsortiumStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen name="ConsortiumList" component={Consortium} options={{ title: 'Consórcios' }} />
    <Stack.Screen name="ConsortiumDetail" component={ConsortiumDetail} options={{ title: 'Detalhes' }} />
  </Stack.Navigator>
);

const ClientsStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen name="ClientsList" component={Clients} options={{ title: 'Clientes', headerShown: false }} />
    <Stack.Screen name="ClientDetail" component={ClientDetail} options={{ title: 'Perfil', headerShown: false }} />
  </Stack.Navigator>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Produtos') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Clientes') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Financeiro') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Consórcios') iconName = focused ? 'flower' : 'flower-outline';
          else if (route.name === 'Sorteios') iconName = focused ? 'gift' : 'gift-outline';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: { backgroundColor: theme.colors.primary, borderTopColor: 'transparent' },
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Início', headerShown: false }} />
      <Tab.Screen name="Produtos" component={Products} options={{ headerShown: false }} />
      <Tab.Screen name="Clientes" component={ClientsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Financeiro" component={Finance} options={{ headerShown: false }} />
      <Tab.Screen name="Consórcios" component={ConsortiumStack} options={{ headerShown: false }} />
      <Tab.Screen name="Sorteios" component={DrawsTab} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useContext(AppContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ProductForm" component={ProductForm} />
          <Stack.Screen name="NewSale" component={NewSale} />
          <Stack.Screen name="NewPurchase" component={NewPurchase} />
          <Stack.Screen name="NewBonus" component={NewBonus} />
          <Stack.Screen name="Draws" component={Draws} />
          <Stack.Screen name="NewConsortium" component={NewConsortium} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Group>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
      <Stack.Screen name="FulfillDraw" component={FulfillDraw} options={{ title: 'Entregar Prêmio', headerShown: false }} />
    </Stack.Navigator>
  );
}
