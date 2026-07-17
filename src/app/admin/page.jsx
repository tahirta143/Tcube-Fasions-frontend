'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LoaderSpinner from '@/components/LoaderSpinner';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, Package, ShoppingBag, Users, Plus, Trash2, ShieldAlert, Edit,
  RefreshCw, Upload, AlertCircle, TrendingUp, Settings, BarChart2,
  Tag, Ticket, Image, Download, Printer, Check, X, FileText, ChevronRight, Eye, Star
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const DEMO_REPORTS = {
  daily: [
    { label: 'Mon', revenue: 45000, order_count: 5 },
    { label: 'Tue', revenue: 78000, order_count: 8 },
    { label: 'Wed', revenue: 32000, order_count: 4 },
    { label: 'Thu', revenue: 95000, order_count: 11 },
    { label: 'Fri', revenue: 125000, order_count: 14 },
    { label: 'Sat', revenue: 165000, order_count: 19 },
    { label: 'Sun', revenue: 140000, order_count: 16 }
  ],
  weekly: [
    { label: 'Wk 1', revenue: 420000, order_count: 48 },
    { label: 'Wk 2', revenue: 580000, order_count: 62 },
    { label: 'Wk 3', revenue: 490000, order_count: 53 },
    { label: 'Wk 4', revenue: 750000, order_count: 85 }
  ],
  monthly: [
    { label: 'Jan', revenue: 1800000, order_count: 210 },
    { label: 'Feb', revenue: 2100000, order_count: 245 },
    { label: 'Mar', revenue: 2800000, order_count: 320 },
    { label: 'Apr', revenue: 2400000, order_count: 280 },
    { label: 'May', revenue: 3100000, order_count: 350 },
    { label: 'Jun', revenue: 3800000, order_count: 410 },
    { label: 'Jul', revenue: 3500000, order_count: 390 },
    { label: 'Aug', revenue: 4200000, order_count: 460 },
    { label: 'Sep', revenue: 4800000, order_count: 510 },
    { label: 'Oct', revenue: 5200000, order_count: 560 },
    { label: 'Nov', revenue: 6800000, order_count: 720 },
    { label: 'Dec', revenue: 8500000, order_count: 910 }
  ],
  yearly: [
    { label: '2024', revenue: 38000000, order_count: 4200 },
    { label: '2025', revenue: 52000000, order_count: 5800 },
    { label: '2026', revenue: 78000000, order_count: 8400 }
  ],
  topProducts: [
    { id: 1, name: 'Classic Linen Trench Coat', category: 'women', total_sold: 145, total_revenue: 1725500, images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop' },
    { id: 3, name: 'Merino Wool Mockneck Sweater', category: 'men', total_sold: 112, total_revenue: 761600, images: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop' },
    { id: 2, name: 'Minimalist Silk Slip Dress', category: 'women', total_sold: 95, total_revenue: 931000, images: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop' },
    { id: 6, name: 'Leather Crescent Shoulder Bag', category: 'accessories', total_sold: 74, total_revenue: 1369000, images: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop' },
    { id: 7, name: 'Minimalist Suede Loafers', category: 'shoes', total_sold: 58, total_revenue: 516200, images: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&auto=format&fit=crop' }
  ]
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState('products');

  // Database lists
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Category Tab State
  const [categoriesList, setCategoriesList] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', parent_id: '', banner_url: '' });
  const [categoryMsg, setCategoryMsg] = useState({ type: '', text: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', slug: '', parent_id: '', banner_url: '' });
  const [uploadingCatImage, setUploadingCatImage] = useState(false);

  // Coupon Tab State
  const [couponsList, setCouponsList] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', expiry_date: '', usage_limit: '' });
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });

  // Banner Tab State
  const [bannersList, setBannersList] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', description: '', image_url: '', link_url: '', type: 'hero', video_url: '' });
  const [bannerMsg, setBannerMsg] = useState({ type: '', text: '' });
  const [bannerImageMode, setBannerImageMode] = useState('url'); // 'url' or 'upload'
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [bannerVideoMode, setBannerVideoMode] = useState('url'); // 'url' or 'upload'
  const [uploadingBannerVideo, setUploadingBannerVideo] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editBannerForm, setEditBannerForm] = useState({ title: '', subtitle: '', description: '', image_url: '', link_url: '', type: 'hero', video_url: '' });
  const [editBannerImageMode, setEditBannerImageMode] = useState('url');
  const [editBannerVideoMode, setEditBannerVideoMode] = useState('url'); // 'url' or 'upload'
  const [bannerMediaType, setBannerMediaType] = useState('image'); // 'image' or 'video'
  const [editBannerMediaType, setEditBannerMediaType] = useState('image'); // 'image' or 'video'

  // Reviews Tab State
  const [pendingReviewsList, setPendingReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Loaders
  const [loading, setLoading] = useState(true);

  // Product Forms State
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: 'women',
    sizes: 'XS,S,M,L,XL',
    colors: 'Beige,Off-White,Warm Sand',
    images: '',
    video_url: '',
    stock: '10'
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    sizes: '',
    colors: '',
    images: '',
    video_url: '',
    stock: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Settings State for Password Change
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Analytics State
  const [reportsData, setReportsData] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [analyticsInterval, setAnalyticsInterval] = useState('daily'); // daily, weekly, monthly, yearly
  const [chartMetric, setChartMetric] = useState('revenue'); // revenue, orders
  const [useDemoData, setUseDemoData] = useState(true);

  // Customer Orders Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  // Print Invoice State
  const [printOrder, setPrintOrder] = useState(null);
  const [printOrderItems, setPrintOrderItems] = useState([]);

  // Tracking codes updates
  const [tempTracking, setTempTracking] = useState({});

  // Lock non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user]);

  const fetchAdminData = async () => {
    if (!token || user?.role !== 'admin') return;
    setLoading(true);
    try {
      const prodRes = await axios.get(`${API_URL}/api/products`);
      setProducts(prodRes.data);

      const orderRes = await axios.get(`${API_URL}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orderRes.data);

      const userRes = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(userRes.data);
    } catch (err) {
      console.warn('Backend disconnected during admin fetch, utilizing mock datasets:', err);
      setProducts([
        { id: 1, name: 'Classic Linen Trench Coat', price: 14500, discount_price: 11900, category: 'women', sizes: 'XS,S,M,L', colors: 'Beige,Warm Sand', stock: 15, images: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop' },
        { id: 2, name: 'Minimalist Silk Slip Dress', price: 9800, discount_price: null, category: 'women', sizes: 'S,M,L', colors: 'Charcoal,Pearl White', stock: 0, images: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop' },
        { id: 3, name: 'Merino Wool Mockneck Sweater', price: 7500, discount_price: 5900, category: 'men', sizes: 'M,L,XL', colors: 'Oatmeal,Heather Gray', stock: 22, images: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop' }
      ]);
      setOrders([
        { id: 101, created_at: new Date().toISOString(), total_amount: 18700, payment_method: 'easypaisa', payment_status: 'paid', order_status: 'shipped', shipping_name: 'Zain B.', transaction_id: '827364519283', shipping_email: 'zain@gmail.com' },
        { id: 102, created_at: new Date().toISOString(), total_amount: 9800, payment_method: 'cod', payment_status: 'pending', order_status: 'pending', shipping_name: 'Sarah K.', shipping_email: 'sarah@gmail.com' }
      ]);
      setUsersList([
        { id: 1, name: 'TCUBE Admin', email: 'admin@tcube.com', role: 'admin', created_at: new Date().toISOString() },
        { id: 2, name: 'Zain B.', email: 'zain@gmail.com', role: 'user', created_at: new Date().toISOString() },
        { id: 3, name: 'Sarah K.', email: 'sarah@gmail.com', role: 'user', created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabDetails = async () => {
    if (!token) return;
    try {
      if (activeTab === 'categories') {
        setCategoryLoading(true);
        const res = await axios.get(`${API_URL}/api/categories`);
        setCategoriesList(res.data);
        setCategoryLoading(false);
      } else if (activeTab === 'coupons') {
        setCouponLoading(true);
        const res = await axios.get(`${API_URL}/api/coupons`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCouponsList(res.data);
        setCouponLoading(false);
      } else if (activeTab === 'banners') {
        setBannerLoading(true);
        const res = await axios.get(`${API_URL}/api/banners`);
        setBannersList(res.data);
        setBannerLoading(false);
      } else if (activeTab === 'reviews') {
        setReviewsLoading(true);
        const res = await axios.get(`${API_URL}/api/reviews/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingReviewsList(res.data);
        setReviewsLoading(false);
      }
    } catch (err) {
      console.warn('Could not fetch tab details from backend:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token, user]);

  useEffect(() => {
    fetchTabDetails();
  }, [activeTab, token]);

  // Analytics reports fetch – must stay above the early-return guard
  // so that the hook count is the same on every render (Rules of Hooks).
  const fetchReports = async () => {
    if (!token) return;
    setLoadingReports(true);
    try {
      const res = await axios.get(`${API_URL}/api/orders/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportsData(res.data);
    } catch (err) {
      console.warn('Could not fetch analytics from DB:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchReports();
    }
  }, [activeTab, token]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
        <ShieldAlert size={48} className="text-red-500 animate-pulse" />
        <h2 className="font-serif text-xl font-bold">Access Denied</h2>
        <p className="text-xs uppercase tracking-widest text-primary/40">Authorized Administrators Only</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? parseFloat(o.total_amount) : 0), 0);
  const outOfStockItems = products.filter(p => p.stock <= 0).length;

  // Single Image uploads (Multer)
  const handleImageUpload = async (e, formType = 'create') => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      const uploadedUrl = `${API_URL}${res.data.url}`;
      if (formType === 'create') {
        setProductForm((prev) => ({ 
          ...prev, 
          images: prev.images ? `${prev.images},${uploadedUrl}` : uploadedUrl 
        }));
      } else {
        setEditProductForm((prev) => ({
          ...prev,
          images: prev.images ? `${prev.images},${uploadedUrl}` : uploadedUrl
        }));
      }
      setFormMsg({ type: 'success', text: 'Image uploaded successfully.' });
    } catch (err) {
      console.error('Image upload error:', err);
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Image upload failed. Size limit 5MB.' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Single Video uploads (Multer)
  const handleVideoUpload = async (e, formType = 'create') => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    setFormMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('image', file); // keeping field name 'image' as expected by multer single('image')

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      const uploadedUrl = `${API_URL}${res.data.url}`;
      if (formType === 'create') {
        setProductForm((prev) => ({ 
          ...prev, 
          video_url: uploadedUrl 
        }));
      } else {
        setEditProductForm((prev) => ({
          ...prev,
          video_url: uploadedUrl
        }));
      }
      setFormMsg({ type: 'success', text: 'Video uploaded successfully.' });
    } catch (err) {
      console.error('Video upload error:', err);
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Video upload failed. Size limit 50MB.' });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/api/products`, productForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormMsg({ type: 'success', text: 'Product created successfully!' });
      setProductForm({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        category: 'women',
        sizes: 'XS,S,M,L,XL',
        colors: 'Beige,Off-White,Warm Sand',
        images: '',
        video_url: '',
        stock: '10'
      });
      setShowAddForm(false);
      fetchAdminData();
    } catch (err) {
      console.error('Create product error:', err);
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create product' });
    }
  };

  const handleProductUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/products/${editingProduct.id}`, editProductForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product updated successfully!');
      setEditingProduct(null);
      fetchAdminData();
    } catch (err) {
      console.error('Update product error:', err);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
      alert('Product deleted successfully');
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Failed to delete product');
    }
  };

  // Bulk CSV product uploader
  const handleBulkCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedProducts = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim());
        const prod = {};
        headers.forEach((header, index) => {
          prod[header] = row[index];
        });

        if (prod.name && prod.price && prod.category) {
          parsedProducts.push({
            name: prod.name,
            description: prod.description || '',
            price: parseFloat(prod.price),
            discount_price: prod.discount_price ? parseFloat(prod.discount_price) : null,
            category: prod.category.toLowerCase(),
            sizes: prod.sizes || 'S,M,L',
            colors: prod.colors || 'Beige',
            images: prod.images || '/images/placeholder.jpg',
            stock: prod.stock ? parseInt(prod.stock) : 10
          });
        }
      }

      if (parsedProducts.length === 0) {
        alert('No valid products found. Ensure CSV headers contain: name, price, category, stock...');
        return;
      }

      if (confirm(`Detected ${parsedProducts.length} garments. Proceed with bulk database upload?`)) {
        try {
          await axios.post(
            `${API_URL}/api/products/bulk-upload`,
            { products: parsedProducts },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          alert('Bulk upload completed successfully!');
          fetchAdminData();
        } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || 'Bulk upload failed.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleUpdateOrderStatus = async (orderId, updates) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
      alert('Order status updated successfully');
    } catch (err) {
      console.error('Update order error:', err);
      alert('Failed to update order');
    }
  };

  // Category submit
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryMsg({ type: '', text: '' });
    try {
      await axios.post(`${API_URL}/api/categories`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoryMsg({ type: 'success', text: 'Category created successfully!' });
      setCategoryForm({ name: '', slug: '', parent_id: '', banner_url: '' });
      fetchTabDetails();
    } catch (err) {
      setCategoryMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create category' });
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${API_URL}/api/categories/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTabDetails();
      alert('Category deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete category');
    }
  };

  // Category Update
  const handleCategoryUpdate = async (e) => {
    e.preventDefault();
    setCategoryMsg({ type: '', text: '' });
    try {
      await axios.put(`${API_URL}/api/categories/${editingCategory.id}`, editCategoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoryMsg({ type: 'success', text: 'Category updated successfully!' });
      setEditingCategory(null);
      fetchTabDetails();
    } catch (err) {
      console.error('Update category error:', err);
      setCategoryMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update category' });
    }
  };

  // Category Banner Image Upload
  const handleCatImageUpload = async (e, formType = 'create') => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCatImage(true);
    setCategoryMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      const uploadedUrl = `${API_URL}${res.data.url}`;
      if (formType === 'create') {
        setCategoryForm((prev) => ({ ...prev, banner_url: uploadedUrl }));
      } else {
        setEditCategoryForm((prev) => ({ ...prev, banner_url: uploadedUrl }));
      }
      setCategoryMsg({ type: 'success', text: 'Category image uploaded successfully!' });
    } catch (err) {
      console.error('Category image upload error:', err);
      setCategoryMsg({ type: 'error', text: err.response?.data?.message || 'Image upload failed. Max 5MB.' });
    } finally {
      setUploadingCatImage(false);
    }
  };

  // Coupon Submit
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponMsg({ type: '', text: '' });
    try {
      await axios.post(`${API_URL}/api/coupons`, couponForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCouponMsg({ type: 'success', text: 'Coupon code registered successfully!' });
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: '', expiry_date: '', usage_limit: '' });
      fetchTabDetails();
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create coupon' });
    }
  };

  const handleDeleteCoupon = async (cId) => {
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/coupons/${cId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTabDetails();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  // Banner Submit
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setBannerMsg({ type: '', text: '' });
    try {
      const payload = { ...bannerForm };
      if (bannerMediaType === 'image') {
        payload.video_url = '';
      } else {
        payload.image_url = '';
      }
      await axios.post(`${API_URL}/api/banners`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBannerMsg({ type: 'success', text: 'Banner created successfully!' });
      setBannerForm({ title: '', subtitle: '', description: '', image_url: '', link_url: '', type: 'hero', video_url: '' });
      setBannerMediaType('image');
      fetchTabDetails();
    } catch (err) {
      setBannerMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create banner' });
    }
  };

  const handleDeleteBanner = async (bId) => {
    if (!confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_URL}/api/banners/${bId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTabDetails();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  // Banner image upload from device
  const handleBannerImageUpload = async (e, mode = 'create') => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBannerImage(true);
    setBannerMsg({ type: '', text: '' });
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      const uploadedUrl = `${API_URL}${res.data.url}`;
      if (mode === 'edit') {
        setEditBannerForm(prev => ({ ...prev, image_url: uploadedUrl }));
      } else {
        setBannerForm(prev => ({ ...prev, image_url: uploadedUrl }));
      }
      setBannerMsg({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (err) {
      console.error('Banner image upload error:', err);
      setBannerMsg({ type: 'error', text: err.response?.data?.message || 'Image upload failed. Max 5MB.' });
    } finally {
      setUploadingBannerImage(false);
    }
  };

  // Banner video upload from device
  const handleBannerVideoUpload = async (e, mode = 'create') => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBannerVideo(true);
    setBannerMsg({ type: '', text: '' });
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      const uploadedUrl = `${API_URL}${res.data.url}`;
      if (mode === 'edit') {
        setEditBannerForm(prev => ({ ...prev, video_url: uploadedUrl }));
      } else {
        setBannerForm(prev => ({ ...prev, video_url: uploadedUrl }));
      }
      setBannerMsg({ type: 'success', text: 'Video uploaded successfully!' });
    } catch (err) {
      console.error('Banner video upload error:', err);
      setBannerMsg({ type: 'error', text: err.response?.data?.message || 'Video upload failed. Max 500MB.' });
    } finally {
      setUploadingBannerVideo(false);
    }
  };

  const handleBannerUpdate = async (e) => {
    e.preventDefault();
    setBannerMsg({ type: '', text: '' });
    try {
      const payload = { ...editBannerForm };
      if (editBannerMediaType === 'image') {
        payload.video_url = '';
      } else {
        payload.image_url = '';
      }
      await axios.put(`${API_URL}/api/banners/${editingBanner.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBannerMsg({ type: 'success', text: 'Banner updated successfully!' });
      setEditingBanner(null);
      fetchTabDetails();
    } catch (err) {
      setBannerMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update banner' });
    }
  };

  // Reviews approval
  const handleApproveReview = async (revId) => {
    try {
      await axios.put(`${API_URL}/api/reviews/${revId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTabDetails();
      alert('Review approved successfully!');
    } catch (err) {
      alert('Failed to approve review.');
    }
  };

  const handleDeleteReview = async (revId) => {
    if (!confirm('Are you sure you want to reject and delete this review?')) return;
    try {
      await axios.delete(`${API_URL}/api/reviews/${revId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTabDetails();
    } catch (err) {
      alert('Failed to delete review.');
    }
  };

  // Open Customer details spent
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    const relatedOrders = orders.filter(o => o.shipping_email === customer.email || o.user_id === customer.id);
    setCustomerOrders(relatedOrders);
  };

  // Trigger Print Invoice Window
  const handleOpenPrintInvoice = async (order) => {
    setPrintOrder(order);
    try {
      const res = await axios.get(`${API_URL}/api/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrintOrderItems(res.data.items || []);
      // Wait for React to render layout briefly then print
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      console.error(err);
      alert('Could not fetch items details for invoice print.');
    }
  };

  const handleAdminPasswordChange = async (e) => {
    e.preventDefault();
    setSettingsMsg({ type: '', text: '' });

    if (!adminPassword) {
      setSettingsMsg({ type: 'error', text: 'Password field cannot be empty.' });
      return;
    }
    if (adminPassword.length < 6) {
      setSettingsMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (adminPassword !== confirmAdminPassword) {
      setSettingsMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSettingsLoading(true);
    try {
      await axios.put(`${API_URL}/api/auth/profile`, { password: adminPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettingsMsg({ type: 'success', text: 'Admin password changed successfully!' });
      setAdminPassword('');
      setConfirmAdminPassword('');
    } catch (err) {
      setSettingsMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setSettingsLoading(false);
    }
  };

  // (fetchReports + its useEffect moved above the early-return guard)

  // CSV Exporter helper
  const handleExportCSV = (reportType) => {
    let headers = [];
    let rows = [];
    let filename = `TCUBE_${reportType}_Report.csv`;

    const dataSrc = reportsData || DEMO_REPORTS;

    if (reportType === 'sales') {
      headers = ['Interval Label', 'Order Count', 'Total Revenue (Rs.)'];
      const intervalData = dataSrc[analyticsInterval] || [];
      rows = intervalData.map(d => [d.label, d.order_count, Math.round(d.revenue)]);
    } else if (reportType === 'products') {
      headers = ['Product ID', 'Garment Name', 'Category', 'Units Sold', 'Total Revenue Generated (Rs.)'];
      const topProds = dataSrc.topProducts || [];
      rows = topProds.map(p => [p.id, p.name, p.category, p.total_sold, Math.round(p.total_revenue)]);
    } else if (reportType === 'customers') {
      headers = ['Account ID', 'Customer Name', 'Email Address', 'Account Role', 'Total spend (Paid Orders)'];
      rows = usersList.map(u => {
        const spent = orders.filter(o => (o.shipping_email === u.email || o.user_id === u.id) && o.payment_status === 'paid')
                            .reduce((s, o) => s + parseFloat(o.total_amount), 0);
        return [u.id, u.name, u.email, u.role, Math.round(spent)];
      });
    } else if (reportType === 'revenue') {
      headers = ['Yearly Split', 'Orders count', 'Yearly Revenue (Rs.)'];
      const yearly = dataSrc.yearly || [];
      rows = yearly.map(y => [y.label, y.order_count, Math.round(y.revenue)]);
    }

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 w-full max-w-[1440px] mx-auto pb-16">

      {/* PRINT-ONLY INVOICE WRAPPER */}
      {printOrder && (
        <div className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto space-y-6 text-xs leading-relaxed">
          <div className="flex justify-between items-start border-b border-gray-300 pb-5">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-widest">TCUBE FASHIONS</h1>
              <p className="text-[9px] uppercase tracking-wider text-gray-500">Luxury Minimalist Capsule Clothing</p>
            </div>
            <div className="text-right">
              <h2 className="font-bold text-sm">INVOICE</h2>
              <p className="text-[10px]">Order ID: #{printOrder.id}</p>
              <p className="text-[10px]">Date: {new Date(printOrder.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-[11px]">
            <div className="space-y-1">
              <span className="font-bold block uppercase text-gray-400 text-[9px] tracking-wider">Deliver To</span>
              <p className="font-bold text-gray-800">{printOrder.shipping_name}</p>
              <p className="text-gray-600">{printOrder.shipping_address}</p>
              <p className="text-gray-600">{printOrder.shipping_city}, {printOrder.shipping_postal_code}</p>
              <p className="text-gray-600">Phone: {printOrder.shipping_phone}</p>
              <p className="text-gray-600">Email: {printOrder.shipping_email}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="font-bold block uppercase text-gray-400 text-[9px] tracking-wider">Payment Info</span>
              <p className="font-bold text-gray-800 capitalize">Method: {printOrder.payment_method}</p>
              <p className="text-gray-600 capitalize">Status: {printOrder.payment_status}</p>
              {printOrder.transaction_id && (
                <p className="text-gray-600">Ref: {printOrder.transaction_id}</p>
              )}
              {printOrder.tracking_number && (
                <p className="text-gray-600">Tracking Code: {printOrder.tracking_number}</p>
              )}
            </div>
          </div>

          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50 text-gray-600 font-bold uppercase tracking-wider">
                <th className="p-3">Garment Details</th>
                <th className="p-3 text-center">Size / Color</th>
                <th className="p-3 text-center">Price</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {printOrderItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="p-3 font-bold text-gray-800">{item.product_name}</td>
                  <td className="p-3 text-center text-gray-600">{item.size || 'N/A'} / {item.color || 'N/A'}</td>
                  <td className="p-3 text-center text-gray-600">Rs. {Math.round(item.price)}</td>
                  <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="p-3 text-right font-bold text-gray-800">Rs. {Math.round(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-2 text-[11px]">
              {printOrder.coupon_code && (
                <div className="flex justify-between text-gray-600">
                  <span>Coupon Applied ({printOrder.coupon_code}):</span>
                  <span>-Rs. {Math.round(printOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-gray-300 pt-2 text-sm text-gray-800">
                <span>Total Amount Paid:</span>
                <span>Rs. {Math.round(printOrder.total_amount)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-12 text-center text-[10px] text-gray-400">
            Thank you for shopping with TCUBE Fashions.
          </div>
        </div>
      )}

      {/* 1. BRAND HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sand-200 pb-5 print:hidden">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-primary flex items-center gap-2">
            <ShieldCheck size={26} className="text-secondary" />
            Admin Console
          </h1>
          <p className="text-[10px] text-primary/40 uppercase tracking-widest font-semibold">Store oversight & catalog configurations</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap bg-sand-100 p-1.5 rounded-2xl border border-sand-200 gap-1">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'products', label: 'Garments', icon: ShoppingBag },
            { id: 'orders', label: 'Shipments', icon: Package },
            { id: 'categories', label: 'Categories', icon: Tag },
            { id: 'coupons', label: 'Coupons', icon: Ticket },
            { id: 'banners', label: 'Banners', icon: Image },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'users', label: 'Customers', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-primary/50 hover:text-primary'}`}
              >
                <Icon size={11} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KPI METRICS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        <div className="bg-white p-5 rounded-3xl border border-sand-200/20 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary/40">Total Revenue</span>
          <div className="space-y-1 z-10 relative">
            <h3 className="text-2xl font-bold text-primary">Rs. {Math.round(totalRevenue)}</h3>
            <span className="text-[9px] text-[#A08C75] font-semibold flex items-center gap-0.5">
              <TrendingUp size={10} /> +12% this month
            </span>
          </div>
          <div className="absolute right-4 bottom-4 text-sand-100"><TrendingUp size={48} /></div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sand-200/20 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary/40">Total Shipments</span>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-primary">{orders.length} Orders</h3>
            <span className="text-[9px] text-primary/40 font-semibold">{orders.filter(o => o.order_status === 'pending').length} pending approval</span>
          </div>
          <div className="absolute right-4 bottom-4 text-sand-100"><Package size={48} /></div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sand-200/20 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary/40">Registered Shoppers</span>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-primary">{usersList.length} Accounts</h3>
            <span className="text-[9px] text-primary/40 font-semibold">{usersList.filter(u => u.role === 'admin').length} administrator keys</span>
          </div>
          <div className="absolute right-4 bottom-4 text-sand-100"><Users size={48} /></div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sand-200/20 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary/40">Stock Warning</span>
          <div className="space-y-1">
            <h3 className={`text-2xl font-bold ${outOfStockItems > 0 ? 'text-red-500' : 'text-primary'}`}>{outOfStockItems} Out of Stock</h3>
            <span className="text-[9px] text-primary/40 font-semibold">Keep catalog levels updated</span>
          </div>
          <div className="absolute right-4 bottom-4 text-red-50/50"><AlertCircle size={48} className={outOfStockItems > 0 ? 'text-red-100' : 'text-sand-100'} /></div>
        </div>
      </div>

      {loading ? (
        <LoaderSpinner message="Fetching console details..." className="py-32" />
      ) : (
        <div className="animate-fade-in print:hidden">

          {/* TAB 1: PRODUCT CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="font-serif text-xl font-bold text-primary">Catalog inventory ({products.length} items)</h2>
                
                <div className="flex gap-2">
                  <label className="bg-sand-200 hover:bg-secondary hover:text-white text-primary text-[10px] font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm">
                    <Upload size={13} />
                    Bulk CSV Upload
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleBulkCSVUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary hover:bg-[#A08C75] text-white text-[10px] font-bold uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={13} />
                    {showAddForm ? 'Close Editor' : 'Upload New Product'}
                  </button>
                </div>
              </div>

              {/* Add Product Drawer */}
              {showAddForm && (
                <div className="bg-white p-6 rounded-[24px] border border-sand-200 shadow-sm max-w-3xl animate-fade-in space-y-4">
                  <h3 className="font-serif text-lg font-bold text-primary border-b border-sand-100 pb-2">Add New Luxury Piece</h3>

                  {formMsg.text && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${formMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {formMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Garment Name</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Category</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none cursor-pointer bg-white text-xs"
                        >
                          <option value="women">Women</option>
                          <option value="men">Men</option>
                          <option value="kids">Kids</option>
                          <option value="accessories">Accessories</option>
                          <option value="shoes">Shoes</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="uppercase font-bold tracking-widest text-primary/50">Description</label>
                      <textarea
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Price (PKR)</label>
                        <input
                          type="number"
                          step="1"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Sale Price (PKR)</label>
                        <input
                          type="number"
                          step="1"
                          value={productForm.discount_price}
                          onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Inventory Stock</label>
                        <input
                          type="number"
                          required
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Sizes (comma-separated)</label>
                        <input
                          type="text"
                          value={productForm.sizes}
                          onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Colors (comma-separated)</label>
                        <input
                          type="text"
                          value={productForm.colors}
                          onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-sand-50/50 p-4 rounded-2xl border border-sand-200/50">
                      <div className="space-y-1.5">
                        <label className="uppercase font-bold tracking-widest text-primary/50 flex items-center gap-1">
                          <Upload size={14} className="text-secondary" /> Upload Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'create')}
                          className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                        />
                        {uploadingImage && <span className="text-[10px] text-secondary animate-pulse block">Uploading to uploads/ folder...</span>}
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Or Image URL</label>
                        <input
                          type="text"
                          placeholder="e.g. Unsplash URL"
                          value={productForm.images}
                          onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                          className="border border-sand-200 p-2.5 rounded-lg bg-white focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Video Upload Field */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-sand-50/50 p-4 rounded-2xl border border-sand-200/50 mt-3">
                      <div className="space-y-1.5">
                        <label className="uppercase font-bold tracking-widest text-primary/50 flex items-center gap-1">
                          <Upload size={14} className="text-secondary" /> Upload Product Video
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(e, 'create')}
                          className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                        />
                        {uploadingVideo && <span className="text-[10px] text-secondary animate-pulse block">Uploading video...</span>}
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Or Video URL</label>
                        <input
                          type="text"
                          placeholder="e.g. MP4 Video URL"
                          value={productForm.video_url}
                          onChange={(e) => setProductForm({ ...productForm, video_url: e.target.value })}
                          className="border border-sand-200 p-2.5 rounded-lg bg-white focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {productForm.images && (
                      <div className="flex gap-2 py-1">
                        {productForm.images.split(',').map((imgUrl, idx) => (
                          <div key={idx} className="w-16 h-20 rounded-lg border border-sand-200 overflow-hidden bg-white shadow-sm flex-shrink-0">
                            <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-4 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
                    >
                      Save Product to catalog
                    </button>
                  </form>
                </div>
              )}

              {/* Edit Product Drawer */}
              {editingProduct && (
                <div className="bg-white p-6 rounded-[24px] border border-sand-200 shadow-sm max-w-3xl animate-fade-in space-y-4">
                  <div className="flex justify-between items-center border-b border-sand-100 pb-2">
                    <h3 className="font-serif text-lg font-bold text-primary">Edit Garment Details: {editingProduct.name}</h3>
                    <button onClick={() => setEditingProduct(null)} className="text-primary hover:text-secondary"><X size={18} /></button>
                  </div>

                  <form onSubmit={handleProductUpdate} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Garment Name</label>
                        <input
                          type="text"
                          required
                          value={editProductForm.name}
                          onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Category</label>
                        <select
                          value={editProductForm.category}
                          onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none cursor-pointer bg-white text-xs"
                        >
                          <option value="women">Women</option>
                          <option value="men">Men</option>
                          <option value="kids">Kids</option>
                          <option value="accessories">Accessories</option>
                          <option value="shoes">Shoes</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="uppercase font-bold tracking-widest text-primary/50">Description</label>
                      <textarea
                        rows={3}
                        value={editProductForm.description}
                        onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                        className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Price (PKR)</label>
                        <input
                          type="number"
                          step="1"
                          required
                          value={editProductForm.price}
                          onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Sale Price (PKR)</label>
                        <input
                          type="number"
                          step="1"
                          value={editProductForm.discount_price || ''}
                          onChange={(e) => setEditProductForm({ ...editProductForm, discount_price: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Inventory Stock</label>
                        <input
                          type="number"
                          required
                          value={editProductForm.stock}
                          onChange={(e) => setEditProductForm({ ...editProductForm, stock: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Sizes (comma-separated)</label>
                        <input
                          type="text"
                          value={editProductForm.sizes}
                          onChange={(e) => setEditProductForm({ ...editProductForm, sizes: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Colors (comma-separated)</label>
                        <input
                          type="text"
                          value={editProductForm.colors}
                          onChange={(e) => setEditProductForm({ ...editProductForm, colors: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-sand-50/50 p-4 rounded-2xl border border-sand-200/50">
                      <div className="space-y-1.5">
                        <label className="uppercase font-bold tracking-widest text-primary/50 flex items-center gap-1">
                          <Upload size={14} className="text-secondary" /> Upload Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'edit')}
                          className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Or Add Image URL (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Unsplash URL"
                          value={editProductForm.images}
                          onChange={(e) => setEditProductForm({ ...editProductForm, images: e.target.value })}
                          className="border border-sand-200 p-2.5 rounded-lg bg-white focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Video Edit/Upload Field */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-sand-50/50 p-4 rounded-2xl border border-sand-200/50 mt-3">
                      <div className="space-y-1.5">
                        <label className="uppercase font-bold tracking-widest text-primary/50 flex items-center gap-1">
                          <Upload size={14} className="text-secondary" /> Upload Product Video
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(e, 'edit')}
                          className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                        />
                        {uploadingVideo && <span className="text-[10px] text-secondary animate-pulse block">Uploading video...</span>}
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Or Add Video URL</label>
                        <input
                          type="text"
                          placeholder="e.g. MP4 Video URL"
                          value={editProductForm.video_url}
                          onChange={(e) => setEditProductForm({ ...editProductForm, video_url: e.target.value })}
                          className="border border-sand-200 p-2.5 rounded-lg bg-white focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {editProductForm.images && (
                      <div className="flex gap-2 py-1">
                        {editProductForm.images.split(',').map((imgUrl, idx) => (
                          <div key={idx} className="w-16 h-20 rounded-lg border border-sand-200 overflow-hidden bg-white shadow-sm flex-shrink-0">
                            <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-grow py-4 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md"
                      >
                        Save Updates
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="py-4 px-6 bg-sand-200 text-primary font-bold uppercase tracking-widest rounded-xl hover:bg-sand-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white rounded-3xl border border-sand-200/20 shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-sand-50/50 uppercase tracking-widest text-primary/40 font-bold border-b border-sand-100 text-[10px]">
                        <th className="p-5">Garment Details</th>
                        <th className="p-5">Category</th>
                        <th className="p-5">Pricing</th>
                        <th className="p-5">Inventory</th>
                        <th className="p-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-100/50">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-sand-50/20 transition-colors">
                          <td className="p-5 flex items-center gap-3.5">
                            <img src={p.images?.split(',')[0]} alt={p.name} className="w-9 h-12 object-cover rounded-lg border border-sand-200" />
                            <div>
                              <span className="font-serif font-bold text-primary text-sm">{p.name}</span>
                              <span className="text-[9px] text-primary/45 block uppercase font-semibold mt-0.5">ID: #{p.id}</span>
                            </div>
                          </td>
                          <td className="p-5 uppercase tracking-wider text-primary/60 font-semibold">{p.category}</td>
                          <td className="p-5 font-bold text-primary">
                            {p.discount_price ? (
                              <div className="space-x-1.5">
                                <span className="text-secondary">Rs. {Math.round(parseFloat(p.discount_price))}</span>
                                <span className="text-primary/30 line-through">Rs. {Math.round(parseFloat(p.price))}</span>
                              </div>
                            ) : (
                              <span>Rs. {Math.round(parseFloat(p.price))}</span>
                            )}
                          </td>
                          <td className="p-5 font-semibold">
                            <span className={p.stock <= 0 ? 'text-red-500 font-bold' : 'text-primary/70'}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-5 text-center flex items-center justify-center pt-7">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setEditProductForm({
                                  name: p.name,
                                  description: p.description || '',
                                  price: p.price,
                                  discount_price: p.discount_price || '',
                                  category: p.category,
                                  sizes: p.sizes || '',
                                  colors: p.colors || '',
                                  images: p.images || '',
                                  video_url: p.video_url || '',
                                  stock: p.stock
                                });
                              }}
                              className="p-2 border border-sand-200 bg-sand-50 text-primary rounded-lg hover:bg-sand-100 transition-colors mr-2 flex items-center justify-center"
                              title="Edit Item"
                            >
                              <Settings size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 border border-red-100 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPMENTS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-primary">All order logs ({orders.length} items)</h2>

              <div className="bg-white rounded-3xl border border-sand-200/20 shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-sand-50/50 uppercase tracking-widest text-primary/40 font-bold border-b border-sand-100 text-[10px]">
                        <th className="p-5">Order ID</th>
                        <th className="p-5">Recipient</th>
                        <th className="p-5">Total Value</th>
                        <th className="p-5">Payment Status</th>
                        <th className="p-5">Delivery Status</th>
                        <th className="p-5">Tracking Details</th>
                        <th className="p-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-100/50">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-sand-50/20 transition-colors">
                          <td className="p-5">
                            <span className="font-bold text-primary block">#{o.id}</span>
                            <span className="text-[9px] text-primary/40 font-medium block mt-0.5">{new Date(o.created_at).toLocaleDateString()}</span>
                          </td>
                          <td className="p-5">
                            <span className="font-bold text-primary block">{o.shipping_name}</span>
                            {o.transaction_id && (
                              <span className="block text-[9px] text-[#A08C75] font-mono tracking-tight mt-0.5">Ref: {o.transaction_id} (Acc: {o.sender_account})</span>
                            )}
                            {o.payment_intent_id && (
                              <span className="block text-[9px] text-[#A08C75] font-mono tracking-tight mt-0.5 font-bold">
                                Intent: {o.payment_intent_id.substring(0, 10)}... ({o.payment_gateway === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} Gateway)
                              </span>
                            )}
                          </td>
                          <td className="p-5 font-bold text-[#A08C75]">
                            Rs. {Math.round(parseFloat(o.total_amount))}
                            {o.coupon_code && <span className="block text-[8px] text-secondary">Coupon: {o.coupon_code}</span>}
                          </td>
                          <td className="p-5">
                            <select
                              value={o.payment_status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, { paymentStatus: e.target.value })}
                              className="border border-sand-200 p-1.5 rounded-lg bg-white focus:outline-none cursor-pointer font-bold text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                          <td className="p-5">
                            <select
                              value={o.order_status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, { orderStatus: e.target.value })}
                              className="border border-sand-200 p-1.5 rounded-lg bg-white focus:outline-none cursor-pointer font-bold text-xs"
                            >
                              <option value="pending">Pending</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="p-5">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="Tracking ID"
                                value={tempTracking[o.id] !== undefined ? tempTracking[o.id] : (o.tracking_number || '')}
                                onChange={(e) => setTempTracking({ ...tempTracking, [o.id]: e.target.value })}
                                className="border border-sand-200 p-1.5 rounded-lg text-[10px] w-24 bg-white"
                              />
                              <button
                                onClick={() => handleUpdateOrderStatus(o.id, { trackingNumber: tempTracking[o.id] })}
                                className="p-1.5 bg-primary hover:bg-secondary text-white rounded-lg"
                                title="Save Tracking"
                              >
                                <Check size={11} />
                              </button>
                            </div>
                          </td>
                          <td className="p-5">
                            <button
                              onClick={() => handleOpenPrintInvoice(o)}
                              className="p-2 border border-sand-200 bg-sand-50 text-primary rounded-lg hover:bg-sand-100 flex items-center justify-center"
                              title="Print Invoice"
                            >
                              <Printer size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Creation / Edit */}
                <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-4 self-start">
                  <div className="flex justify-between items-center border-b border-sand-100 pb-2">
                    <h3 className="font-serif text-lg font-bold text-primary">
                      {editingCategory ? `Edit Category` : 'Create New Category'}
                    </h3>
                    {editingCategory && (
                      <button 
                        onClick={() => {
                          setEditingCategory(null);
                          setCategoryMsg({ type: '', text: '' });
                        }} 
                        className="text-xs font-bold uppercase tracking-widest text-[#A08C75] hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  
                  {categoryMsg.text && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${categoryMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {categoryMsg.text}
                    </div>
                  )}

                  {editingCategory ? (
                    <form onSubmit={handleCategoryUpdate} className="space-y-4 text-xs">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Category Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Linen Jackets"
                          value={editCategoryForm.name}
                          onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                          className="border border-sand-200 p-3 rounded-lg bg-white"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Slug Reference</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. linen-jackets"
                          value={editCategoryForm.slug}
                          onChange={(e) => setEditCategoryForm({ ...editCategoryForm, slug: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg bg-white"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Parent Category</label>
                        <select
                          value={editCategoryForm.parent_id || ''}
                          onChange={(e) => setEditCategoryForm({ ...editCategoryForm, parent_id: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg bg-white cursor-pointer"
                        >
                          <option value="">None (Top Level Category)</option>
                          {categoriesList.filter(c => !c.parent_id && c.id !== editingCategory.id).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Banner Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Image URL or upload"
                            value={editCategoryForm.banner_url || ''}
                            onChange={(e) => setEditCategoryForm({ ...editCategoryForm, banner_url: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white flex-grow"
                          />
                          <label className="bg-sand-100 hover:bg-sand-200 border border-sand-200 px-3 py-3 rounded-lg text-center cursor-pointer font-bold uppercase tracking-wider text-[9px] flex items-center justify-center flex-shrink-0">
                            {uploadingCatImage ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCatImageUpload(e, 'edit')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md">
                        Update Category
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Category Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Linen Jackets"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                          className="border border-sand-200 p-3 rounded-lg bg-white"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Slug Reference</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. linen-jackets"
                          value={categoryForm.slug}
                          onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg bg-white"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Parent Category</label>
                        <select
                          value={categoryForm.parent_id}
                          onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg bg-white cursor-pointer"
                        >
                          <option value="">None (Top Level Category)</option>
                          {categoriesList.filter(c => !c.parent_id).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Banner Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Image URL or upload"
                            value={categoryForm.banner_url}
                            onChange={(e) => setCategoryForm({ ...categoryForm, banner_url: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white flex-grow"
                          />
                          <label className="bg-sand-100 hover:bg-sand-200 border border-sand-200 px-3 py-3 rounded-lg text-center cursor-pointer font-bold uppercase tracking-wider text-[9px] flex items-center justify-center flex-shrink-0">
                            {uploadingCatImage ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCatImageUpload(e, 'create')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                      <button type="submit" className="w-full py-3 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md">
                        Register Category
                      </button>
                    </form>
                  )}
                </div>

                {/* Tree View Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-sand-200/20 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-primary border-b border-sand-100 pb-2">Category Tree Visualizer</h3>

                  {categoryLoading ? (
                    <div className="py-20 flex justify-center"><RefreshCw size={24} className="animate-spin text-secondary" /></div>
                  ) : categoriesList.length === 0 ? (
                    <p className="text-primary/40 text-center py-20 uppercase font-bold tracking-widest">No categories recorded yet</p>
                  ) : (
                    <div className="space-y-4">
                      {categoriesList.filter(c => !c.parent_id).map(topCat => {
                        const subs = categoriesList.filter(c => c.parent_id === topCat.id);
                        return (
                          <div key={topCat.id} className="border border-sand-100 rounded-2xl p-4 bg-sand-50/20 space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <ChevronRight size={14} className="text-[#A08C75]" />
                                <span className="font-serif text-sm font-bold text-primary">{topCat.name}</span>
                                <span className="text-[9px] font-mono text-primary/45 uppercase tracking-wide bg-sand-100 px-2 py-0.5 rounded">/{topCat.slug}</span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCategory(topCat);
                                    setEditCategoryForm({
                                      name: topCat.name,
                                      slug: topCat.slug,
                                      parent_id: topCat.parent_id || '',
                                      banner_url: topCat.banner_url || ''
                                    });
                                  }}
                                  className="p-1.5 text-secondary hover:bg-sand-100 rounded"
                                  title="Edit Category"
                                >
                                  <Edit size={12} />
                                </button>
                                <button onClick={() => handleDeleteCategory(topCat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                              </div>
                            </div>

                            {subs.length > 0 && (
                              <div className="pl-6 border-l border-sand-200/80 space-y-2">
                                {subs.map(subCat => (
                                  <div key={subCat.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-sand-100">
                                    <span className="text-xs font-semibold text-primary/70">{subCat.name} (/{subCat.slug})</span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingCategory(subCat);
                                          setEditCategoryForm({
                                            name: subCat.name,
                                            slug: subCat.slug,
                                            parent_id: subCat.parent_id || '',
                                            banner_url: subCat.banner_url || ''
                                          });
                                        }}
                                        className="p-1 text-secondary hover:bg-sand-100 rounded"
                                        title="Edit Category"
                                      >
                                        <Edit size={11} />
                                      </button>
                                      <button onClick={() => handleDeleteCategory(subCat.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={11} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coupon Create Form */}
                <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-4 self-start">
                  <h3 className="font-serif text-lg font-bold text-primary border-b border-sand-100 pb-2">Register Promo Code</h3>
                  
                  {couponMsg.text && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${couponMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {couponMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs">
                    <div className="flex flex-col space-y-1">
                      <label className="uppercase font-bold tracking-widest text-primary/50">Promo Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TCUBE20"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        className="border border-sand-200 p-3 rounded-lg bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Discount Type</label>
                        <select
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg bg-white cursor-pointer"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Currency</option>
                        </select>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="uppercase font-bold tracking-widest text-primary/50">Value</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 20"
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                          className="border border-sand-200 p-3 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="uppercase font-bold tracking-widest text-primary/50">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={couponForm.expiry_date}
                        onChange={(e) => setCouponForm({ ...couponForm, expiry_date: e.target.value })}
                        className="border border-sand-200 p-3 rounded-lg bg-white"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="uppercase font-bold tracking-widest text-primary/50">Usage Limit (Optional)</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={couponForm.usage_limit}
                        onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                        className="border border-sand-200 p-3 rounded-lg bg-white"
                      />
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md">
                      Register Coupon
                    </button>
                  </form>
                </div>

                {/* Coupons table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-sand-200/20 shadow-sm overflow-hidden">
                  {couponLoading ? (
                    <div className="py-20 flex justify-center"><RefreshCw size={24} className="animate-spin text-secondary" /></div>
                  ) : couponsList.length === 0 ? (
                    <p className="text-primary/40 text-center py-20 uppercase font-bold tracking-widest">No promo codes registered yet</p>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-sand-50/50 uppercase tracking-widest text-primary/40 font-bold border-b border-sand-100 text-[10px]">
                          <th className="p-4">Promo Code</th>
                          <th className="p-4">Discount Value</th>
                          <th className="p-4">Usage Tracker</th>
                          <th className="p-4">Expiry Date</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand-100/50">
                        {couponsList.map((c) => (
                          <tr key={c.id} className="hover:bg-sand-50/20 transition-colors">
                            <td className="p-4 font-bold text-primary">{c.code}</td>
                            <td className="p-4 font-semibold text-secondary capitalize">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rs. ${Math.round(c.discount_value)}`}</td>
                            <td className="p-4 text-primary/70">{c.used_count} / {c.usage_limit || '∞'} uses</td>
                            <td className="p-4 text-primary/60">{new Date(c.expiry_date).toLocaleDateString()}</td>
                            <td className="p-4 text-center">
                              <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create / Edit Banner Form */}
                <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-4 self-start">
                  {editingBanner ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-sand-100 pb-2">
                        <h3 className="font-serif text-lg font-bold text-primary">Edit Slide</h3>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBanner(null);
                            setBannerMsg({ type: '', text: '' });
                          }}
                          className="text-[10px] uppercase font-bold tracking-widest text-[#A08C75] hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      {bannerMsg.text && (
                        <div className={`p-3 rounded-lg text-xs font-semibold ${bannerMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {bannerMsg.text}
                        </div>
                      )}

                      <form onSubmit={handleBannerUpdate} className="space-y-4 text-xs">
                        <div className="flex flex-col space-y-1">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Slide Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Pure Linen capsule"
                            value={editBannerForm.title}
                            onChange={(e) => setEditBannerForm({ ...editBannerForm, title: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Slide Subtitle</label>
                          <input
                            type="text"
                            placeholder="e.g. Capsule Release 02"
                            value={editBannerForm.subtitle}
                            onChange={(e) => setEditBannerForm({ ...editBannerForm, subtitle: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Link Path</label>
                          <input
                            type="text"
                            placeholder="e.g. /shop?category=women"
                            value={editBannerForm.link_url}
                            onChange={(e) => setEditBannerForm({ ...editBannerForm, link_url: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col space-y-1 col-span-2">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Placement Type</label>
                            <select
                              value={editBannerForm.type}
                              onChange={(e) => setEditBannerForm({ ...editBannerForm, type: e.target.value })}
                              className="border border-sand-200 p-3 rounded-lg bg-white cursor-pointer"
                            >
                              <option value="hero">Homepage Hero Carousel</option>
                              <option value="editorial">Homepage Editorial Story</option>
                              <option value="promo">Promotional Banner</option>
                            </select>
                          </div>
                        </div>

                        {editBannerForm.type === 'editorial' && (
                          <div className="flex flex-col space-y-1">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Story Description</label>
                            <textarea
                              placeholder="Enter the storytelling copy..."
                              value={editBannerForm.description || ''}
                              onChange={(e) => setEditBannerForm({ ...editBannerForm, description: e.target.value })}
                              className="border border-sand-200 p-3 rounded-lg bg-white h-24 resize-none"
                            />
                          </div>
                        )}

                        <div className="flex flex-col space-y-2">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Banner Media Type</label>
                          <div className="flex rounded-lg overflow-hidden border border-sand-200 text-xs font-bold uppercase tracking-widest">
                            <button
                              type="button"
                              onClick={() => setEditBannerMediaType('image')}
                              className={`flex-1 py-2.5 transition-all ${
                                editBannerMediaType === 'image'
                                  ? 'bg-[#A08C75] text-white'
                                  : 'bg-white text-primary/50 hover:bg-sand-50'
                              }`}
                            >
                              Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditBannerMediaType('video')}
                              className={`flex-1 py-2.5 transition-all ${
                                editBannerMediaType === 'video'
                                  ? 'bg-[#A08C75] text-white'
                                  : 'bg-white text-primary/50 hover:bg-sand-50'
                              }`}
                            >
                              Video
                            </button>
                          </div>
                        </div>

                        {editBannerMediaType === 'image' ? (
                          <div className="flex flex-col space-y-2">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Banner Image</label>
                            <div className="flex rounded-lg overflow-hidden border border-sand-200 text-[10px] font-bold uppercase tracking-widest">
                              <button
                                type="button"
                                onClick={() => setEditBannerImageMode('url')}
                                className={`flex-1 py-2 transition-all ${
                                  editBannerImageMode === 'url'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Paste URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditBannerImageMode('upload')}
                                className={`flex-1 py-2 transition-all ${
                                  editBannerImageMode === 'upload'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Upload File
                              </button>
                            </div>

                            {editBannerImageMode === 'url' ? (
                              <input
                                type="text"
                                required={editBannerMediaType === 'image' && !editBannerForm.image_url}
                                placeholder="https://example.com/banner.jpg"
                                value={editBannerForm.image_url}
                                onChange={(e) => setEditBannerForm({ ...editBannerForm, image_url: e.target.value })}
                                className="border border-sand-200 p-3 rounded-lg bg-white"
                              />
                            ) : (
                              <div className="flex flex-col gap-2">
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-sand-300 rounded-xl p-4 cursor-pointer hover:border-[#A08C75] hover:bg-sand-50/50 transition-all">
                                  <Upload size={16} className="text-secondary" />
                                  <span className="text-primary/60 font-semibold">
                                    {uploadingBannerImage ? 'Uploading…' : 'Choose image (max 5 MB)'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleBannerImageUpload(e, 'edit')}
                                    disabled={uploadingBannerImage}
                                  />
                                </label>
                              </div>
                            )}

                            {editBannerForm.image_url && (
                              <div className="relative rounded-lg overflow-hidden border border-sand-100 mt-1">
                                <img
                                  src={editBannerForm.image_url}
                                  alt="Banner preview"
                                  className="w-full h-24 object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditBannerForm({ ...editBannerForm, image_url: '' })}
                                  className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-2">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Banner Video</label>
                            <div className="flex rounded-lg overflow-hidden border border-sand-200 text-[10px] font-bold uppercase tracking-widest">
                              <button
                                type="button"
                                onClick={() => setEditBannerVideoMode('url')}
                                className={`flex-1 py-2 transition-all ${
                                  editBannerVideoMode === 'url'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Paste URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditBannerVideoMode('upload')}
                                className={`flex-1 py-2 transition-all ${
                                  editBannerVideoMode === 'upload'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Upload File
                              </button>
                            </div>

                            {editBannerVideoMode === 'url' ? (
                              <input
                                type="text"
                                required={editBannerMediaType === 'video' && !editBannerForm.video_url}
                                placeholder="e.g. /hero.mp4 or https://example.com/video.mp4"
                                value={editBannerForm.video_url || ''}
                                onChange={(e) => setEditBannerForm({ ...editBannerForm, video_url: e.target.value })}
                                className="border border-sand-200 p-3 rounded-lg bg-white"
                              />
                            ) : (
                              <div className="flex flex-col gap-2">
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-sand-300 rounded-xl p-4 cursor-pointer hover:border-[#A08C75] hover:bg-sand-50/50 transition-all">
                                  <Upload size={16} className="text-secondary" />
                                  <span className="text-primary/60 font-semibold">
                                    {uploadingBannerVideo ? 'Uploading…' : 'Choose video (max 500 MB)'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => handleBannerVideoUpload(e, 'edit')}
                                    disabled={uploadingBannerVideo}
                                  />
                                </label>
                              </div>
                            )}

                            {editBannerForm.video_url && (
                              <div className="relative rounded-lg overflow-hidden border border-sand-100 mt-1">
                                <video
                                  src={editBannerForm.video_url}
                                  controls
                                  muted
                                  className="w-full h-24 object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditBannerForm({ ...editBannerForm, video_url: '' })}
                                  className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <button type="submit" className="w-full py-3 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md">
                          Update Slide
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-bold text-primary border-b border-sand-100 pb-2">Add Carousel Slide</h3>
                      
                      {bannerMsg.text && (
                        <div className={`p-3 rounded-lg text-xs font-semibold ${bannerMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {bannerMsg.text}
                        </div>
                      )}

                      <form onSubmit={handleBannerSubmit} className="space-y-4 text-xs">
                        <div className="flex flex-col space-y-1">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Slide Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Pure Linen capsule"
                            value={bannerForm.title}
                            onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Slide Subtitle</label>
                          <input
                            type="text"
                            placeholder="e.g. Capsule Release 02"
                            value={bannerForm.subtitle}
                            onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Link Path</label>
                          <input
                            type="text"
                            placeholder="e.g. /shop?category=women"
                            value={bannerForm.link_url}
                            onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                            className="border border-sand-200 p-3 rounded-lg bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col space-y-1 col-span-2">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Placement Type</label>
                            <select
                              value={bannerForm.type}
                              onChange={(e) => setBannerForm({ ...bannerForm, type: e.target.value })}
                              className="border border-sand-200 p-3 rounded-lg bg-white cursor-pointer"
                            >
                              <option value="hero">Homepage Hero Carousel</option>
                              <option value="editorial">Homepage Editorial Story</option>
                              <option value="promo">Promotional Banner</option>
                            </select>
                          </div>
                        </div>

                        {bannerForm.type === 'editorial' && (
                          <div className="flex flex-col space-y-1">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Story Description</label>
                            <textarea
                              placeholder="Enter the storytelling copy..."
                              value={bannerForm.description || ''}
                              onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                              className="border border-sand-200 p-3 rounded-lg bg-white h-24 resize-none"
                            />
                          </div>
                        )}

                        <div className="flex flex-col space-y-2">
                          <label className="uppercase font-bold tracking-widest text-primary/50">Banner Media Type</label>
                          <div className="flex rounded-lg overflow-hidden border border-sand-200 text-xs font-bold uppercase tracking-widest">
                            <button
                              type="button"
                              onClick={() => setBannerMediaType('image')}
                              className={`flex-1 py-2.5 transition-all ${
                                bannerMediaType === 'image'
                                  ? 'bg-[#A08C75] text-white'
                                  : 'bg-white text-primary/50 hover:bg-sand-50'
                              }`}
                            >
                              Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setBannerMediaType('video')}
                              className={`flex-1 py-2.5 transition-all ${
                                bannerMediaType === 'video'
                                  ? 'bg-[#A08C75] text-white'
                                  : 'bg-white text-primary/50 hover:bg-sand-50'
                              }`}
                            >
                              Video
                            </button>
                          </div>
                        </div>

                        {bannerMediaType === 'image' ? (
                          <div className="flex flex-col space-y-2">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Banner Image</label>
                            <div className="flex rounded-lg overflow-hidden border border-sand-200 text-[10px] font-bold uppercase tracking-widest">
                              <button
                                type="button"
                                onClick={() => setBannerImageMode('url')}
                                className={`flex-1 py-2 transition-all ${
                                  bannerImageMode === 'url'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Paste URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setBannerImageMode('upload')}
                                className={`flex-1 py-2 transition-all ${
                                  bannerImageMode === 'upload'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Upload File
                              </button>
                            </div>

                            {bannerImageMode === 'url' ? (
                              <input
                                type="text"
                                required={bannerMediaType === 'image' && !bannerForm.image_url}
                                placeholder="https://example.com/banner.jpg"
                                value={bannerForm.image_url}
                                onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                                className="border border-sand-200 p-3 rounded-lg bg-white"
                              />
                            ) : (
                              <div className="flex flex-col gap-2">
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-sand-300 rounded-xl p-4 cursor-pointer hover:border-[#A08C75] hover:bg-sand-50/50 transition-all">
                                  <Upload size={16} className="text-secondary" />
                                  <span className="text-primary/60 font-semibold">
                                    {uploadingBannerImage ? 'Uploading…' : 'Choose image (max 5 MB)'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBannerImageUpload}
                                    disabled={uploadingBannerImage}
                                  />
                                </label>
                              </div>
                            )}

                            {bannerForm.image_url && (
                              <div className="relative rounded-lg overflow-hidden border border-sand-100 mt-1">
                                <img
                                  src={bannerForm.image_url}
                                  alt="Banner preview"
                                  className="w-full h-24 object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setBannerForm({ ...bannerForm, image_url: '' })}
                                  className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-2">
                            <label className="uppercase font-bold tracking-widest text-primary/50">Banner Video</label>
                            <div className="flex rounded-lg overflow-hidden border border-sand-200 text-[10px] font-bold uppercase tracking-widest">
                              <button
                                type="button"
                                onClick={() => setBannerVideoMode('url')}
                                className={`flex-1 py-2 transition-all ${
                                  bannerVideoMode === 'url'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Paste URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setBannerVideoMode('upload')}
                                className={`flex-1 py-2 transition-all ${
                                  bannerVideoMode === 'upload'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-primary/50 hover:bg-sand-50'
                                }`}
                              >
                                Upload File
                              </button>
                            </div>

                            {bannerVideoMode === 'url' ? (
                              <input
                                type="text"
                                required={bannerMediaType === 'video' && !bannerForm.video_url}
                                placeholder="e.g. /hero.mp4 or https://example.com/video.mp4"
                                value={bannerForm.video_url || ''}
                                onChange={(e) => setBannerForm({ ...bannerForm, video_url: e.target.value })}
                                className="border border-sand-200 p-3 rounded-lg bg-white"
                              />
                            ) : (
                              <div className="flex flex-col gap-2">
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-sand-300 rounded-xl p-4 cursor-pointer hover:border-[#A08C75] hover:bg-sand-50/50 transition-all">
                                  <Upload size={16} className="text-secondary" />
                                  <span className="text-primary/60 font-semibold">
                                    {uploadingBannerVideo ? 'Uploading…' : 'Choose video (max 500 MB)'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => handleBannerVideoUpload(e, 'create')}
                                    disabled={uploadingBannerVideo}
                                  />
                                </label>
                              </div>
                            )}

                            {bannerForm.video_url && (
                              <div className="relative rounded-lg overflow-hidden border border-sand-100 mt-1">
                                <video
                                  src={bannerForm.video_url}
                                  controls
                                  muted
                                  className="w-full h-24 object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => setBannerForm({ ...bannerForm, video_url: '' })}
                                  className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <button type="submit" className="w-full py-3 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md">
                          Register Slide
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Slides list */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-sand-200/20 shadow-sm overflow-hidden">
                  {bannerLoading ? (
                    <div className="py-20 flex justify-center"><RefreshCw size={24} className="animate-spin text-secondary" /></div>
                  ) : bannersList.length === 0 ? (
                    <p className="text-primary/40 text-center py-20 uppercase font-bold tracking-widest">No banners recorded yet</p>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-sand-50/50 uppercase tracking-widest text-primary/40 font-bold border-b border-sand-100 text-[10px]">
                          <th className="p-4">Thumbnail</th>
                          <th className="p-4">Title / Subtitle</th>
                          <th className="p-4">Type</th>
                          <th className="p-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand-100/50">
                        {bannersList.map((b) => (
                          <tr key={b.id} className="hover:bg-sand-50/20 transition-colors">
                            <td className="p-4">
                              <img src={b.image_url} alt="" className="w-14 h-9 object-cover rounded border border-sand-100" />
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-primary block">{b.title || 'Untitled'}</span>
                              <span className="text-[10px] text-primary/40 block">{b.subtitle || 'No subtitle'}</span>
                              {b.description && (
                                <p className="text-[10px] text-primary/60 max-w-xs truncate italic mt-1">{b.description}</p>
                              )}
                            </td>
                            <td className="p-4 uppercase tracking-wider text-[9px] font-bold text-[#A08C75]">{b.type} banner</td>
                            <td className="p-4 text-center flex items-center justify-center gap-1.5 h-16">
                              <button
                                onClick={() => {
                                  setEditingBanner(b);
                                  setEditBannerForm({
                                    title: b.title || '',
                                    subtitle: b.subtitle || '',
                                    description: b.description || '',
                                    image_url: b.image_url || '',
                                    link_url: b.link_url || '',
                                    type: b.type,
                                    video_url: b.video_url || ''
                                  });
                                  setEditBannerImageMode('url');
                                  setEditBannerVideoMode('url');
                                  setEditBannerMediaType(b.video_url ? 'video' : 'image');
                                }}
                                className="p-1.5 text-secondary hover:bg-sand-50 rounded"
                                title="Edit Slide"
                              >
                                <Edit size={12} />
                              </button>
                              <button onClick={() => handleDeleteBanner(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-primary">Pending Customer Reviews ({pendingReviewsList.length})</h2>

              {reviewsLoading ? (
                <div className="py-20 flex justify-center"><RefreshCw size={24} className="animate-spin text-secondary" /></div>
              ) : pendingReviewsList.length === 0 ? (
                <div className="bg-white/60 p-12 rounded-3xl border border-sand-200/50 text-center">
                  <p className="text-primary/40 uppercase font-bold tracking-widest text-[10px]">No pending reviews found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingReviewsList.map((rev) => (
                    <div key={rev.id} className="bg-white p-5 rounded-2xl border border-sand-200/30 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-serif font-bold text-primary block text-sm">{rev.user_name}</span>
                            <span className="text-[9px] text-primary/40 font-semibold">{rev.user_email}</span>
                          </div>
                          <span className="text-[9px] text-primary/45 font-medium">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2 bg-sand-50/50 p-2.5 rounded-lg border border-sand-100">
                          <img src={rev.product_images?.split(',')[0]} alt="" className="w-6 h-8 object-cover rounded" />
                          <span className="text-[10px] text-primary/70 font-semibold">{rev.product_name}</span>
                        </div>

                        <div className="flex text-secondary">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={11} className="fill-secondary text-secondary" />
                          ))}
                        </div>

                        <p className="text-[11px] text-primary/80 italic leading-relaxed font-light">{rev.comment || 'No comment provided.'}</p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-sand-100">
                        <button
                          onClick={() => handleApproveReview(rev.id)}
                          className="flex-grow py-2 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-[9px] rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Check size={10} /> Approve
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="flex-grow py-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 font-bold uppercase tracking-wider text-[9px] rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <X size={10} /> Reject / Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REGISTERED CUSTOMERS */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl font-bold text-primary">All registered shopper accounts ({usersList.length} users)</h2>

              <div className="bg-white rounded-3xl border border-sand-200/20 shadow-sm overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-sand-50/50 uppercase tracking-widest text-primary/40 font-bold border-b border-sand-100 text-[10px]">
                        <th className="p-5">User</th>
                        <th className="p-5">Email Address</th>
                        <th className="p-5">Phone Number</th>
                        <th className="p-5 text-center">Role</th>
                        <th className="p-5 text-center">Spent Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-100/50">
                      {usersList.map((u) => {
                        const totalSpent = orders.filter(o => (o.shipping_email === u.email || o.user_id === u.id) && o.payment_status === 'paid')
                                                .reduce((s, o) => s + parseFloat(o.total_amount), 0);
                        return (
                          <tr key={u.id} className="hover:bg-sand-50/20 transition-colors cursor-pointer" onClick={() => handleViewCustomer(u)}>
                            <td className="p-5 flex items-center gap-3.5">
                              <div className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center font-bold text-[#A08C75] uppercase border border-sand-200 text-xs">
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-bold text-primary">{u.name}</span>
                            </td>
                            <td className="p-5 font-semibold text-primary/70">{u.email}</td>
                            <td className="p-5 text-primary/60 font-semibold">{u.phone || 'Not registered'}</td>
                            <td className="p-5 text-center">
                              <span className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full border ${u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-5 text-center font-bold text-[#A08C75]">Rs. {Math.round(totalSpent).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ANALYTICS CHARTS & REPORTS */}
          {activeTab === 'analytics' && (() => {
            const currentData = useDemoData 
              ? DEMO_REPORTS[analyticsInterval] 
              : (reportsData?.[analyticsInterval] || []);
              
            const topProducts = useDemoData
              ? DEMO_REPORTS.topProducts
              : (reportsData?.topProducts || []);

            const hasData = currentData && currentData.length > 0;
            const values = currentData.map(d => chartMetric === 'revenue' ? parseFloat(d.revenue) : parseInt(d.order_count));
            const maxVal = Math.max(...values, 10);
            
            const width = 500;
            const height = 200;
            const paddingLeft = 45;
            const paddingRight = 20;
            const paddingTop = 25;
            const paddingBottom = 30;
            const graphWidth = width - paddingLeft - paddingRight;
            const graphHeight = height - paddingTop - paddingBottom;
            
            const points = currentData.map((d, index) => {
              const x = paddingLeft + (index * graphWidth / Math.max(currentData.length - 1, 1));
              const val = chartMetric === 'revenue' ? parseFloat(d.revenue) : parseInt(d.order_count);
              const y = height - paddingBottom - (val * graphHeight / maxVal);
              return { x, y, label: d.label, val };
            });

            const linePath = hasData && points.length > 0
              ? "M " + points.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")
              : "";

            const areaPath = hasData && points.length > 0
              ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - paddingBottom).toFixed(1)} Z`
              : "";

            const displayRevenueSum = currentData.reduce((s, d) => s + parseFloat(d.revenue), 0);
            const totalOrders = currentData.reduce((s, d) => s + parseInt(d.order_count), 0);
            const aov = totalOrders > 0 ? displayRevenueSum / totalOrders : 0;

            return (
              <div className="space-y-8 text-xs">
                {/* CSV Exports Bar */}
                <div className="bg-white p-4 rounded-2xl border border-sand-200/40 shadow-sm flex flex-wrap gap-2.5 items-center">
                  <span className="font-bold uppercase tracking-wider text-[9px] text-primary/45 flex items-center gap-1"><Download size={12} /> Export CSV:</span>
                  <button onClick={() => handleExportCSV('sales')} className="px-3.5 py-2 bg-sand-100 hover:bg-secondary hover:text-white rounded-xl font-bold uppercase tracking-wider text-[9px] text-primary/70 transition-all flex items-center gap-1.5"><FileText size={11} /> Sales Report</button>
                  <button onClick={() => handleExportCSV('products')} className="px-3.5 py-2 bg-sand-100 hover:bg-secondary hover:text-white rounded-xl font-bold uppercase tracking-wider text-[9px] text-primary/70 transition-all flex items-center gap-1.5"><FileText size={11} /> Product Report</button>
                  <button onClick={() => handleExportCSV('customers')} className="px-3.5 py-2 bg-sand-100 hover:bg-secondary hover:text-white rounded-xl font-bold uppercase tracking-wider text-[9px] text-primary/70 transition-all flex items-center gap-1.5"><FileText size={11} /> Customer Spend Report</button>
                  <button onClick={() => handleExportCSV('revenue')} className="px-3.5 py-2 bg-sand-100 hover:bg-secondary hover:text-white rounded-xl font-bold uppercase tracking-wider text-[9px] text-primary/70 transition-all flex items-center gap-1.5"><FileText size={11} /> Annual Splits</button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 bg-white/60 border border-sand-200/50 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseDemoData(false)}
                      className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[9px] border transition-all ${!useDemoData ? 'bg-primary text-white border-primary' : 'bg-transparent border-sand-200 text-primary/70 hover:border-secondary'}`}
                    >
                      Live Database
                    </button>
                    <button
                      onClick={() => setUseDemoData(true)}
                      className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-[9px] border transition-all ${useDemoData ? 'bg-secondary text-white border-secondary' : 'bg-transparent border-sand-200 text-primary/70 hover:border-secondary'}`}
                    >
                      Demo Preview
                    </button>
                  </div>

                  <div className="flex border border-sand-200 rounded-xl overflow-hidden bg-white">
                    {[
                      { id: 'daily', label: 'Daily' },
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'yearly', label: 'Yearly' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setAnalyticsInterval(item.id)}
                        className={`px-4 py-2 font-bold uppercase tracking-wider text-[9px] transition-all ${analyticsInterval === item.id ? 'bg-primary text-white' : 'text-primary/70 hover:bg-sand-50'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-sand-200/20 shadow-sm flex flex-col justify-between h-24">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary/45">Interval Revenue</span>
                    <h3 className="text-xl font-bold text-primary">Rs. {Math.round(displayRevenueSum).toLocaleString()}</h3>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-sand-200/20 shadow-sm flex flex-col justify-between h-24">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary/45">Interval Orders</span>
                    <h3 className="text-xl font-bold text-primary">{totalOrders} Shipments</h3>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-sand-200/20 shadow-sm flex flex-col justify-between h-24">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary/45">Average Order Value (AOV)</span>
                    <h3 className="text-xl font-bold text-secondary">Rs. {Math.round(aov).toLocaleString()}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-sand-200/25 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-sand-100 pb-4">
                    <h3 className="font-serif text-base font-bold text-primary capitalize">{analyticsInterval} Sales Curve</h3>
                    
                    <div className="flex bg-sand-100 p-1 rounded-xl">
                      <button
                        onClick={() => setChartMetric('revenue')}
                        className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[9px] transition-all ${chartMetric === 'revenue' ? 'bg-white text-primary shadow-sm' : 'text-primary/50'}`}
                      >
                        Revenue
                      </button>
                      <button
                        onClick={() => setChartMetric('orders')}
                        className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[9px] transition-all ${chartMetric === 'orders' ? 'bg-white text-primary shadow-sm' : 'text-primary/50'}`}
                      >
                        Orders Count
                      </button>
                    </div>
                  </div>

                  {loadingReports ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-2">
                      <RefreshCw size={24} className="animate-spin text-secondary" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-primary/40">Loading reports...</span>
                    </div>
                  ) : !hasData ? (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-sand-200 rounded-2xl p-6 text-center">
                      <p className="text-primary/40 uppercase font-bold tracking-widest text-[10px] mb-2">No live data found for this interval</p>
                      <p className="text-[11px] text-primary/60 font-light max-w-xs">Enable "Demo Preview" above to see what the analytics curves will look like once sales start logging.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <svg className="w-full h-64 bg-transparent overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A08C75" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#A08C75" stopOpacity="0.00"/>
                          </linearGradient>
                        </defs>
                        
                        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                          <line 
                            key={i} 
                            x1={paddingLeft} 
                            y1={paddingTop + r * graphHeight} 
                            x2={width - paddingRight} 
                            y2={paddingTop + r * graphHeight} 
                            stroke="#EAE6DF" 
                            strokeDasharray="4 4" 
                            strokeWidth="0.75" 
                          />
                        ))}

                        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                          const val = maxVal - (r * maxVal);
                          return (
                            <text 
                              key={i} 
                              x={paddingLeft - 10} 
                              y={paddingTop + r * graphHeight + 3} 
                              fill="#1E1E1E" 
                              opacity="0.4" 
                              fontSize="8" 
                              fontWeight="bold" 
                              textAnchor="end"
                            >
                              {chartMetric === 'revenue' 
                                ? (val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${Math.round(val/1000)}k` : Math.round(val))
                                : Math.round(val)
                              }
                            </text>
                          );
                        })}

                        {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}
                        {linePath && <path d={linePath} fill="none" stroke="#A08C75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

                        {points.map((p, idx) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="3.5" 
                              fill="#FFFFFF" 
                              stroke="#A08C75" 
                              strokeWidth="2" 
                              className="group-hover:r-5 transition-all duration-150" 
                            />
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                              <rect 
                                x={p.x - 45} 
                                y={p.y - 32} 
                                width="90" 
                                height="22" 
                                rx="6" 
                                fill="#1E1E1E" 
                                className="shadow-lg"
                              />
                              <text 
                                x={p.x} 
                                y={p.y - 18} 
                                fill="#FFFFFF" 
                                fontSize="8" 
                                fontWeight="bold" 
                                textAnchor="middle"
                              >
                                {chartMetric === 'revenue' ? `Rs. ${Math.round(p.val).toLocaleString()}` : `${p.val} Orders`}
                              </text>
                            </g>
                          </g>
                        ))}

                        {points.map((p, idx) => (
                          <text 
                            key={idx} 
                            x={p.x} 
                            y={height - 10} 
                            fill="#1E1E1E" 
                            opacity="0.4" 
                            fontSize="8" 
                            fontWeight="bold" 
                            textAnchor="middle"
                          >
                            {p.label}
                          </text>
                        ))}
                      </svg>
                    </div>
                  )}
                </div>

                {/* Top Selling Products List */}
                <div className="bg-white p-6 rounded-3xl border border-sand-200/25 shadow-sm space-y-4">
                  <div className="border-b border-sand-100 pb-3">
                    <h3 className="font-serif text-base font-bold text-primary">Top Performing Products</h3>
                    <p className="text-[9px] text-primary/40 uppercase tracking-widest font-semibold mt-0.5">Top catalog garments by order quantity</p>
                  </div>

                  {topProducts.length === 0 ? (
                    <div className="text-center py-10 bg-sand-50/50 rounded-2xl border border-dashed border-sand-200">
                      <p className="text-primary/45 uppercase tracking-widest font-bold text-[9px]">No product sales tracked yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-sand-50/50 uppercase tracking-widest text-primary/40 font-bold border-b border-sand-100 text-[9px]">
                            <th className="p-4">Garment</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-center">Units Sold</th>
                            <th className="p-4 text-right">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-100/50">
                          {topProducts.map((prod, idx) => (
                            <tr key={idx} className="hover:bg-sand-50/20 transition-colors">
                              <td className="p-4 flex items-center gap-3.5">
                                <span className="font-serif font-bold text-primary/45 text-[10px] w-4">{idx + 1}</span>
                                <img src={prod.images?.split(',')[0]} alt={prod.name} className="w-8 h-10 object-cover rounded-lg border border-sand-200" />
                                <span className="font-serif font-bold text-primary text-xs">{prod.name}</span>
                              </td>
                              <td className="p-4 uppercase tracking-wider text-primary/60 font-semibold">{prod.category}</td>
                              <td className="p-4 text-center font-bold text-primary">{prod.total_sold} units</td>
                              <td className="p-4 text-right font-bold text-[#A08C75]">Rs. {Math.round(prod.total_revenue).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="glass-card p-6 max-w-xl mx-auto space-y-6 animate-fade-in text-xs">
              <div className="border-b border-sand-200 pb-3">
                <h2 className="font-serif text-2xl font-bold text-primary">Admin Security Settings</h2>
                <p className="text-[10px] text-primary/40 uppercase tracking-wider font-semibold mt-1">Update administrator password credentials</p>
              </div>

              {settingsMsg.text && (
                <div className={`p-3.5 rounded-lg border text-xs font-semibold ${settingsMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {settingsMsg.text}
                </div>
              )}

              <form onSubmit={handleAdminPasswordChange} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">New Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-primary/50">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    className="text-xs border border-sand-200 p-3 rounded-lg focus:outline-none focus:border-secondary bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full py-4 bg-primary hover:bg-[#A08C75] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {settingsLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* CUSTOMER DETAILS MODAL POPUP */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-xl max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-sand-100 pb-2">
              <h3 className="font-serif text-lg font-bold text-primary">Customer Profile Summary</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-primary hover:text-secondary"><X size={18} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-sand-50 p-4 rounded-2xl border border-sand-100">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-primary/45 font-bold block">Shopper Name</span>
                <span className="font-bold text-primary text-sm">{selectedCustomer.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-primary/45 font-bold block">Joined Date</span>
                <span className="font-bold text-primary">{new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase tracking-wider text-primary/45 font-bold block">Email Address</span>
                <span className="font-semibold text-primary/80">{selectedCustomer.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-primary text-[10px]">Order History ({customerOrders.length} orders)</h4>
              {customerOrders.length === 0 ? (
                <p className="text-primary/40 italic">No orders logged under this user.</p>
              ) : (
                <div className="border border-sand-100 rounded-2xl overflow-hidden divide-y divide-sand-100">
                  {customerOrders.map(o => (
                    <div key={o.id} className="p-3 flex justify-between items-center bg-white hover:bg-sand-50/20 transition-colors">
                      <div>
                        <span className="font-bold text-primary block">Order #{o.id}</span>
                        <span className="text-[9px] text-primary/40">{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary block">Rs. {Math.round(o.total_amount)}</span>
                        <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded border border-sand-100 bg-sand-50">{o.order_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
