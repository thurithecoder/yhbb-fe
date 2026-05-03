import * as React from 'react';
import { RouterProvider } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { router } from '@/app/router';
import Providers from '@/app/providers';
import { startDocumentTranslationObserver } from '@/i18n';

export default function App() {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    // Update document direction and language attribute
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    // Restart the observer with the new language — this also calls
    // applyDocumentTranslations immediately inside startDocumentTranslationObserver
    const stop = startDocumentTranslationObserver(i18n.language);

    return () => stop(); // Disconnect old observer before starting new one
  }, [i18n.language]); // 👈 Re-run on every language change

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}