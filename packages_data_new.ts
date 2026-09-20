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
      speeds: ['20 Mbps', '100 Mbps', '150 Mbps', '200 Mbps', '300 Mbps'],
      terms: ['Bulanan (Regular)', 'Advance Pay 5 Get 6', 'Advance Pay 9 Get 12'],
      monthlyPrices: {
        '20 Mbps': { setupFee: 0, basicPrice: 169000 },
        '100 Mbps': { setupFee: 0, basicPrice: 199000 },
        '150 Mbps': { setupFee: 0, basicPrice: 229000 },
        '200 Mbps': { setupFee: 0, basicPrice: 339000 },
        '300 Mbps': { setupFee: 0, basicPrice: 429000 }
      },
      prices: {
        'Advance Pay 5 Get 6': { '20 Mbps': 845000, '100 Mbps': 995000, '150 Mbps': 1145000, '200 Mbps': 1695000, '300 Mbps': 2145000 },
        'Advance Pay 9 Get 12': { '20 Mbps': 1521000, '100 Mbps': 1791000, '150 Mbps': 2061000, '200 Mbps': 3051000, '300 Mbps': 3861000 }
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
