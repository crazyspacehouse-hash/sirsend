"use client";
import Link from 'next/link';
import ScrollToTop from '@/components/ScrollToTop';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';

export default function HomePage() {
  const { t, lang } = useTranslation();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t.siteName}</h1>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-red-500 transition">{t.nav.features}</a>
            <a href="#how-it-works" className="hover:text-red-500 transition">{t.nav.howItWorks}</a>
            <a href="#pricing" className="hover:text-red-500 transition">{t.nav.pricing}</a>
            <a href="#faq" className="hover:text-red-500 transition">{t.nav.faq}</a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-red-500 transition hidden sm:block">
              {t.auth.login}
            </Link>
            <Link
              href="/register"
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-red-200"
            >
              {t.auth.register}
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-red-100">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {t.hero.badge}
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                {t.hero.title1} <br />
                <span className="text-red-500">{t.hero.title2}</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/register"
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition shadow-xl shadow-red-200 text-center text-lg"
                >
                  {t.hero.ctaPrimary}
                </Link>
                <Link
                  href="/customer/demo"
                  className="bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-8 rounded-xl transition border-2 border-gray-200 text-center text-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t.hero.ctaSecondary}
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t.hero.noCreditCard}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t.hero.quickSetup}
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative">
              <div className="relative mx-auto w-72">
                <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    <div className="bg-gray-900 text-white p-6 text-center">
                      <div className="text-xs text-gray-400 mb-1">{t.customer.orderNumber}</div>
                      <div className="text-lg font-bold">#101</div>
                    </div>
                    <div className="p-8 text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{t.customer.orderNumber}</div>
                      <div className="text-7xl font-black text-gray-900 mb-4">#101</div>
                      <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full font-bold text-sm border border-amber-200">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        {t.customer.waitingStatus}
                      </div>
                      <div className="mt-6 bg-red-50 rounded-2xl p-4 border border-red-100">
                        <div className="text-red-800 font-bold text-lg">
                          {lang === 'ar' ? 'خذ راحتك… بنناديك' : lang === 'tr' ? 'Rahat olun... sizi çağıracağız' : 'Relax... we will call you'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-bounce">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{t.customer.readyStatus}</div>
                      <div className="font-bold text-gray-900">#101</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        {lang === 'ar' ? 'بدون تطبيق' : lang === 'tr' ? 'Uygulamasız' : 'No App'}
                      </div>
                      <div className="font-bold text-gray-900">QR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-gray-900 mb-1">+250</div>
              <div className="text-sm text-gray-500">{t.stats.restaurants}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-gray-900 mb-1">50K+</div>
              <div className="text-sm text-gray-500">{t.stats.orders}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-gray-900 mb-1">
                4 {lang === 'ar' ? 'د' : lang === 'tr' ? 'dk' : 'min'}
              </div>
              <div className="text-sm text-gray-500">{t.stats.waitTime}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-gray-900 mb-1">98%</div>
              <div className="text-sm text-gray-500">{t.stats.satisfaction}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-red-100">
              {t.howItWorks.badge}
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.howItWorks.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.howItWorks.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 h-full">
              <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-red-200">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.howItWorks.step1Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.howItWorks.step1Desc}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 h-full">
              <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-red-200">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.howItWorks.step2Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.howItWorks.step2Desc}</p>
            </div>

            <div className="bg-gray-900 rounded-3xl p-8 shadow-xl h-full text-white">
              <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-6 shadow-lg">3</div>
              <h3 className="text-xl font-bold mb-3">{t.howItWorks.step3Title}</h3>
              <p className="text-gray-300 leading-relaxed">{t.howItWorks.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-red-100">
              {t.features.badge}
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.features.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.features.description}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.items.map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-red-100">
              {t.comparison.badge}
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.comparison.title}</h2>
            <p className="text-lg text-gray-600">{t.comparison.description}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-200">
            <div className="grid grid-cols-3 bg-gray-900 text-white">
              <div className="p-6 font-bold">{t.comparison.feature}</div>
              <div className="p-6 font-bold text-center bg-red-500">{t.comparison.sira}</div>
              <div className="p-6 font-bold text-center">{t.comparison.pager}</div>
            </div>
            {t.comparison.rows.map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-t border-gray-200">
                <div className="p-6 font-medium text-gray-900">{row.feature}</div>
                <div className="p-6 text-center bg-red-50 text-red-900 font-semibold flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {row.sira}
                </div>
                <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {row.pager}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-red-100">
              {t.pricing.badge}
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.pricing.title}</h2>
            <p className="text-lg text-gray-600">{t.pricing.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-red-500 transition">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t.pricing.basic}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-gray-900">$16</span>
                <span className="text-gray-500">{t.pricing.perMonth}</span>
              </div>
              <p className="text-gray-600 mb-6 text-sm">{t.pricing.basicDesc}</p>
              <ul className="space-y-3 mb-8">
                {t.pricing.features.basic.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full bg-gray-100 hover:bg-red-500 hover:text-white text-gray-900 font-bold py-3 rounded-xl transition text-center">
                {t.pricing.startNow}
              </Link>
            </div>

            <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-black px-4 py-1 rounded-full">
                {t.pricing.mostPopular}
              </div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{t.pricing.pro}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-white">$29</span>
                <span className="text-gray-400">{t.pricing.perMonth}</span>
              </div>
              <p className="text-gray-300 mb-6 text-sm">{t.pricing.proDesc}</p>
              <ul className="space-y-3 mb-8">
                {t.pricing.features.pro.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition text-center">
                {t.pricing.startNow}
              </Link>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-red-500 transition">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t.pricing.enterprise}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-gray-900">{t.pricing.custom}</span>
              </div>
              <p className="text-gray-600 mb-6 text-sm">{t.pricing.enterpriseDesc}</p>
              <ul className="space-y-3 mb-8">
                {t.pricing.features.enterprise.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full bg-gray-100 hover:bg-red-500 hover:text-white text-gray-900 font-bold py-3 rounded-xl transition text-center">
                {t.pricing.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-red-100">
              {t.faq.badge}
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">{t.faq.title}</h2>
            <p className="text-lg text-gray-600">{t.faq.description}</p>
          </div>

          <div className="space-y-4">
            {t.faq.items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 transition">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.q}</h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">{t.cta.title}</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">{t.cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-xl transition shadow-xl text-lg">
              {t.cta.primary}
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl transition border-2 border-white/30 text-lg">
              {t.cta.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">S</span>
                </div>
                <h3 className="text-xl font-black">{t.siteName}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{t.footer.description}</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t.footer.product}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-red-500 transition">{t.footer.features}</a></li>
                <li><a href="#pricing" className="hover:text-red-500 transition">{t.footer.pricing}</a></li>
                <li><a href="#" className="hover:text-red-500 transition">{t.footer.updates}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t.footer.company}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition">{t.footer.about}</a></li>
                <li><a href="#" className="hover:text-red-500 transition">{t.footer.blog}</a></li>
                <li><a href="#" className="hover:text-red-500 transition">{t.footer.contact}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition">{t.footer.terms}</a></li>
                <li><a href="#" className="hover:text-red-500 transition">{t.footer.privacy}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 {t.siteName}. {t.footer.rights}.</p>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}