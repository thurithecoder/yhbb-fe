import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        listing: 'Listing',
        pages: 'Pages',
        blog: 'Blog',
        contact: 'Contact',
        profile: 'My Profile',
        admin: 'Admin Panel',
        dashboard: 'Dashboard',
        restaurant_panel: 'Restaurant Panel',
        vouchers: 'Vouchers',
        login: 'Login',
        logout: 'Log out',
        favorites: 'Favorites',
      },
      auth: {
        welcome_title: 'Welcome Habibi',
        welcome_subtitle: 'Join our community of food lovers',
        login: 'Login',
        register: 'Register',
        login_submit: 'Log In',
        register_submit: 'Create Account',
      },
      hero: {
        title: 'Discover & Book',
        subtitle: 'The best Middle Eastern restaurants at the best price',
        search_placeholder: 'What are you looking for...',
        address_placeholder: 'Address, neighborhood...',
        search_button: 'Search',
      },
      categories: {
        title: 'Popular Categories',
        subtitle: 'From street food to fine dining - find your flavour',
      },
      restaurants: {
        popular_title: 'Popular Restaurants',
        popular_subtitle: 'Handpicked favourites across the city',
        view_all: 'View All',
        open: 'Now: Open',
        closed: 'Now: Closed',
        reviews: 'Reviews',
      },
      deals: {
        title: 'Our Very Best Deals',
        subtitle: 'Handpicked favourites across the city',
      },
      cta: {
        restaurants_count: 'More than 3000 Restaurants',
        book_easily: 'Book a table easily at the best price',
        owner_title: 'Are you a Restaurant Owner?',
        owner_desc:
          "Join Yalla Habibi to increase your online visibility. You'll have access to even more customers who are looking to enjoy authentic Middle Eastern cuisine at home.",
        read_more: 'Read More',
      },
      favorites: {
        title: 'My Favorites',
        empty: "You haven't added any favorites yet.",
      },
    },
  },
  ar: {
    translation: {
      nav: {
        home: 'الرئيسية',
        listing: 'القائمة',
        pages: 'الصفحات',
        blog: 'المدونة',
        contact: 'اتصل بنا',
        profile: 'ملفي الشخصي',
        admin: 'لوحة الإدارة',
        dashboard: 'لوحة التحكم',
        restaurant_panel: 'لوحة المطعم',
        vouchers: 'القسائم',
        login: 'تسجيل الدخول',
        logout: 'تسجيل الخروج',
        favorites: 'المفضلة',
      },
      auth: {
        welcome_title: 'مرحبا حبيبي',
        welcome_subtitle: 'انضم إلى مجتمع محبي الطعام',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        login_submit: 'تسجيل الدخول',
        register_submit: 'إنشاء الحساب',
      },
      hero: {
        title: 'اكتشف واحجز',
        subtitle: 'أفضل مطاعم الشرق الأوسط بأفضل الأسعار',
        search_placeholder: 'عم تبحث...',
        address_placeholder: 'العنوان، الحي...',
        search_button: 'بحث',
      },
      categories: {
        title: 'الفئات الشائعة',
        subtitle: 'من أكل الشارع إلى المطاعم الفاخرة - ابحث عن نكهتك',
      },
      restaurants: {
        popular_title: 'المطاعم الشائعة',
        popular_subtitle: 'اختيارات مفضلة بعناية في أنحاء المدينة',
        view_all: 'عرض الكل',
        open: 'مفتوح الآن',
        closed: 'مغلق الآن',
        reviews: 'تقييمات',
      },
      deals: {
        title: 'أفضل عروضنا',
        subtitle: 'اختيارات مفضلة بعناية في أنحاء المدينة',
      },
      cta: {
        restaurants_count: 'أكثر من 3000 مطعم',
        book_easily: 'احجز طاولتك بسهولة وبأفضل الأسعار',
        owner_title: 'هل أنت صاحب مطعم؟',
        owner_desc:
          'انضم إلى يلا حبيبي لزيادة ظهورك على الإنترنت والوصول إلى مزيد من العملاء الباحثين عن المأكولات الشرق أوسطية الأصيلة.',
        read_more: 'اقرأ المزيد',
      },
      favorites: {
        title: 'مفضلتي',
        empty: 'لم تضف أي عناصر إلى المفضلة بعد.',
      },
    },
  },
};

const uiTextTranslations: Record<string, string> = {
  'Home': 'الرئيسية',
  'Listing': 'القائمة',
  'Pages': 'الصفحات',
  'Blog': 'المدونة',
  'Contact': 'اتصل بنا',
  'My Profile': 'ملفي الشخصي',
  'Admin Panel': 'لوحة الإدارة',
  'Restaurant Panel': 'لوحة المطعم',
  'Restaurant Hub': 'مركز المطعم',
  'Dashboard': 'لوحة التحكم',
  'Vouchers': 'القسائم',
  'Login': 'تسجيل الدخول',
  'Log In': 'تسجيل الدخول',
  'Register': 'إنشاء حساب',
  'Log Out': 'تسجيل الخروج',
  'Log out': 'تسجيل الخروج',
  'Favorites': 'المفضلة',
  'Overview': 'نظرة عامة',
  'Profile': 'الملف الشخصي',
  'Edit Profile': 'تعديل الملف الشخصي',
  'Restaurants': 'المطاعم',
  'Catalog': 'الكتالوج',
  'Menu Requests': 'طلبات القائمة',
  'Menu Items': 'عناصر القائمة',
  'Campaign Requests': 'طلبات الحملات',
  'Campaign': 'الحملة',
  'Promotions': 'العروض',
  'Verification': 'التحقق',
  'Gallery': 'المعرض',
  'Scan Coupon': 'مسح القسيمة',
  'Coupon Tracking': 'تتبع القسائم',
  'Yalla Habibi': 'يلا حبيبي',

  'Welcome Habibi': 'مرحبا حبيبي',
  'Join our community of food lovers': 'انضم إلى مجتمع محبي الطعام',
  'Forgot Password': 'نسيت كلمة المرور',
  'Reset Password': 'إعادة تعيين كلمة المرور',
  'We will send a one-time reset code to your email.': 'سنرسل رمز إعادة تعيين لمرة واحدة إلى بريدك الإلكتروني.',
  'Enter the OTP from your email and choose a new password.': 'أدخل رمز OTP من بريدك الإلكتروني واختر كلمة مرور جديدة.',
  'Email Address': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Confirm Password': 'تأكيد كلمة المرور',
  'New Password': 'كلمة مرور جديدة',
  'Forgot password?': 'نسيت كلمة المرور؟',
  'Please wait...': 'يرجى الانتظار...',
  'Create Account': 'إنشاء الحساب',
  'Next Step': 'الخطوة التالية',
  'Back': 'رجوع',
  'Send OTP': 'إرسال الرمز',
  'Sending...': 'جار الإرسال...',
  'Updating...': 'جار التحديث...',
  'OTP Code': 'رمز OTP',
  'Resend': 'إعادة الإرسال',
  'First Name': 'الاسم الأول',
  'Last Name': 'اسم العائلة',
  'Restaurant Name': 'اسم المطعم',
  'Location': 'الموقع',
  'Choose Location': 'اختر الموقع',
  'User': 'مستخدم',
  'Restaurant': 'مطعم',
  'Work Time': 'وقت العمل',
  'From': 'من',
  'To': 'إلى',
  'Phone Number': 'رقم الهاتف',
  'Cuisine': 'المطبخ',
  'Select Image': 'اختر صورة',
  'Change Image': 'تغيير الصورة',
  'Upload': 'رفع',
  'Click to select restaurant image': 'اضغط لاختيار صورة المطعم',
  'Terms of Service': 'شروط الخدمة',
  'By continuing, you agree to our Terms of Service': 'بالمتابعة، أنت توافق على شروط الخدمة',

  'Discover & Book': 'اكتشف واحجز',
  'The best Middle Eastern restaurants at the best price': 'أفضل مطاعم الشرق الأوسط بأفضل الأسعار',
  'Search': 'بحث',
  'Popular Categories': 'الفئات الشائعة',
  'Popular Restaurants': 'المطاعم الشائعة',
  'Handpicked favourites across the city': 'اختيارات مفضلة بعناية في أنحاء المدينة',
  'View All': 'عرض الكل',
  'Loading restaurants...': 'جار تحميل المطاعم...',
  'More than': 'أكثر من',
  'live restaurants': 'مطاعم نشطة',
  'Browse restaurant profiles, promotions, and approved menu items.': 'تصفح ملفات المطاعم والعروض وعناصر القائمة المعتمدة.',
  'Restaurant owners,': 'أصحاب المطاعم،',
  'manage it all from their panel': 'يديرون كل شيء من لوحتهم',
  'Profile updates, promotions, menu change requests, and marketing submissions now run through the restaurant panel.':
    'تحديثات الملف الشخصي والعروض وطلبات تعديل القائمة وطلبات التسويق تتم الآن من خلال لوحة المطعم.',
  'Open Restaurant Panel': 'افتح لوحة المطعم',
  'Our Very Best Deals': 'أفضل عروضنا',

  'Loading restaurant...': 'جار تحميل المطعم...',
  'Restaurant not found.': 'لم يتم العثور على المطعم.',
  'Verified': 'تم التحقق',
  'Awaiting review': 'بانتظار المراجعة',
  'Address not set': 'العنوان غير محدد',
  'Hours not set': 'الساعات غير محددة',
  'Phone not set': 'الهاتف غير محدد',
  'Not set': 'غير محدد',
  'All': 'الكل',
  'menu': 'القائمة',
  'promotions': 'العروض',
  'images': 'الصور',
  'about': 'حول',
  'Approved Menu Items': 'عناصر القائمة المعتمدة',
  'No approved menu items for this category yet.': 'لا توجد عناصر قائمة معتمدة لهذه الفئة بعد.',
  'No promotions published yet.': 'لا توجد عروض منشورة بعد.',
  'No images uploaded yet.': 'لم يتم رفع صور بعد.',
  'Restaurant Info': 'معلومات المطعم',
  'Summary': 'الملخص',
  'Menu Count': 'عدد عناصر القائمة',
  'Latest Promo Ends': 'ينتهي أحدث عرض',
  'Sample Price': 'سعر عينة',
  'active': 'نشط',

  'My Favorites': 'مفضلتي',
  "You haven't added any favorites yet.": 'لم تضف أي عناصر إلى المفضلة بعد.',
  'Loading admin panel...': 'جار تحميل لوحة الإدارة...',
  'Loading restaurant panel...': 'جار تحميل لوحة المطعم...',
  'Open menu': 'فتح القائمة',
  'Close menu': 'إغلاق القائمة',
  'Edit': 'تعديل',
  'Delete': 'حذف',
  'Save': 'حفظ',
  'Cancel': 'إلغاء',
  'Submit': 'إرسال',
  'Create': 'إنشاء',
  'Update': 'تحديث',
  'Approve': 'قبول',
  'Reject': 'رفض',
  'Pending': 'قيد الانتظار',
  'Approved': 'معتمد',
  'Rejected': 'مرفوض',
  'Status': 'الحالة',
  'Actions': 'الإجراءات',
  'Name': 'الاسم',
  'Description': 'الوصف',
  'Price': 'السعر',
  'Category': 'الفئة',
  'Image': 'الصورة',
  'Title': 'العنوان',
  'Message': 'الرسالة',
  'Budget': 'الميزانية',
  'Start Date': 'تاريخ البداية',
  'End Date': 'تاريخ النهاية',
  'Discount': 'الخصم',
  'Claim': 'الحصول على القسيمة',
  'Claimed': 'تم الحصول عليها',
  'Use Coupon': 'استخدم القسيمة',
};

const reverseUiTextTranslations = Object.fromEntries(
  Object.entries(uiTextTranslations).map(([english, arabic]) => [arabic, english])
);

const dynamicTranslations: Array<{
  en: RegExp;
  arPattern: RegExp;
  toAr: (...matches: string[]) => string;
  toEn: (...matches: string[]) => string;
}> = [
    {
      en: /^More than (\d+) live restaurants$/,
      arPattern: /^أكثر من (\d+) مطاعم نشطة$/,
      toAr: (_: string, count: string) => `أكثر من ${count} مطاعم نشطة`,
      toEn: (_: string, count: string) => `More than ${count} live restaurants`,
    },
    {
      en: /^(\d+) Menu Items$/,
      arPattern: /^(\d+) عناصر قائمة$/,
      toAr: (_: string, count: string) => `${count} عناصر قائمة`,
      toEn: (_: string, count: string) => `${count} Menu Items`,
    },
    {
      en: /^(\d+) image(s?)$/,
      arPattern: /^(\d+) صور$/,
      toAr: (_: string, count: string) => `${count} صور`,
      toEn: (_: string, count: string) => `${count} images`,
    },
    {
      en: /^(\d+) active$/,
      arPattern: /^(\d+) نشط$/,
      toAr: (_: string, count: string) => `${count} نشط`,
      toEn: (_: string, count: string) => `${count} active`,
    },
    {
      en: /^(\d+) promotion\(s\) live$/,
      arPattern: /^(\d+) عروض نشطة$/,
      toAr: (_: string, count: string) => `${count} عروض نشطة`,
      toEn: (_: string, count: string) => `${count} promotion(s) live`,
    },
    {
      en: /^Code expires in (.+)$/,
      arPattern: /^ينتهي الرمز خلال (.+)$/,
      toAr: (_: string, time: string) => `ينتهي الرمز خلال ${time}`,
      toEn: (_: string, time: string) => `Code expires in ${time}`,
    },
  ];

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function translateText(value: string, language: string) {
  const normalized = normalizeText(value);
  if (!normalized) return value;

  const translated =
    language === 'ar'
      ? uiTextTranslations[normalized] || translateDynamic(normalized)
      : reverseUiTextTranslations[normalized] || translateDynamic(normalized, 'en');

  if (!translated || translated === normalized) return value;

  const prefix = value.match(/^\s*/)?.[0] ?? '';
  const suffix = value.match(/\s*$/)?.[0] ?? '';
  return `${prefix}${translated}${suffix}`;
}

function translateDynamic(value: string, language = 'ar') {
  for (const rule of dynamicTranslations) {
    const match = value.match(language === 'ar' ? rule.en : rule.arPattern);
    if (match) return language === 'ar' ? rule.toAr(...match) : rule.toEn(...match);
  }
  return undefined;
}

function shouldSkipElement(element: Element | null) {
  if (!element) return true;
  return Boolean(element.closest('script, style, noscript, svg, code, pre, [data-i18n-skip]'));
}

export function applyDocumentTranslations(language = i18n.language) {
  if (typeof document === 'undefined') return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!shouldSkipElement(node.parentElement)) {
      textNodes.push(node);
    }
  }

  textNodes.forEach((node) => {
    node.nodeValue = translateText(node.nodeValue || '', language);
  });

  document.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label], [alt]').forEach((element) => {
    if (shouldSkipElement(element)) return;
    ['placeholder', 'title', 'aria-label', 'alt'].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;

      const originalKey = `i18nOriginal${attribute.replace(/[^a-z]/gi, '')}`;
      if (language === 'ar') {
        if (!element.dataset[originalKey]) element.dataset[originalKey] = value;
        element.setAttribute(attribute, translateText(element.dataset[originalKey] || value, language));
      } else if (element.dataset[originalKey]) {
        element.setAttribute(attribute, element.dataset[originalKey] || value);
      } else {
        element.setAttribute(attribute, translateText(value, language));
      }
    });
  });
}

let observer: MutationObserver | null = null;
let isApplyingTranslations = false;
let queuedFrame: number | null = null;

export function startDocumentTranslationObserver(language = i18n.language) {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => { };

  // In startDocumentTranslationObserver, the scheduleApply should read from i18n directly:
  const scheduleApply = () => {
    if (isApplyingTranslations || queuedFrame !== null) return;
    queuedFrame = window.requestAnimationFrame(() => {
      queuedFrame = null;
      isApplyingTranslations = true;
      applyDocumentTranslations(i18n.language); // ✅ reads current language from singleton
      isApplyingTranslations = false;
    });
  };

  observer?.disconnect();
  applyDocumentTranslations(language);
  observer = new MutationObserver(scheduleApply);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['placeholder', 'title', 'aria-label', 'alt'],
  });

  return () => {
    observer?.disconnect();
    observer = null;
    if (queuedFrame !== null) {
      window.cancelAnimationFrame(queuedFrame);
      queuedFrame = null;
    }
  };
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
