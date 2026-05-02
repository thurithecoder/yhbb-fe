import * as React from 'react';
import { RouterProvider } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { router } from '@/app/router';
import Providers from '@/app/providers';

export default function App() {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
