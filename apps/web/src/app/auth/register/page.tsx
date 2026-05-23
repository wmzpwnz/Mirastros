'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../auth.css';
import {
  Button as DSButton,
  Input as DSInput,
  Checkbox as DSCheckbox,
  Label as DSLabel,
  DatePicker as DSDatePicker,
  Select as DSSelect
} from '@mirastros-universal/design-system';
import Image from 'next/image';

const Button = DSButton as any;
const Input = DSInput as any;
const Checkbox = DSCheckbox as any;
const Label = DSLabel as any;
const DatePicker = DSDatePicker as any;
const Select = DSSelect as any;
import { Background3D } from '../../../components/Background3D';
import { api } from '../../../services/api';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    country?: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    // Step 1
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    preferredLanguage: 'ru',
    timezone: 'UTC',
    acceptTerms: false,
    // Step 2
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    birthHour: '',
    birthMinute: '',
    birthCity: '',
    birthLocation: null as { city: string; country: string; latitude: number; longitude: number } | null,
    // Additional astrological data
    gender: '',
    knownZodiacSign: '',
    lifeGoal: '',
    relationshipStatus: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Detect timezone and default language
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const lang = navigator.language.split('-')[0];
      const supportedLangs = ['ru', 'en', 'es', 'pt'];

      setFormData(prev => ({
        ...prev,
        timezone: tz || 'UTC',
        preferredLanguage: supportedLangs.includes(lang) ? lang : 'ru'
      }));
    } catch (err) {
      console.warn('Failed to detect timezone/language:', err);
    }
  }, []);

  // no-op (was constellation focus)

  // Geocoding using Nominatim (OpenStreetMap) - бесплатный
  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=ru`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowLocationSuggestions(true);
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  const selectLocation = (suggestion: LocationSuggestion) => {
    const city = suggestion.address?.city || suggestion.display_name.split(',')[0];
    const country = suggestion.address?.country || suggestion.display_name.split(',').pop()?.trim() || '';

    setFormData({
      ...formData,
      birthCity: suggestion.display_name,
      birthLocation: {
        city,
        country,
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
      },
    });
    setShowLocationSuggestions(false);
  };

  const handleValueChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');

    // Auto-search location
    if (name === 'birthCity' && typeof value === 'string' && value) {
      searchLocation(value);
    }
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Пожалуйста, заполните все обязательные поля');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('Необходимо принять условия использования');
      return false;
    }

    return true;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep1()) {
      return;
    }

    setLoading(true);

    try {
      // Register user with basic data
      const response = await api.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        preferredLanguage: formData.preferredLanguage,
        timezone: formData.timezone,
      });

      // Tokens + user are persisted by ApiClient.register()

      // Move to step 2
      setStep(2);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Ошибка регистрации. Проверьте подключение к серверу и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate date fields
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      setError('Пожалуйста, укажите полную дату рождения');
      return;
    }

    // Validate time fields
    if (formData.birthHour === '' || formData.birthMinute === '') {
      setError('Пожалуйста, укажите время рождения');
      return;
    }

    if (!formData.birthLocation) {
      setError('Пожалуйста, выберите город рождения из списка');
      return;
    }

    // Construct date and time strings
    const birthDate = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, '0')}-${String(formData.birthDay).padStart(2, '0')}`;
    const birthTime = `${String(formData.birthHour).padStart(2, '0')}:${String(formData.birthMinute).padStart(2, '0')}:00`;

    setLoading(true);

    try {
      // Update birth data using api.updateProfile (uses /auth/me PUT)
      await api.updateProfile({
        birthDate,
        birthTime,
        birthLocation: formData.birthLocation,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'mirastros:onboarding:payload',
          JSON.stringify({
            fullName: formData.fullName,
            birthDate,
            birthTime,
            birthLocation: formData.birthLocation,
            gender: formData.gender,
            relationshipStatus: formData.relationshipStatus,
            lifeGoal: formData.lifeGoal,
            knownZodiacSign: formData.knownZodiacSign,
            preferredLanguage: formData.preferredLanguage,
            timezone: formData.timezone,
          })
        );
      }

      router.push('/auth/onboarding');
    } catch (err: any) {
      console.error('Update birth data error:', err);
      setError(err.message || 'Ошибка сохранения данных. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'mirastros:onboarding:payload',
        JSON.stringify({
          fullName: formData.fullName,
          gender: formData.gender,
          relationshipStatus: formData.relationshipStatus,
          lifeGoal: formData.lifeGoal,
          knownZodiacSign: formData.knownZodiacSign,
          preferredLanguage: formData.preferredLanguage,
          timezone: formData.timezone,
        })
      );
    }
    router.push('/auth/onboarding');
  };

  const handleSocialRegister = (provider: string) => {
    // TODO: connect real social registration flows when OAuth credentials are ready.
    alert(provider + ' registration coming soon');
  };

  return (
    <div className="auth-shell">
      <Background3D />
      <div className="auth-bg-wrapper" aria-hidden="true">
        <img src="/backweb.png" alt="" className="auth-bg-img desktop-only" />
        <img src="/backmobile.png" alt="" className="auth-bg-img mobile-only" />
        <div className="auth-bg-overlay" />
        <div className="auth-bg-vignette" />
      </div>
      <div
        className="auth-warp"
        data-loading={loading ? 'true' : 'false'}
        data-error={error ? 'true' : 'false'}
        data-step={String(step)}
        data-page="register"
      >
        <div className="auth-card auth-portal">
          <div className="auth-card-inner space-y-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="auth-logo-img" aria-hidden="true">
            <Image src="/logo.png" alt="Mirastros" width={180} height={64} priority />
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="auth-title font-cinzel text-4xl font-bold text-white mb-2">
            Регистрация
          </h1>
          <p className="auth-subtitle text-gray-400">
            {step === 1 ? 'Создайте аккаунт Mirastros' : 'Астрологические данные (опционально)'}
          </p>
          {step === 2 && (
            <p className="text-sm text-gray-500 mt-2">
              Для персонализированных прогнозов
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-12 rounded ${step >= 1 ? 'bg-mirastros-gold' : 'bg-gray-600'}`} />
          <div className={`h-2 w-12 rounded ${step >= 2 ? 'bg-mirastros-gold' : 'bg-gray-600'}`} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Basic Registration */}
        {step === 1 && (
          <form key="step1" onSubmit={handleStep1Submit} className="mt-8 space-y-6 animate-[ap-enter_520ms_cubic-bezier(0.2,0.9,0.2,1)_both]">
          <div className="space-y-5">
            <div>
              <Label htmlFor="fullName" className="text-base font-medium text-white mb-2 block">Полное имя *</Label>
              <div className="auth-field relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(val: any) => handleValueChange('fullName', val)}
                  placeholder="Иван Иванов"
                  className="auth-input h-14 pl-12 text-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-medium text-white mb-2 block">Email *</Label>
              <div className="auth-field relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(val: any) => handleValueChange('email', val)}
                  placeholder="your@email.com"
                  className="auth-input h-14 pl-12 text-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-base font-medium text-white mb-2 block">Пароль *</Label>
              <div className="auth-field relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(val: any) => handleValueChange('password', val)}
                  placeholder="••••••••"
                  className="auth-input h-14 pl-12 text-lg"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Минимум 8 символов
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-base font-medium text-white mb-2 block">Подтвердите пароль *</Label>
              <div className="auth-field relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(val: any) => handleValueChange('confirmPassword', val)}
                  placeholder="••••••••"
                  className="auth-input h-14 pl-12 text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredLanguage" className="text-sm font-medium text-white mb-2 block">Язык прогнозов</Label>
                <Select
                  id="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={(val: string | number) => handleValueChange('preferredLanguage', val as string)}
                  options={[
                    { value: 'ru', label: 'Русский' },
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'pt', label: 'Português' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="timezone" className="text-sm font-medium text-white mb-2 block">Часовой пояс</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={(val: any) => handleValueChange('timezone', val)}
                  readOnly
                  className="bg-gray-800/50 cursor-not-allowed opacity-70 h-12"
                />
              </div>
            </div>
          </div>

          <label
            htmlFor="acceptTerms"
            className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.06] transition-all duration-200 hover:border-mirastros-gold/30 hover:bg-white/[0.08] focus-within:border-mirastros-gold/40 focus-within:ring-1 focus-within:ring-mirastros-gold/20 mb-4 cursor-pointer"
          >
            <span className="flex-shrink-0">
              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(val: any) => handleValueChange('acceptTerms', !!val)}
                className="!w-6 !h-6 rounded-md border-2 border-white/30 bg-black/30 text-mirastros-gold focus:ring-2 focus:ring-mirastros-gold/50 focus:ring-offset-2 focus:ring-offset-black"
              />
            </span>
            <span className="flex flex-col gap-1 select-none">
              <span className="text-sm leading-relaxed text-gray-200">
                Я принимаю{' '}
                <Link href="/terms" className="text-mirastros-gold hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                  условия использования
                </Link>
                <br />
                и{' '}
                <Link href="/privacy" className="text-mirastros-gold hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                  политику конфиденциальности
                </Link>
              </span>
            </span>
          </label>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full h-14 text-xl font-sans font-normal justify-center text-center shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-all duration-500 bg-mirastros-gold text-black hover:bg-white border-none transform hover:-translate-y-1 active:translate-y-0 uppercase tracking-wider"
            >
              {loading ? 'Регистрация...' : 'Продолжить'}
            </Button>
          </div>

          <div className="auth-divider auth-divider--compact"><span>или</span></div>

          <div className="auth-social-grid auth-social-grid--compact">
            <button type="button" onClick={() => handleSocialRegister('Google')} className="auth-social-btn">
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" onClick={() => handleSocialRegister('Apple')} className="auth-social-btn">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </form>
        )}

        {/* Step 2: Astrological Data */}
        {step === 2 && (
          <form key="step2" onSubmit={handleStep2Submit} className="mt-8 space-y-6 animate-[ap-enter_520ms_cubic-bezier(0.2,0.9,0.2,1)_both]">
            <div className="space-y-6">
              {/* Birth Date - Three Fields */}
              <div className="auth-field">
                <Label className="text-base font-medium text-white mb-3 block">Дата рождения *</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <select
                      value={formData.birthDay || ''}
                      onChange={(e) => handleValueChange('birthDay', e.target.value)}
                      className="auth-select w-full h-14 px-4 rounded-xl text-white text-lg focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">День</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day} className="bg-gray-900">{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={formData.birthMonth || ''}
                      onChange={(e) => handleValueChange('birthMonth', e.target.value)}
                      className="auth-select w-full h-14 px-4 rounded-xl text-white text-lg focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Месяц</option>
                      {[
                        { value: 1, label: 'Январь' },
                        { value: 2, label: 'Февраль' },
                        { value: 3, label: 'Март' },
                        { value: 4, label: 'Апрель' },
                        { value: 5, label: 'Май' },
                        { value: 6, label: 'Июнь' },
                        { value: 7, label: 'Июль' },
                        { value: 8, label: 'Август' },
                        { value: 9, label: 'Сентябрь' },
                        { value: 10, label: 'Октябрь' },
                        { value: 11, label: 'Ноябрь' },
                        { value: 12, label: 'Декабрь' },
                      ].map(month => (
                        <option key={month.value} value={month.value} className="bg-gray-900">{month.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={formData.birthYear || ''}
                      onChange={(e) => handleValueChange('birthYear', e.target.value)}
                      className="auth-select w-full h-14 px-4 rounded-xl text-white text-lg focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Год</option>
                      {Array.from({ length: 100 }, (_, i) => 2025 - i).map(year => (
                        <option key={year} value={year} className="bg-gray-900">{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Birth Time - Two Fields */}
              <div className="auth-field">
                <Label className="text-base font-medium text-white mb-3 block">Время рождения *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select
                      value={formData.birthHour || ''}
                      onChange={(e) => handleValueChange('birthHour', e.target.value)}
                      className="auth-select w-full h-14 px-4 rounded-xl text-white text-lg focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Час</option>
                      {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                        <option key={hour} value={hour} className="bg-gray-900">{String(hour).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={formData.birthMinute || ''}
                      onChange={(e) => handleValueChange('birthMinute', e.target.value)}
                      className="auth-select w-full h-14 px-4 rounded-xl text-white text-lg focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Минута</option>
                      {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                        <option key={minute} value={minute} className="bg-gray-900">{String(minute).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Посмотрите в свидетельстве о рождении
                </p>
              </div>

              <div className="auth-field relative">
                <Label htmlFor="birthCity" className="text-base font-medium text-white mb-3 block">Город рождения *</Label>
                <Input
                  id="birthCity"
                  name="birthCity"
                  type="text"
                  required
                  value={formData.birthCity}
                  onChange={(val: any) => handleValueChange('birthCity', val)}
                  placeholder="Начните вводить название города..."
                  className="auth-input text-lg h-14"
                />
                {locationLoading && (
                  <p className="mt-2 text-xs text-gray-400">Поиск...</p>
                )}

                {/* Location Suggestions */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="auth-location-suggestions absolute w-full mt-2 rounded-xl max-h-52 overflow-y-auto shadow-2xl">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocation(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-gray-200 border-b border-white/5 last:border-0"
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <Label className="text-base font-medium text-white mb-3 block">Пол</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleValueChange('gender', 'male')}
                    className={`h-14 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
                      formData.gender === 'male'
                        ? 'bg-mirastros-gold/20 border-mirastros-gold text-mirastros-gold'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>♂</span> Мужской
                  </button>
                  <button
                    type="button"
                    onClick={() => handleValueChange('gender', 'female')}
                    className={`h-14 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 ${
                      formData.gender === 'female'
                        ? 'bg-mirastros-gold/20 border-mirastros-gold text-mirastros-gold'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <span>♀</span> Женский
                  </button>
                </div>
              </div>

              {/* Relationship Status */}
              <div>
                <Label className="text-base font-medium text-white mb-3 block">Семейное положение</Label>
                <select
                  value={formData.relationshipStatus}
                  onChange={(e) => handleValueChange('relationshipStatus', e.target.value)}
                  className="w-full h-14 px-4 bg-white/5 border border-white/20 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-mirastros-gold/50 focus:border-mirastros-gold/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900">Выберите...</option>
                  <option value="single" className="bg-gray-900">В поиске</option>
                  <option value="relationship" className="bg-gray-900">В отношениях</option>
                  <option value="married" className="bg-gray-900">Женат/Замужем</option>
                  <option value="divorced" className="bg-gray-900">В разводе</option>
                </select>
              </div>

              {/* Known Zodiac Sign */}
              <div>
                <Label className="text-base font-medium text-white mb-3 block">Знаете свой знак зодиака?</Label>
                <select
                  value={formData.knownZodiacSign}
                  onChange={(e) => handleValueChange('knownZodiacSign', e.target.value)}
                  className="w-full h-14 px-4 bg-white/5 border border-white/20 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-mirastros-gold/50 focus:border-mirastros-gold/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900">Не уверен(а)</option>
                  <option value="aries" className="bg-gray-900">♈ Овен</option>
                  <option value="taurus" className="bg-gray-900">♉ Телец</option>
                  <option value="gemini" className="bg-gray-900">♊ Близнецы</option>
                  <option value="cancer" className="bg-gray-900">♋ Рак</option>
                  <option value="leo" className="bg-gray-900">♌ Лев</option>
                  <option value="virgo" className="bg-gray-900">♍ Дева</option>
                  <option value="libra" className="bg-gray-900">♎ Весы</option>
                  <option value="scorpio" className="bg-gray-900">♏ Скорпион</option>
                  <option value="sagittarius" className="bg-gray-900">♐ Стрелец</option>
                  <option value="capricorn" className="bg-gray-900">♑ Козерог</option>
                  <option value="aquarius" className="bg-gray-900">♒ Водолей</option>
                  <option value="pisces" className="bg-gray-900">♓ Рыбы</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 text-sm mt-6">
                <p className="font-semibold mb-3 text-blue-300 text-base">Автоматически рассчитается:</p>
                <ul className="space-y-2 text-blue-200">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Знак зодиака
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Натальная карта
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Персональные рекомендации
                  </li>
                </ul>
          </div>
        </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <Button
              type="button"
              onClick={handleSkip}
              variant="secondary"
              className="h-14 font-sans font-normal border-white/20 hover:bg-white/10 uppercase tracking-wider text-base"
            >
              Пропустить
            </Button>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="h-14 font-sans font-normal shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-300 bg-mirastros-gold text-black border-none uppercase tracking-wider text-base font-medium"
            >
              {loading ? 'Сохранение...' : 'Завершить'}
            </Button>
          </div>
          </form>
        )}

        {/* Login Link */}
        <p className="text-center text-sm text-gray-400">
          Уже есть аккаунт?{' '}
          <Link
            href="/auth/login"
            className="text-mirastros-gold hover:text-mirastros-gold/80 font-medium transition"
          >
            Войти
          </Link>
        </p>
      </div>
	    </div>
	    </div>
	    </div>
	  );
}
