"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

type Order = {
  id: number;
  shop_id: string;
  order_number: number;
  status: 'preparing' | 'ready';
  created_at: string;
};

export default function CustomerPage() {
  const params = useParams();
  const shopId = params.shopId as string;
  
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('مطعمك');
  const [isReady, setIsReady] = useState(false);

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

  // تشغيل الصوت والاهتزاز
  const triggerNotification = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play failed:", e));
    
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(restaurantName, {
        body: "طلبك جاهز للاستلام!",
      });
    }
  };

  // طلب إذن الإشعارات
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // الاشتراك في Realtime
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order;
            if (newOrder.shop_id === shopId && newOrder.status === 'preparing') {
              setCurrentOrder(newOrder);
              setIsReady(false);
            }
          }
          
          if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            if (updatedOrder.shop_id === shopId && currentOrder && updatedOrder.id === currentOrder.id) {
              if (updatedOrder.status === 'ready') {
                setIsReady(true);
                triggerNotification();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, currentOrder]);

  // --- الحالة الأولى: في انتظار مسح الكود ---
  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Decorative leaves */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
          <svg viewBox="0 0 100 100" fill="#4a7c59">
            <path d="M50 0 C30 20, 20 40, 50 100 C80 40, 70 20, 50 0 Z" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 rotate-180">
          <svg viewBox="0 0 100 100" fill="#4a7c59">
            <path d="M50 0 C30 20, 20 40, 50 100 C80 40, 70 20, 50 0 Z" />
          </svg>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full relative z-10">
          <div className="w-20 h-20 bg-[#f5f1e8] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#2d5a4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{restaurantName}</h2>
          <p className="text-gray-500 mb-6">بانتظار ربط الطلب</p>
          <p className="text-sm text-gray-400">
            امسح رمز QR الموجود على الطاولة لربط جوالك بالطلب
          </p>
        </div>
      </div>
    );
  }

  // --- الحالة الثانية: الطلب قيد التحضير أو جاهز ---
  return (
    <div className="min-h-screen bg-[#f5f1e8] flex flex-col items-center p-6 relative overflow-hidden">
      {/* Decorative leaves - top left */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-15 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="#4a7c59">
          <path d="M100 0 C60 40, 40 80, 100 200 C160 80, 140 40, 100 0 Z" />
          <path d="M80 20 C40 60, 20 100, 80 180 C120 100, 100 60, 80 20 Z" opacity="0.5" />
        </svg>
      </div>
      
      {/* Decorative leaves - bottom right */}
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-15 pointer-events-none rotate-180">
        <svg viewBox="0 0 200 200" fill="#4a7c59">
          <path d="M100 0 C60 40, 40 80, 100 200 C160 80, 140 40, 100 0 Z" />
          <path d="M80 20 C40 60, 20 100, 80 180 C120 100, 100 60, 80 20 Z" opacity="0.5" />
        </svg>
      </div>

      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-center gap-3 py-6 relative z-10">
        <div className="w-10 h-10 bg-[#c85a3a] rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#2d5a4a]">{restaurantName}</h1>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 text-center relative z-10 mb-6">
        <p className="text-gray-500 text-sm mb-2">رقم طلبك</p>
        <p className="text-8xl font-black text-[#2d5a4a] mb-6">
          {currentOrder.order_number}
        </p>

        {!isReady ? (
          <>
            {/* Success Icon */}
            <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">تم تسجيل طلبك بنجاح</h2>
            <p className="text-gray-500 text-sm">سيصلك إشعار عند جاهزية الطلب</p>
          </>
        ) : (
          <>
            {/* Ready Icon */}
            <div className="w-16 h-16 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-8 h-8 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#4a7c59] mb-2">طلبك جاهز للاستلام!</h2>
            <p className="text-gray-500 text-sm">تفضل بالاستلام من نقطة التسليم</p>
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="w-full max-w-md bg-[#e8f0e8] rounded-2xl p-4 flex items-center justify-between relative z-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[#4a7c59] rounded-full animate-pulse"></div>
          <span className="font-bold text-[#2d5a4a]">
            {isReady ? 'جاهز للاستلام' : 'بانتظار التحضير'}
          </span>
        </div>
        <svg className="w-6 h-6 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {/* Timeline Steps */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 relative z-10">
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-0"></div>
          <div 
            className="absolute top-6 left-0 h-1 bg-[#4a7c59] -z-0 transition-all duration-500"
            style={{ width: isReady ? '100%' : '50%' }}
          ></div>

          {/* Step 1: Order Placed */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              true ? 'bg-[#2d5a4a] text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600 text-center">تم الطلب</span>
          </div>

          {/* Step 2: Preparing */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              isReady ? 'bg-[#2d5a4a] text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600 text-center">قيد التحضير</span>
          </div>

          {/* Step 3: Ready */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              isReady ? 'bg-[#2d5a4a] text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-gray-600 text-center">جاهز للاستلام</span>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      {isReady && (
        <button
          onClick={() => {
            setIsReady(false);
            setCurrentOrder(null);
          }}
          className="mt-6 w-full max-w-md bg-[#2d5a4a] hover:bg-[#1f3d33] text-white font-bold py-4 rounded-2xl transition shadow-lg relative z-10"
        >
          إغلاق التنبيه
        </button>
      )}
    </div>
  );
}