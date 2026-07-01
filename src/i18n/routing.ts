import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['fr', 'ar', 'en', 'es', 'it'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed' // Only prefix non-default locales
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
