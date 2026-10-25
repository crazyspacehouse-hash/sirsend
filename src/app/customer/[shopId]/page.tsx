"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
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

export default function CustomerPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  const { t, lang } = useTranslation();

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAcknowledgeAlert, setShowAcknowledgeAlert] = useState(false);
  const [alreadyAcknowledged, setAlreadyAcknowledged] = useState(false);
  const [showResendAlert, setShowResendAlert] = useState(false);

  const lastNotifiedAtRef = useRef<string | null>(null);

  // جلب اسم المطعم
  useEffect(() => {
    const getRestaurantName = async () => {
      const { data } = await supabase
        .from('restaurants')
        .select('name')
        .eq('id', shopId)
        .single();
      if (data) setRestaurantName(data.name);
    };
    if (shopId) getRestaurantName();
  }, [shopId]);

  // طلب إذن الإشعارات
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // تشغيل الصوت والاهتزاز
  const triggerNotification = (isResend: boolean = false) => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play failed:", e));
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(restaurantName || t.siteName, {
        body: isResend
          ? (lang === 'ar' ? '⚠️ تذكير: طلبك جاهز للاستلام!' : lang === 'tr' ? '⚠️ Hatırlatma: Siparişiniz hazır!' : '⚠️ Reminder: Your order is ready!')
          : (lang === 'ar' ? 'طلبك جاهز للاستلام!' : lang === 'tr' ? 'Siparişiniz hazır!' : 'Your order is ready!')
      });
    }
  };

  // التحقق من رقم الفاتورة
  const handleCheckInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAlreadyAcknowledged(false);
    setShowResendAlert(false);

    const invoiceNum = parseInt(invoiceNumber);
    if (isNaN(invoiceNum)) {
      setError(
        lang === 'ar' ? 'يرجى إدخال رقم صحيح' :
        lang === 'tr' ? 'Lütfen geçerli bir numara girin' :
        'Please enter a valid number'
      );
      setLoading(false);
      return;
    }

    console.log('🔍 البحث عن الطلب رقم:', invoiceNum);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .eq('order_number', invoiceNum)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      console.error('❌ الطلب غير موجود:', error);
      setError(
        lang === 'ar' ? 'لم يتم العثور على طلب بهذا الرقم. تأكد من الرقم وحاول مرة أخرى.' :
        lang === 'tr' ? 'Bu numaraya ait sipariş bulunamadı. Numarayı kontrol edip tekrar deneyin.' :
        'No order found with this number. Please check and try again.'
      );
      setLoading(false);
      return;
    }

    const order = data[0];
    console.log('✅ تم العثور على الطلب:', order);
    setCurrentOrder(order);
    lastNotifiedAtRef.current = order.notified_at || null;

    // ✅ التحقق من الحالات الثلاث
    if (order.status === 'completed') {
      setIsCompleted(true);
      setIsReady(false);
      setAlreadyAcknowledged(true);
    } else if (order.status === 'ready') {
      setIsReady(true);
      setIsCompleted(false);
      if (order.acknowledged_at) {
        setAlreadyAcknowledged(true);
      }
    } else {
      // preparing
      setIsReady(false);
      setIsCompleted(false);
    }

    setLoading(false);
  };

  // Real-time للطلب الحالي
  useEffect(() => {
    if (!shopId || !currentOrder) return;

    console.log('📡 بدء Real-time للطلب:', currentOrder.order_number);

    const channel = supabase
      .channel(`order-${currentOrder.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${currentOrder.id}`
        },
        (payload) => {
          console.log('🔄 تحديث الطلب:', payload.new);
          const updatedOrder = payload.new as Order;

          // 1. عند تغيير الحالة إلى ready
          if (updatedOrder.status === 'ready' && !isReady && !isCompleted) {
            setIsReady(true);
            setIsCompleted(false);
            triggerNotification(false);
          }

          // 2. عند تغيير الحالة إلى completed (تم التسليم)
          if (updatedOrder.status === 'completed') {
            setIsCompleted(true);
            setIsReady(false);
            setAlreadyAcknowledged(true);
            console.log('✅ تم إغلاق الطلب من الكاشير');
          }

          // 3. عند تغيير notified_at (إعادة إرسال التنبيه)
          if (updatedOrder.notified_at && updatedOrder.notified_at !== lastNotifiedAtRef.current && updatedOrder.status === 'ready') {
            console.log('📤 تم إعادة إرسال التنبيه!');
            lastNotifiedAtRef.current = updatedOrder.notified_at;
            triggerNotification(true);
            setShowResendAlert(true);
            setTimeout(() => setShowResendAlert(false), 4000);
          }

          // 4. عند تأكيد الاستلام
          if (updatedOrder.acknowledged_at && !alreadyAcknowledged) {
            setAlreadyAcknowledged(true);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [shopId, currentOrder, isReady, isCompleted, alreadyAcknowledged]);

  // تأكيد الاستلام
  const handleAcknowledge = async () => {
    if (!currentOrder) return;
    console.log('✅ تأكيد استلام الطلب:', currentOrder.id);

    await supabase
      .from('orders')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', currentOrder.id);

    setAlreadyAcknowledged(true);
    setShowAcknowledgeAlert(true);
    setTimeout(() => setShowAcknowledgeAlert(false), 3000);
  };

  // إعادة تعيين
  const handleReset = () => {
    setCurrentOrder(null);
    setIsReady(false);
    setIsCompleted(false);
    setInvoiceNumber('');
    setError('');
    setAlreadyAcknowledged(false);
    setShowAcknowledgeAlert(false);
    setShowResendAlert(false);
    lastNotifiedAtRef.current = null;
  };

  // --- شاشة إدخال رقم الفاتورة ---
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">{restaurantName || t.siteName}</h1>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {lang === 'ar' ? 'تتبّع طلبك' : lang === 'tr' ? 'Siparişinizi Takip Edin' : 'Track Your Order'}
            </h2>
            <p className="text-gray-600">
              {lang === 'ar' ? 'أدخل رقم الفاتورة الذي أعطاك إياه الكاشير' :
               lang === 'tr' ? 'Kasiyerin verdiği fatura numarasını girin' :
               'Enter the invoice number given by the cashier'}
            </p>
          </div>

          <form onSubmit={handleCheckInvoice} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {lang === 'ar' ? 'رقم الفاتورة' : lang === 'tr' ? 'Fatura Numarası' : 'Invoice Number'}
              </label>
              <input
                type="number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none text-center text-2xl font-bold"
                placeholder="101"
                min="1"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-red-200 text-lg"
            >
              {loading
                ? (lang === 'ar' ? 'جاري البحث...' : lang === 'tr' ? 'Aranıyor...' : 'Searching...')
                : (lang === 'ar' ? 'تتبّع الطلب' : lang === 'tr' ? 'Siparişi Takip Et' : 'Track Order')}
            </button>
          </form>

          <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              {lang === 'ar' ? '💡 ستجد رقم الفاتورة على إيصال الطلب' :
               lang === 'tr' ? '💡 Fatura numarasını fişinizde bulabilirsiniz' :
               ' You can find the invoice number on your receipt'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- شاشة تتبع الطلب ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-md flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">{restaurantName || t.siteName}</h1>
        </div>
        <LanguageSwitcher />
      </div>

      {/* تنبيه تأكيد الاستلام */}
      {showAcknowledgeAlert && (
        <div className="w-full max-w-md mb-4 bg-green-500 text-white p-4 rounded-xl shadow-lg animate-bounce">
          <p className="font-bold text-center">
            {lang === 'ar' ? '✅ تم تأكيد استلام طلبك بنجاح!' :
             lang === 'tr' ? '✅ Siparişiniz başarıyla alındı!' :
             '✅ Your order has been confirmed!'}
          </p>
        </div>
      )}

      {/* تنبيه إعادة الإرسال */}
      {showResendAlert && (
        <div className="w-full max-w-md mb-4 bg-amber-500 text-white p-4 rounded-xl shadow-lg animate-bounce">
          <p className="font-bold text-center">
            {lang === 'ar' ? ' تذكير: طلبك جاهز! تفضل بالاستلام' :
             lang === 'tr' ? '📤 Hatırlatma: Siparişiniz hazır! Lütfen alın' :
             '📤 Reminder: Your order is ready! Please pick it up'}
          </p>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-200 mb-6">
        <p className="text-gray-500 text-sm font-medium mb-2">{t.customer.orderNumber}</p>
        <p className="text-8xl font-black text-gray-900 mb-6">#{currentOrder.order_number}</p>

        {/* الحالة 1: تم التسليم (مغلق من الكاشير) */}
        {isCompleted ? (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">
              {lang === 'ar' ? 'تم تسليم هذا الطلب ✓' :
               lang === 'tr' ? 'Bu sipariş teslim edildi ✓' :
               'This order has been delivered ✓'}
            </h2>
            <p className="text-gray-600 text-sm">
              {lang === 'ar' ? 'شكراً لك! نتمنى لك وجبة شهية' :
               lang === 'tr' ? 'Teşekkürler! İyi yemekler dileriz' :
               'Thank you! Enjoy your meal'}
            </p>
          </>
        ) : !isReady ? (
          // الحالة 2: قيد التحضير
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t.customer.registered}</h2>
            <p className="text-gray-600 text-sm">{t.customer.willNotify}</p>
          </>
        ) : alreadyAcknowledged ? (
          // الحالة 3: جاهز + تم تأكيد الاستلام
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">
              {lang === 'ar' ? 'تم تأكيد الاستلام ✓' :
               lang === 'tr' ? 'Teslim Alındı ✓' :
               'Received ✓'}
            </h2>
            <p className="text-gray-600 text-sm">
              {lang === 'ar' ? 'شكراً لك! نتمنى لك وجبة شهية' :
               lang === 'tr' ? 'Teşekkürler! İyi yemekler dileriz' :
               'Thank you! Enjoy your meal'}
            </p>
          </>
        ) : (
          // الحالة 4: جاهز + لم يُؤكد بعد
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-500 mb-2">{t.customer.ready}</h2>
            <p className="text-gray-600 text-sm mb-6">{t.customer.pickup}</p>

            <button
              onClick={handleAcknowledge}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-200 text-lg"
            >
              {lang === 'ar' ? '✓ تأكيد الاستلام' :
               lang === 'tr' ? '✓ Aldığımı Onayla' :
               '✓ Confirm Receipt'}
            </button>
          </>
        )}
      </div>

      {/* شريط الحالة */}
      {!isCompleted && (
        <div className={`w-full max-w-md rounded-2xl p-4 flex items-center justify-between mb-6 border-2 ${
          isReady ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isReady ? 'bg-red-500' : 'bg-amber-500'}`}></div>
            <span className={`font-bold ${isReady ? 'text-red-700' : 'text-amber-700'}`}>
              {isReady ? t.customer.readyStatus : t.customer.waitingStatus}
            </span>
          </div>
          <svg className={`w-6 h-6 ${isReady ? 'text-red-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}

      {/* Timeline - لا يظهر إذا تم التسليم */}
      {!isCompleted && (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-0"></div>
            <div className="absolute top-6 left-0 h-1 bg-red-500 -z-0 transition-all duration-500" style={{ width: isReady ? '100%' : '50%' }}></div>

            <div className="flex flex-col items-center relative z-10">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-red-500 text-white shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center">{t.customer.stepOrdered}</span>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-md ${isReady ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center">{t.customer.stepPreparing}</span>
            </div>

            <div className="flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-md ${isReady ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center">{t.customer.stepReady}</span>
            </div>
          </div>
        </div>
      )}

      {/* زر تتبع طلب آخر */}
      <button
        onClick={handleReset}
        className="mt-6 w-full max-w-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-2xl transition"
      >
        {lang === 'ar' ? 'تتبّع طلب آخر' : lang === 'tr' ? 'Başka Sipariş Takip Et' : 'Track Another Order'}
      </button>
    </div>
  );
}