import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "listing": "Listing",
        "pages": "Pages",
        "blog": "Blog",
        "contact": "Contact",
        "profile": "My Profile",
        "admin": "Admin Panel",
        "dashboard": "Dashboard",
        "restaurant_panel": "Restaurant Panel",
        "logout": "Log out"
      },
      "hero": {
        "title": "Discover & Book",
        "subtitle": "The best Middle Eastern restaurants at the best price",
        "search_placeholder": "What are you looking for...",
        "address_placeholder": "Address, neighborhood...",
        "search_button": "Search"
      },
      "categories": {
        "title": "Popular Categories",
        "subtitle": "From street food to fine dining — find your flavour"
      },
      "restaurants": {
        "popular_title": "Popular Restaurants",
        "popular_subtitle": "Handpicked favourites across the city",
        "view_all": "View All",
        "open": "Now: Open",
        "closed": "Now: Closed",
        "reviews": "Reviews"
      },
      "deals": {
        "title": "Our Very Best Deals",
        "subtitle": "Handpicked favourites across the city"
      },
      "cta": {
        "restaurants_count": "More than 3000 Restaurants",
        "book_easily": "Book a table easily at the best price",
        "owner_title": "Are you a Restaurant Owner?",
        "owner_desc": "Join Yalla Habibi to increase your online visibility. You'll have access to even more customers who are looking to enjoy authentic Middle Eastern cuisine at home.",
        "read_more": "Read More"
      },
      "favorites": {
        "title": "My Favorites",
        "empty": "You haven't added any favorites yet."
      }
    }
  },
  ar: {
    translation: {
      "nav": {
        "home": "الرئيسية",
        "listing": "القائمة",
        "pages": "الصفحات",
        "blog": "المدونة",
        "contact": "اتصل بنا",
        "profile": "ملفي الشخصي",
        "admin": "لوحة الإدارة",
        "dashboard": "لوحة التحكم",
        "restaurant_panel": "لوحة المطعم",
        "logout": "تسجيل الخروج"
      },
      "hero": {
        "title": "اكتشف واحجز",
        "subtitle": "أفضل المطاعم الشرق أوسطية بأفضل الأسعار",
        "search_placeholder": "عما تبحث...",
        "address_placeholder": "العنوان، الحي...",
        "search_button": "بحث"
      },
      "categories": {
        "title": "الفئات الشائعة",
        "subtitle": "من أكل الشارع إلى المطاعم الفاخرة - ابحث عن نكهتك"
      },
      "restaurants": {
        "popular_title": "المطاعم الشائعة",
        "popular_subtitle": "مفضلات مختارة بعناية في جميع أنحاء المدينة",
        "view_all": "عرض الكل",
        "open": "مفتوح الآن",
        "closed": "مغلق الآن",
        "reviews": "تقييمات"
      },
      "deals": {
        "title": "أفضل عروضنا",
        "subtitle": "مفضلات مختارة بعناية في جميع أنحاء المدينة"
      },
      "cta": {
        "restaurants_count": "أكثر من 3000 مطعم",
        "book_easily": "احجز طاولتك بسهولة وبأفضل الأسعار",
        "owner_title": "هل أنت صاحب مطعم؟",
        "owner_desc": "انضم إلى يلا حبيبي لزيادة ظهورك على الإنترنت. ستتمكن من الوصول إلى المزيد من العملاء الذين يتطلعون للاستمتاع بالمأكولات الشرق أوسطية الأصيلة في المنزل.",
        "read_more": "اقرأ المزيد"
      },
      "favorites": {
        "title": "مفضلاتي",
        "empty": "لم تقم بإضافة أي مفضلات بعد."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
