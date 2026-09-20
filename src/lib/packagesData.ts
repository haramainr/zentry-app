export const AREAS = ['Regular FS', 'Pro', 'PIK 1 JMS', 'PIK 2 JMS', 'Golf Island'];

export const PACKAGE_CATEGORIES = ['Fiber Reguler', 'Fiber Safe', 'Fiber Soho'];

export const PAYMENT_TERMS = [
  'Bulanan (Regular)',
  'Advance Pay 5 Get 6',
  'Advance Pay 6 Get 7',
  'Advance Pay 9 Get 12',
  'Advance Pay 12 Get 14',
  'Advance Pay 12 Get 15'
];

  export const PACKAGES_DATA: Record<string, Record<string, any>> = {
    'Regular FS': {
      'Fiber Reguler': {
        speeds: ['20 Mbps', '20 Mbps + DramaFlix', '100 Mbps', '100 Mbps + DramaFlix', '150 Mbps', '150 Mbps + DramaFlix', '200 Mbps', '200 Mbps + DramaFlix', '300 Mbps', '300 Mbps + DramaFlix'],
        terms: ['Bulanan (Regular)', 'Advance Pay 5 Get 6', 'Advance Pay 9 Get 12'],
        monthlyPrices: {
          '20 Mbps': { setupFee: 0, basicPrice: 169000 },
          '20 Mbps + DramaFlix': { setupFee: 0, basicPrice: 169000 },
          '100 Mbps': { setupFee: 0, basicPrice: 199000 },
          '100 Mbps + DramaFlix': { setupFee: 0, basicPrice: 199000 },
          '150 Mbps': { setupFee: 0, basicPrice: 229000 },
          '150 Mbps + DramaFlix': { setupFee: 0, basicPrice: 229000 },
          '200 Mbps': { setupFee: 0, basicPrice: 339000 },
          '200 Mbps + DramaFlix': { setupFee: 0, basicPrice: 339000 },
          '300 Mbps': { setupFee: 0, basicPrice: 429000 },
          '300 Mbps + DramaFlix': { setupFee: 0, basicPrice: 429000 }
        },
        prices: {
          'Advance Pay 5 Get 6': { '20 Mbps': 845000, '20 Mbps + DramaFlix': 845000, '100 Mbps': 995000, '100 Mbps + DramaFlix': 995000, '150 Mbps': 1145000, '150 Mbps + DramaFlix': 1145000, '200 Mbps': 1695000, '200 Mbps + DramaFlix': 1695000, '300 Mbps': 2145000, '300 Mbps + DramaFlix': 2145000 },
          'Advance Pay 9 Get 12': { '20 Mbps': 1521000, '20 Mbps + DramaFlix': 1521000, '100 Mbps': 1791000, '100 Mbps + DramaFlix': 1791000, '150 Mbps': 2061000, '150 Mbps + DramaFlix': 2061000, '200 Mbps': 3051000, '200 Mbps + DramaFlix': 3051000, '300 Mbps': 3861000, '300 Mbps + DramaFlix': 3861000 }
        }
      },
    'Fiber Safe': {
      speeds: ['20 Mbps', '100 Mbps', '150 Mbps', '200 Mbps', '300 Mbps', '500 Mbps', '1 Gbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 5 Get 6', 'Advance Pay 9 Get 12'],
      monthlyPrices: {
        '20 Mbps': { setupFee: 0, basicPrice: 189000 },
        '100 Mbps': { setupFee: 0, basicPrice: 219000 },
        '150 Mbps': { setupFee: 0, basicPrice: 249000 },
        '200 Mbps': { setupFee: 0, basicPrice: 359000 },
        '300 Mbps': { setupFee: 0, basicPrice: 449000 },
        '500 Mbps': { setupFee: 0, basicPrice: 799000 },
        '1 Gbps': { setupFee: 1500000, basicPrice: 1399000 }
      },
      prices: {
        'Advance Pay 5 Get 6': { '20 Mbps': 945000, '100 Mbps': 1095000, '150 Mbps': 1245000, '200 Mbps': 1795000, '300 Mbps': 2245000, '500 Mbps': 3995000, '1 Gbps': 6995000 },
        'Advance Pay 9 Get 12': { '20 Mbps': 1701000, '100 Mbps': 1971000, '150 Mbps': 2241000, '200 Mbps': 3231000, '300 Mbps': 4041000, '500 Mbps': 7191000, '1 Gbps': 12591000 }
      }
    }
  },
  'Pro': {
    'Fiber Soho': {
      speeds: ['100 Mbps', '200 Mbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 6 Get 7', 'Advance Pay 12 Get 15'],
      monthlyPrices: {
        '100 Mbps': { setupFee: 0, basicPrice: 599000 },
        '200 Mbps': { setupFee: 0, basicPrice: 999000 }
      },
      prices: {
        'Advance Pay 6 Get 7': { '100 Mbps': 3594000, '200 Mbps': 5994000 },
        'Advance Pay 12 Get 15': { '100 Mbps': 7188000, '200 Mbps': 11988000 }
      }
    }
  },
  'PIK 1 JMS': {
    'Fiber Reguler': {
      speeds: ['50 Mbps', '100 Mbps', '300 Mbps', '500 Mbps', '1 Gbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 6 Get 7', 'Advance Pay 12 Get 14'],
      monthlyPrices: {
        '50 Mbps': { setupFee: 250000, basicPrice: 299000 },
        '100 Mbps': { setupFee: 250000, basicPrice: 399000 },
        '300 Mbps': { setupFee: 250000, basicPrice: 699000 },
        '500 Mbps': { setupFee: 250000, basicPrice: 999000 },
        '1 Gbps': { setupFee: 0, basicPrice: 3999000 }
      },
      prices: {
        'Advance Pay 6 Get 7': { '50 Mbps': 1794000, '100 Mbps': 2394000, '300 Mbps': 4194000, '500 Mbps': 5994000, '1 Gbps': 23994000 },
        'Advance Pay 12 Get 14': { '50 Mbps': 3588000, '100 Mbps': 4788000, '300 Mbps': 8388000, '500 Mbps': 11988000, '1 Gbps': 47988000 }
      }
    },
    'Fiber Soho': {
      speeds: ['50 Mbps', '80 Mbps', '100 Mbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 6 Get 7', 'Advance Pay 12 Get 14'],
      monthlyPrices: {
        '50 Mbps': { setupFee: 0, basicPrice: 500000 },
        '80 Mbps': { setupFee: 0, basicPrice: 800000 },
        '100 Mbps': { setupFee: 0, basicPrice: 1200000 }
      },
      prices: {
        'Advance Pay 6 Get 7': { '50 Mbps': 3000000, '80 Mbps': 4800000, '100 Mbps': 7200000 },
        'Advance Pay 12 Get 14': { '50 Mbps': 6000000, '80 Mbps': 9600000, '100 Mbps': 14400000 }
      }
    }
  },
  'PIK 2 JMS': {
    'Fiber Reguler': {
      speeds: ['50 Mbps', '100 Mbps', '300 Mbps', '500 Mbps', '1 Gbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 6 Get 7', 'Advance Pay 12 Get 14'],
      monthlyPrices: {
        '50 Mbps': { setupFee: 200000, basicPrice: 299000 },
        '100 Mbps': { setupFee: 200000, basicPrice: 399000 },
        '300 Mbps': { setupFee: 200000, basicPrice: 699000 },
        '500 Mbps': { setupFee: 200000, basicPrice: 999000 },
        '1 Gbps': { setupFee: 0, basicPrice: 3999000 }
      },
      prices: {
        'Advance Pay 6 Get 7': { '50 Mbps': 1794000, '100 Mbps': 2394000, '300 Mbps': 4194000, '500 Mbps': 5994000, '1 Gbps': 23994000 },
        'Advance Pay 12 Get 14': { '50 Mbps': 3588000, '100 Mbps': 4788000, '300 Mbps': 8388000, '500 Mbps': 11988000, '1 Gbps': 47988000 }
      }
    },
    'Fiber Soho': {
      speeds: ['50 Mbps', '80 Mbps', '100 Mbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 6 Get 7', 'Advance Pay 12 Get 14'],
      monthlyPrices: {
        '50 Mbps': { setupFee: 0, basicPrice: 500000 },
        '80 Mbps': { setupFee: 0, basicPrice: 800000 },
        '100 Mbps': { setupFee: 0, basicPrice: 1200000 }
      },
      prices: {
        'Advance Pay 6 Get 7': { '50 Mbps': 3000000, '80 Mbps': 4800000, '100 Mbps': 7200000 },
        'Advance Pay 12 Get 14': { '50 Mbps': 6000000, '80 Mbps': 9600000, '100 Mbps': 14400000 }
      }
    }
  },
  'Golf Island': {
    'Fiber Reguler': {
      speeds: ['50 Mbps', '75 Mbps', '100 Mbps', '200 Mbps', '300 Mbps', '1 Gbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 6 Get 7', 'Advance Pay 12 Get 14'],
      monthlyPrices: {
        '50 Mbps': { setupFee: 200000, basicPrice: 350000 },
        '75 Mbps': { setupFee: 200000, basicPrice: 500000 },
        '100 Mbps': { setupFee: 200000, basicPrice: 700000 },
        '200 Mbps': { setupFee: 200000, basicPrice: 1300000 },
        '300 Mbps': { setupFee: 0, basicPrice: 1900000 },
        '1 Gbps': { setupFee: 0, basicPrice: 3999000 }
      },
      prices: {
        'Advance Pay 6 Get 7': { '50 Mbps': 2100000, '75 Mbps': 3000000, '100 Mbps': 4200000, '200 Mbps': 7800000, '300 Mbps': 11400000, '1 Gbps': 23994000 },
        'Advance Pay 12 Get 14': { '50 Mbps': 4200000, '75 Mbps': 6000000, '100 Mbps': 8400000, '200 Mbps': 15600000, '300 Mbps': 22800000, '1 Gbps': 47988000 }
      }
    },
    'Fiber Soho': {
      speeds: ['50 Mbps', '80 Mbps', '100 Mbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 6 Get 7', 'Advance Pay 12 Get 14'],
      monthlyPrices: {
        '50 Mbps': { setupFee: 0, basicPrice: 500000 },
        '80 Mbps': { setupFee: 0, basicPrice: 800000 },
        '100 Mbps': { setupFee: 0, basicPrice: 1200000 }
      },
      prices: {
        'Advance Pay 6 Get 7': { '50 Mbps': 3000000, '80 Mbps': 4800000, '100 Mbps': 7200000 },
        'Advance Pay 12 Get 14': { '50 Mbps': 6000000, '80 Mbps': 9600000, '100 Mbps': 14400000 }
      }
    }
  }
};


export const SMARTBOX_PRICES: Record<string, number> = {
  'DensTV': 45000,
  'DensTV V.3': 55000,
  'DensTV V.3 (Area JMS)': 60000
};

export const VAS_DATA = [
  // Berbayar
  { name: 'DramaFlix +50Mbps', price: 15000, category: 'Berbayar' },
  { name: 'GamersCode Excite +50Mbps', price: 30000, category: 'Berbayar' },
  { name: 'Weekly Diamond Pass +50Mbps', price: 26500, category: 'Berbayar' },
  { name: 'Stream Pack New +50Mbps', price: 45000, category: 'Berbayar' },
  { name: 'Lifestyle Pack +50Mbps', price: 90000, category: 'Berbayar' },
  { name: 'Lifestyle Pack V.3 +50Mbps', price: 100000, category: 'Berbayar' },
  { name: 'MNC Vision+ Premium Sport', price: 40000, category: 'Berbayar' },
  { name: 'MNC Vision+ Premium BeIN Sports', price: 36000, category: 'Berbayar' },
  { name: 'MNC Vision+ Premium Ultimate', price: 59000, category: 'Berbayar' },
  { name: 'Vidio Platinum', price: 45000, category: 'Berbayar' },
  { name: 'Vidio Platinum Extra', price: 65000, category: 'Berbayar' },
  { name: 'Vidio Ultimate', price: 175000, category: 'Berbayar' },
  { name: 'Trend Micro Mobile Security - 1 Device', price: 10500, category: 'Berbayar' },
  { name: 'Trend Micro Maximum Security - 1 Device', price: 10500, category: 'Berbayar' },
  { name: 'Trend Micro Maximum Security - 3 Device', price: 17000, category: 'Berbayar' },
  { name: 'Trend Micro Maximum Security - 5 Device', price: 21000, category: 'Berbayar' },
  { name: 'Trend Micro Mobile Security Plus + VPN - 1 Device', price: 16200, category: 'Berbayar' },
  { name: 'Trend Micro Maximum Security Plus + VPN - 1 Device', price: 16200, category: 'Berbayar' },
  { name: 'Trend Micro Device Security Pro - 1 Device', price: 22750, category: 'Berbayar' },
  { name: 'Trend Micro ID Protection - 1 Device', price: 7000, category: 'Berbayar' },
  
  // Free
  { name: 'CBN Fiber July 2026 Package 1 (15 & 20 Mbps)', price: 0, category: 'Free' },
  { name: 'CBN Fiber July 2026 Package 2 (100, 150, & 200 Mbps)', price: 0, category: 'Free' },
  { name: 'CBN Fiber July 2026 Package 3 (300 Mbps)', price: 0, category: 'Free' },
  { name: 'CBN Fiber Safe July 2026 Package 1 (15 & 20 Mbps)', price: 0, category: 'Free' },
  { name: 'CBN Fiber Safe July 2026 Package 2 (100, 150 & 200 Mbps)', price: 0, category: 'Free' },
  { name: 'CBN Fiber Safe July 2026 Package 3 (300 Mbps)', price: 0, category: 'Free' },
  { name: 'CBN Fiber Safe July 2026 Package 4 (500 & 1Gbps)', price: 0, category: 'Free' },
  { name: 'Trend Micro Maximum Security 1 Months - 1 Device (Free)', price: 0, category: 'Free' },
  { name: 'Genflix Premium (Free)', price: 0, category: 'Free' },
  { name: 'Cubmu Lite (Free)', price: 0, category: 'Free' },
  { name: 'Speedboost +50Mbps', price: 0, category: 'Free' },
  { name: 'Speedboost +25Mbps', price: 0, category: 'Free' },
  { name: 'Dens Go Premium (Free)', price: 0, category: 'Free' },
  { name: 'Drama Hits (Free)', price: 0, category: 'Free' }
];
