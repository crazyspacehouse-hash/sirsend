"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type Order = {
  id: number;
  shop_id: string;
  order_number: number;
  status: 'preparing' | 'ready' | 'completed';
  notified_at?: string;
  acknowledged_at?: string;
  created_at: string;
};

export default function DashboardPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<{ orderId: number; message: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetNumber, setResetNumber] = useState('101');
  const router = useRouter();
  const { t, lang } = useTranslation();
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // تحميل البيانات
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUserId(user.id);

      const { data: restData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (restData) {
        setRestaurant(restData);
        if (restData.next_order_number) {
          setResetNumber(restData.next_order_number.toString());
        }
      }

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', user.id)
        .in('status', ['preparing', 'ready'])
        .order('created_at', { ascending: false });
      
      if (ordersData) {
        setPreparingOrders(ordersData.filter(o => o.status === 'preparing'));
        setReadyOrders(ordersData.filter(o => o.status === 'ready'));
      }
    };
    checkUser();
  }, []);

  // Real-time
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as Order;
        if (!order || order.shop_id !== userId) return;

        if (payload.eventType === 'INSERT' && order.status === 'preparing') {
          setPreparingOrders(prev => prev.some(o => o.id === order.id) ? prev : [order, ...prev]);
        }

        if (payload.eventType === 'UPDATE') {
          if (order.status === 'ready') {
            setPreparingOrders(prev => prev.filter(o => o.id !== order.id));
            setReadyOrders(prev => {
              if (prev.some(o => o.id === order.id)) return prev;
              return [order, ...prev];
            });
            startReminderTimer(order);
          }
          
          if (order.acknowledged_at) {
            setShowAlert({ 
              orderId: order.order_number, 
              message: lang === 'ar' 
                ? `الزبون أكد استلام طلب #${order.order_number} ✅` 
                : lang === 'tr' 
                ? `Müşteri sipariş #${order.order_number} aldığını onayladı ✅`
                : `Customer acknowledged order #${order.order_number} ✅`
            });
            setTimeout(() => setShowAlert(null), 5000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, [userId, lang]);

  // تذكير تلقائي بعد دقيقتين
  const startReminderTimer = (order: Order) => {
    const timer = setTimeout(() => {
      if (!order.acknowledged_at) {
        setShowAlert({
          orderId: order.order_number,
          message: lang === 'ar'
            ? `⏰ تذكير: الزبون لم يؤكد استلام طلب #${order.order_number} بعد دقيقتين`
            : lang === 'tr'
            ? `⏰ Hatırlatma: Müşteri 2 dakika sonra sipariş #${order.order_number} onaylamadı`
            : `⏰ Reminder: Customer hasn't acknowledged order #${order.order_number} after 2 minutes`
        });
        setTimeout(() => setShowAlert(null), 8000);
      }
    }, 120000);

    timersRef.current.set(order.id, timer);
  };

  const addOrder = async () => {
    if (loading || !userId || !restaurant) return;
    setLoading(true);

    // استخدام next_order_number من قاعدة البيانات
    const nextNumber = restaurant.next_order_number || 101;

    console.log('➕ إضافة طلب جديد رقم:', nextNumber);

    const { data, error } = await supabase
      .from('orders')
      .insert([{ shop_id: userId, order_number: nextNumber, status: 'preparing' }])
      .select()
      .single();

    if (error) {
      console.error('❌ خطأ:', error);
    } else {
      console.log('✅ تم إنشاء الطلب:', data);
      // زيادة الرقم للطلب التالي
      await supabase
        .from('restaurants')
        .update({ next_order_number: nextNumber + 1 })
        .eq('id', userId);
      
      setRestaurant({ ...restaurant, next_order_number: nextNumber + 1 });
    }

    setLoading(false);
  };

  const markReady = async (orderId: number) => {
    await supabase
      .from('orders')
      .update({ status: 'ready', notified_at: new Date().toISOString() })
      .eq('id', orderId);
  };

  const resendNotification = async (orderId: number) => {
    await supabase
      .from('orders')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', orderId);

    setShowAlert({
      orderId: 0,
      message: lang === 'ar' ? '📤 تم إعادة إرسال التنبيه' : lang === 'tr' ? '📤 Bildirim yeniden gönderildi' : '📤 Notification resent'
    });
    setTimeout(() => setShowAlert(null), 3000);
  };

  const completeOrder = async (orderId: number) => {
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    setReadyOrders(prev => prev.filter(o => o.id !== orderId));
  };

  // تصفير الأرقام
  const handleResetNumbers = async () => {
    const newNumber = parseInt(resetNumber);
    if (isNaN(newNumber) || newNumber < 1) {
      setShowAlert({
        orderId: 0,
        message: lang === 'ar' ? '❌ يرجى إدخال رقم صحيح' : lang === 'tr' ? '❌ Lütfen geçerli bir numara girin' : '❌ Please enter a valid number'
      });
      setTimeout(() => setShowAlert(null), 3000);
      return;
    }

    console.log('🔄 تصفير الأرقام إلى:', newNumber);

    await supabase
      .from('restaurants')
      .update({ next_order_number: newNumber })
      .eq('id', userId);

    setRestaurant({ ...restaurant, next_order_number: newNumber });
    setShowResetModal(false);

    setShowAlert({
      orderId: 0,
      message: lang === 'ar' 
        ? `✅ تم تصفير الأرقام! الطلب التالي سيبدأ من #${newNumber}` 
        : lang === 'tr' 
        ? `✅ Numaralar sıfırlandı! Bir sonraki sipariş #${newNumber} ile başlayacak`
        : `✅ Numbers reset! Next order will start from #${newNumber}`
    });
    setTimeout(() => setShowAlert(null), 4000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (!restaurant || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <p className="text-gray-600 font-medium">{t.dashboard.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert */}
      {showAlert && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-green-500 text-white p-4 rounded-xl shadow-2xl z-50 animate-bounce">
          <p className="font-bold">{showAlert.message}</p>
        </div>
      )}

      {/* Modal تصفير الأرقام */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-4">
              {lang === 'ar' ? 'تصفير أرقام الطلبات' : lang === 'tr' ? 'Sipariş Numaralarını Sıfırla' : 'Reset Order Numbers'}
            </h3>
            <p className="text-gray-600 mb-6">
              {lang === 'ar' 
                ? 'أدخل رقم البداية للطلبات الجديدة. الطلبات الحالية لن تتأثر.' 
                : lang === 'tr' 
                ? 'Yeni siparişler için başlangıç numarasını girin. Mevcut siparişler etkilenmeyecek.'
                : 'Enter the starting number for new orders. Current orders will not be affected.'}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {lang === 'ar' ? 'رقم البداية' : lang === 'tr' ? 'Başlangıç Numarası' : 'Starting Number'}
              </label>
              <input
                type="number"
                value={resetNumber}
                onChange={(e) => setResetNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none text-center text-2xl font-bold"
                min="1"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
              >
                {lang === 'ar' ? 'إلغاء' : lang === 'tr' ? 'İptal' : 'Cancel'}
              </button>
              <button
                onClick={handleResetNumbers}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-200"
              >
                {lang === 'ar' ? 'تصفير' : lang === 'tr' ? 'Sıfırla' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">{restaurant.name}</h1>
              <p className="text-xs text-gray-500">{restaurant.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => window.open(`/customer/${userId}`, '_blank')}
              className="hidden sm:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t.dashboard.customerScreen}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition font-semibold text-sm shadow-md shadow-red-200"
            >
              {t.auth.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <QRCodeDisplay shopId={userId} restaurantName={restaurant.name} />
        </div>

        <button
          onClick={addOrder}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-2xl font-black py-6 rounded-2xl shadow-xl shadow-red-200 mb-4 transition transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? t.dashboard.adding : t.dashboard.addOrder}
        </button>

        {/* زر تصفير الأرقام */}
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition mb-8 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {lang === 'ar' ? 'تصفير أرقام الطلبات' : lang === 'tr' ? 'Sipariş Numaralarını Sıfırla' : 'Reset Order Numbers'}
        </button>

        {/* الطلبات قيد التحضير */}
        {preparingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></span>
              {lang === 'ar' ? 'قيد التحضير' : lang === 'tr' ? 'Hazırlanıyor' : 'Preparing'} ({preparingOrders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preparingOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl shadow-md border-2 border-amber-200 p-6 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{t.dashboard.orderNumber}</p>
                    <p className="text-5xl font-black text-amber-600">#{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {lang === 'ar' ? 'أعطِ هذا الرقم للزبون' : lang === 'tr' ? 'Bu numarayı müşteriye verin' : 'Give this number to the customer'}
                    </p>
                  </div>
                  <button
                    onClick={() => markReady(order.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg shadow-red-200 transition transform hover:scale-105 active:scale-95"
                  >
                    {t.dashboard.ready}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الطلبات الجاهزة */}
        {readyOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              {lang === 'ar' ? 'جاهزة للاستلام' : lang === 'tr' ? 'Teslim alınmaya hazır' : 'Ready for pickup'} ({readyOrders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyOrders.map(order => (
                <div key={order.id} className="bg-green-50 rounded-2xl shadow-md border-2 border-green-300 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-1">{t.dashboard.orderNumber}</p>
                      <p className="text-5xl font-black text-green-600">#{order.order_number}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {lang === 'ar' ? 'تم إرسال التنبيه' : lang === 'tr' ? 'Bildirim gönderildi' : 'Notification sent'}
                      </p>
                    </div>
                    {order.acknowledged_at && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ✓ {lang === 'ar' ? 'تم الاستلام' : lang === 'tr' ? 'Alındı' : 'Received'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resendNotification(order.id)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition text-sm"
                    >
                      📤 {lang === 'ar' ? 'إعادة التنبيه' : lang === 'tr' ? 'Yeniden Gönder' : 'Resend'}
                    </button>
                    <button
                      onClick={() => completeOrder(order.id)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition text-sm"
                    >
                      ✓ {lang === 'ar' ? 'إغلاق' : lang === 'tr' ? 'Kapat' : 'Close'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {preparingOrders.length === 0 && readyOrders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">{t.dashboard.noOrders}</p>
            <p className="text-gray-400 text-sm mt-2">{t.dashboard.noOrdersHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}