"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, lang } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { restaurant_name: restaurantName } },
    });

    if (error) setError(error.message);
    else {
      alert(lang === 'ar' ? 'تم إنشاء الحساب! تحقق من بريدك.' : lang === 'tr' ? 'Hesap oluşturuldu! E-postanızı kontrol edin.' : 'Account created! Check your email.');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-200">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900">{t.siteName}</h1>
          <p className="text-gray-600 mt-2">{t.auth.registerTitle}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.auth.restaurantName}</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none"
              placeholder={t.auth.restaurantPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.auth.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none"
              placeholder={t.auth.emailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.auth.passwordHint}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none"
              placeholder={t.auth.passwordPlaceholder}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-200"
          >
            {loading ? t.auth.registering : t.auth.signUp}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {t.auth.hasAccount}{' '}
            <Link href="/login" className="text-red-500 hover:text-red-600 font-bold">{t.auth.loginNow}</Link>
          </p>
        </div>

        <Link href="/" className="block mt-4 text-center text-sm text-gray-500 hover:text-gray-900 transition">
          {t.auth.backHome}
        </Link>
      </div>
    </div>
  );
}