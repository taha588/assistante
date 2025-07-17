import React, { useState, useEffect, useMemo } from 'react';
import { getTranslator } from '../services/i18n';
import { countries } from '../data/countries';
import { rates } from '../data/currencyRates';
import { GoogleProfile, AppUser } from '../types';

interface LoginPageProps {
    onLogin: (user: AppUser) => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const basePlans = [
    { id: 'daily', amountEUR: 1, textKey: 'premiumPrice1' },
    { id: 'weekly', amountEUR: 5, textKey: 'premiumPrice2' },
    { id: 'monthly', amountEUR: 10, textKey: 'premiumPrice3' },
];

export const LoginPage = ({ onLogin }: LoginPageProps) => {
    const [step, setStep] = useState(1);
    const [mockProfile, setMockProfile] = useState<GoogleProfile | null>(null);
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [customCountry, setCustomCountry] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [error, setError] = useState('');
    const [lang, setLang] = useState('fr');
    const [currency, setCurrency] = useState('€');
    const [currencyCode, setCurrencyCode] = useState('EUR');
    const [selectedPlanId, setSelectedPlanId] = useState('weekly');

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'fr', 'es', 'de', 'it'].includes(browserLang)) {
            setLang(browserLang);
        }
    }, []);

    useEffect(() => {
        const setDefaults = () => {
            setCurrency('€');
            setCurrencyCode('EUR');
        };

        if (showCustomInput) {
            const trimmedCustomCountry = customCountry.trim().toLowerCase();
            if (trimmedCustomCountry) {
                const countryData = countries.find(c =>
                    Object.values(c.names).some(name => name.toLowerCase() === trimmedCustomCountry)
                );
                if (countryData) {
                    setLang(countryData.languageCode);
                    setCurrency(countryData.currencySymbol);
                    setCurrencyCode(countryData.currencyCode);
                } else {
                    setDefaults();
                }
            } else {
                setDefaults();
            }
        } else { // Logic for dropdown
            if (selectedCountryCode) {
                const countryData = countries.find(c => c.code === selectedCountryCode);
                if (countryData) {
                    setLang(countryData.languageCode);
                    setCurrency(countryData.currencySymbol);
                    setCurrencyCode(countryData.currencyCode);
                } else {
                     setDefaults();
                }
            } else {
                setDefaults();
            }
        }
    }, [customCountry, selectedCountryCode, showCustomInput]);
    
    const t = getTranslator(lang);

    const displayPlans = useMemo(() => {
        const rate = rates[currencyCode] || 1;

        const roundPrice = (price: number) => {
             if (['XOF', 'XAF', 'ARS', 'DZD'].includes(currencyCode)) {
                if (price < 1000) return Math.ceil(price / 10) * 10;
                return Math.ceil(price / 100) * 100;
            }
            return Math.ceil(price);
        }
        
        return basePlans.map(plan => ({
            ...plan,
            amount: roundPrice(plan.amountEUR * rate),
        }));

    }, [currencyCode]);
    
    const selectedPlan = displayPlans.find(p => p.id === selectedPlanId);

    const handleSimulatedLogin = () => {
        const profile: GoogleProfile = {
          name: "Utilisateur",
          email: "user@example.com",
          picture: "", // L'image sera gérée par une icône de repli
          sub: `mock-sub-${Date.now()}`
        };
        setMockProfile(profile);
        setStep(2);
        setError('');
    };

    const handleContinue = () => {
        if (!mockProfile) return;

        let countryData;
        let finalCountryName = '';

        if (showCustomInput) {
            finalCountryName = customCountry.trim();
            if (!finalCountryName) {
                setError(t('errorEnterCountry'));
                return;
            }
            // Try to find matching country data for currency, etc.
            countryData = countries.find(c => Object.values(c.names).some(name => name.toLowerCase() === finalCountryName.toLowerCase()));
        } else {
            if (!selectedCountryCode) {
                setError(t('errorSelectCountry'));
                return;
            }
            countryData = countries.find(c => c.code === selectedCountryCode);
            if (countryData) {
                finalCountryName = countryData.names[lang] || countryData.names['en'];
            }
        }

        if (!finalCountryName) {
            setError(t('errorInvalidCountry'));
            return;
        }
        
        const languageToUse = countryData?.languageCode || lang; // default to current UI lang
        const languageName = countryData?.languageName;
        const currencyToUse = countryData?.currencySymbol || currency;

        const finalUser: AppUser = {
            profile: mockProfile,
            country: finalCountryName,
            language: languageToUse,
            languageName,
            premiumExpiresAt: undefined, // Start without premium
            currencySymbol: currencyToUse,
        };
        onLogin(finalUser);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleContinue();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 py-12">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-sky-700 dark:text-sky-400">{t('appTitle')}</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        {step === 2 ? t('loginPageSubtitleStep2') : t('loginPageSubtitle')}
                    </p>
                </div>
                
                <div className="space-y-6">
                    {step === 1 ? (
                        <div className="flex flex-col items-center space-y-4">
                           <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('loginStep1')}</p>
                           <button onClick={handleSimulatedLogin} className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-500 rounded-full text-slate-700 dark:text-slate-200 font-medium text-base shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-900 transition-colors">
                                <GoogleIcon />
                                {t('buttonConnectGoogle')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="country-input" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('loginStep2')}
                                </label>
                                
                                {showCustomInput ? (
                                     <input
                                        id="country-input"
                                        type="text"
                                        value={customCountry}
                                        onChange={(e) => setCustomCountry(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t('customCountryPlaceholder')}
                                        className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200"
                                        aria-label={t('customCountryAriaLabel')}
                                        autoFocus
                                    />
                                ) : (
                                   <select
                                        id="country-select"
                                        value={selectedCountryCode}
                                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                                        className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-slate-200"
                                        aria-label={t('selectCountryAriaLabel')}
                                    >
                                        <option value="" disabled>{t('selectCountryPlaceholder')}</option>
                                        {countries
                                            .sort((a, b) => (a.names[lang] || a.names['en']).localeCompare(b.names[lang] || b.names['en']))
                                            .map(c => (
                                            <option key={c.code} value={c.code}>{c.names[lang] || c.names['en']}</option>
                                        ))}
                                    </select>
                                )}
                                 <button
                                    onClick={() => setShowCustomInput(!showCustomInput)}
                                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline mt-2 text-left"
                                >
                                    {showCustomInput ? t('linkChooseFromList') : t('linkCountryNotListed')}
                                </button>
                            </div>
                             <div>
                                <button
                                    onClick={handleContinue}
                                    disabled={!(showCustomInput ? customCountry : selectedCountryCode)}
                                    className="w-full px-4 py-3 font-semibold text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                >
                                    {t('continueButton')}
                                </button>
                            </div>
                        </>
                    )}
                     {error && (
                        <p className="text-sm text-red-500 text-center mt-4">{error}</p>
                    )}
                </div>

                {/* Premium Section */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                    <h2 className="text-xl font-bold text-center mb-4 text-slate-800 dark:text-slate-200">{t('premiumTitle')}</h2>
                    
                    <p className="font-semibold">{t('premiumExplanationTitle')}</p>
                    <p className="mb-3">{t('premiumExplanationText')}</p>
                    <ul className="list-none space-y-1 mb-4">
                        <li>{t('premiumFeature1')}</li>
                        <li>{t('premiumFeature2')}</li>
                        <li>{t('premiumFeature3')}</li>
                        <li>{t('premiumFeature5')}</li>
                        <li>{t('premiumFeature6')}</li>
                        <li>{t('premiumFeature7')}</li>
                        <li>{t('premiumFeature4')}</li>
                    </ul>

                    <p className="font-semibold">{t('premiumPricingTitle')}</p>
                    <div className="space-y-2 mb-4">
                        {displayPlans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-150 ${
                                    selectedPlanId === plan.id
                                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-500'
                                }`}
                            >
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {t(plan.textKey, { amount: plan.amount, currency })}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="my-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="https://paypal.me/yourlink" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                           {selectedPlan && t('premiumPaymentButton', { amount: selectedPlan.amount, currency })}
                        </a>
                         <a href="#" target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-6 py-2 bg-slate-700 text-white font-bold rounded-lg shadow-md hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 transition-colors">
                           {selectedPlan && t('premiumPaymentButtonCard', { amount: selectedPlan.amount, currency })}
                        </a>
                    </div>
                    
                    <p className="font-semibold">{t('premiumConfirmationTitle')}</p>
                    <p className="text-xs whitespace-pre-wrap">{t('premiumConfirmationText')}</p>
                </div>


                <div className="text-center text-xs text-slate-500">
                     <p>{t('termsMessage')}</p>
                </div>
            </div>
        </div>
    );
};