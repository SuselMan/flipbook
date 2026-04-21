import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

export const countryList = Object.entries(countries.getNames('en', { select: 'official' }))
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

export const countryMap = Object.fromEntries(
    countryList.map((c) => [c.code, c.name]),
);

export const countryName = (code) => (code ? countryMap[code] || code : null);

export const flagEmoji = (code) => {
    if (!code || code.length !== 2) return '';
    const upper = code.toUpperCase();
    return String.fromCodePoint(
        ...upper.split('').map((c) => 127397 + c.charCodeAt(0)),
    );
};

export const detectCountryFromTimezone = () => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return TZ_TO_COUNTRY[tz] || null;
    } catch {
        return null;
    }
};

const TZ_TO_COUNTRY = {
    'Europe/Moscow': 'RU', 'Europe/Samara': 'RU', 'Asia/Yekaterinburg': 'RU',
    'Asia/Novosibirsk': 'RU', 'Asia/Krasnoyarsk': 'RU', 'Asia/Irkutsk': 'RU',
    'Asia/Yakutsk': 'RU', 'Asia/Vladivostok': 'RU', 'Asia/Magadan': 'RU',
    'Asia/Kamchatka': 'RU', 'Europe/Kaliningrad': 'RU',
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
    'America/Los_Angeles': 'US', 'America/Anchorage': 'US', 'Pacific/Honolulu': 'US',
    'America/Phoenix': 'US', 'America/Detroit': 'US',
    'Europe/London': 'GB', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR',
    'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Warsaw': 'PL',
    'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Europe/Minsk': 'BY',
    'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT',
    'Europe/Prague': 'CZ', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
    'Europe/Helsinki': 'FI', 'Europe/Copenhagen': 'DK',
    'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN',
    'Asia/Hong_Kong': 'HK', 'Asia/Singapore': 'SG', 'Asia/Bangkok': 'TH',
    'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH', 'Asia/Dubai': 'AE',
    'Asia/Kolkata': 'IN', 'Asia/Karachi': 'PK',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ',
    'America/Toronto': 'CA', 'America/Vancouver': 'CA',
    'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR',
    'America/Buenos_Aires': 'AR', 'America/Argentina/Buenos_Aires': 'AR',
    'Asia/Tashkent': 'UZ', 'Asia/Almaty': 'KZ', 'Asia/Tbilisi': 'GE',
    'Asia/Yerevan': 'AM', 'Asia/Baku': 'AZ', 'Asia/Tel_Aviv': 'IL',
    'Asia/Jerusalem': 'IL', 'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA',
};
