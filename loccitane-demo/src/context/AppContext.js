import React, { createContext, useState } from 'react';

export const AppContext = createContext();

const demoProducts = [
  { id: '7983', name: 'Combo Alfazema', code: '7983', cost: 10.74, price: 26.16, stock: 1 },
  { id: '2336', name: 'Kit Sabonete Perfumado 4un X 75gr', code: '2336', cost: 27.97, price: 59.89, stock: 1 },
  { id: '17967', name: 'Hidratante Facial FPS 30 Orquídea 50ml', code: '17967', cost: 34.35, price: 59.94, stock: 2 },
  { id: '10101', name: 'Creme Mãos Karité', code: '10101', cost: 40, price: 79.90, stock: 20 },
];

const demoClients = [
  { id: 'client-1', name: 'João', phone: '(00) 00000-0000' },
  { id: 'client-2', name: 'Cliente demonstração', phone: '(00) 00000-0000' },
];

const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(demoProducts);
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [consortiums, setConsortiums] = useState([]);
  const [draws, setDraws] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState(demoClients);
  const [prizeDeliveries, setPrizeDeliveries] = useState([]);
  const [appUsers, setAppUsers] = useState([
    { email: 'test', password: 'test' },
    { email: 'admin@loccitane.com', password: '123456' },
  ]);
  const [draftSaleItems, setDraftSaleItems] = useState([]);
  const [draftPurchaseItems, setDraftPurchaseItems] = useState([]);
  const [draftFulfillItems, setDraftFulfillItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  const addProduct = async (product) => setProducts((items) => [...items, { ...product, id: product.id || newId('product') }]);
  const updateProduct = async (product) => setProducts((items) => items.map((item) => item.id === product.id ? product : item));
  const deleteProduct = async (id) => setProducts((items) => items.filter((item) => item.id !== id));

  const addSale = async (sale) => {
    setSales((items) => [...items, { ...sale, id: newId('sale') }]);
    setProducts((items) => items.map((product) => {
      const item = sale.items?.find((selected) => selected.id === product.id);
      return item ? { ...product, stock: product.stock - item.quantity } : product;
    }));
  };
  const updateSale = async (sale) => setSales((items) => items.map((item) => item.id === sale.id ? sale : item));
  const deleteSale = async (id) => setSales((items) => items.filter((item) => item.id !== id));
  const addPurchase = async (purchase) => {
    setPurchases((items) => [...items, { ...purchase, id: newId('purchase') }]);
    setProducts((items) => items.map((product) => {
      const item = purchase.items?.find((selected) => selected.id === product.id);
      return item ? { ...product, stock: product.stock + item.quantity } : product;
    }));
  };
  const updatePurchase = async (purchase) => setPurchases((items) => items.map((item) => item.id === purchase.id ? purchase : item));
  const addBonus = async (bonus) => setBonuses((items) => [...items, { ...bonus, id: newId('bonus') }]);
  const addPrizeDelivery = async (delivery) => setPrizeDeliveries((items) => [...items, { ...delivery, id: newId('delivery') }]);

  const addConsortium = async (item) => setConsortiums((items) => [...items, { ...item, id: newId('consortium') }]);
  const updateConsortium = async (item) => setConsortiums((items) => items.map((current) => current.id === item.id ? item : current));
  const deleteConsortium = async (id) => setConsortiums((items) => items.filter((item) => item.id !== id));
  const addDraw = async (item) => setDraws((items) => [...items, { ...item, id: newId('draw') }]);
  const addInvoice = async (item) => setInvoices((items) => [...items, { ...item, id: newId('invoice') }]);
  const updateInvoice = async (item) => setInvoices((items) => items.map((current) => current.id === item.id ? item : current));
  const addClient = async (item) => setClients((items) => [...items, { ...item, id: newId('client') }]);
  const updateClient = async (item) => setClients((items) => items.map((current) => current.id === item.id ? item : current));

  const login = (email, password) => {
    if (email === 'test' && password === 'test') {
      setIsAuthenticated(true);
      setCurrentUserEmail('test');
      return true;
    }
    const valid = appUsers.some((user) => user.email === email && user.password === password);
    if (!valid) return false;
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    return true;
  };
  const registerUser = async (email, password) => {
    if (appUsers.some((user) => user.email === email)) return false;
    setAppUsers((users) => [...users, { email, password }]);
    return true;
  };
  const logout = () => { setIsAuthenticated(false); setCurrentUserEmail(null); };

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, logout, currentUserEmail,
      products, setProducts, addProduct, updateProduct, deleteProduct,
      sales, purchases, bonuses, consortiums, draws, invoices, clients, prizeDeliveries,
      addSale, deleteSale, addPurchase, addBonus, addConsortium, updateConsortium, deleteConsortium,
      addDraw, addInvoice, updateInvoice, updateSale, updatePurchase, addClient, updateClient,
      addPrizeDelivery, registerUser,
      draftSaleItems, setDraftSaleItems, draftPurchaseItems, setDraftPurchaseItems,
      draftFulfillItems, setDraftFulfillItems,
    }}>
      {children}
    </AppContext.Provider>
  );
};
