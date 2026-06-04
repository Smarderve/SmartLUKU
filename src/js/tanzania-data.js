// Tanzania Regions, Districts, Streets and Electricity Networks Data
const tanzaniaData = {
  regions: {
    'dar': {
      name: 'Dar es Salaam',
      districts: {
        'kinondoni': {
          name: 'Kinondoni',
          streets: ['Bagamoyo Rd', 'Toure Dr', 'Morogoro Rd', 'Chang\'ombe Rd', 'Haile Selassie Rd', 'Ali Hassan Mwinyi Rd', 'Kalamkamba', 'Mlandizi', 'Msasani']
        },
        'ilala': {
          name: 'Ilala',
          streets: ['Nelson Mandela Rd', 'Samora Machel Ave', 'Mosque St', 'Kenyatta Rd', 'Sokoine Dr', 'Maktaba St', 'Mikocheni', 'Jamhuri St', 'Zanaki St']
        },
        'temeke': {
          name: 'Temeke',
          streets: ['Temeke Main Rd', 'Makonde Rd', 'Mtakuja Rd', 'Industrial Area', 'Chalinze', 'Tandika', 'Mbagala', 'Mjimwema', 'Dar Port Area']
        }
      }
    },
    'arusha': {
      name: 'Arusha',
      districts: {
        'arusha-urban': {
          name: 'Arusha Urban',
          streets: ['Goliondoi Rd', 'Serengeti Rd', 'Bomas Rd', 'Clock Tower', 'Uhuru Monument', 'Stadium Road', 'Arusha Town Centre', 'Sam Nujoma Rd', 'Makao']
        },
        'arusha-rural': {
          name: 'Arusha Rural',
          streets: ['Moshi Road', 'Namanga Road', 'Usa River', 'Maweni', 'Mabwe', 'Mateves', 'Maji', 'Arusha National Park Road', 'Kilimanjaro Road']
        },
        'moshi': {
          name: 'Moshi',
          streets: ['Main Street', 'New Street', 'Kilimanjaro Rd', 'Kibo Road', 'Market Street', 'Stadium Road', 'Majengo', 'Uru', 'Mandileo']
        }
      }
    },
    'dodoma': {
      name: 'Dodoma',
      districts: {
        'dodoma-urban': {
          name: 'Dodoma Urban',
          streets: ['Independence Ave', 'Lumumba St', 'Samora Machel Ave', 'Swahili St', 'Democracy St', 'Makonde St', 'Njombe Rd', 'Makurumimba', 'Stadium Rd']
        },
        'dodoma-rural': {
          name: 'Dodoma Rural',
          streets: ['Dar Road', 'Iringa Road', 'Chalinze', 'Morogoro', 'Msalato', 'Mlandizi', 'Chamwino', 'Bahi', 'Singida Road']
        },
        'bahi': {
          name: 'Bahi',
          streets: ['Bahi Main Rd', 'Mlandizi Rd', 'Singida Road', 'Dodoma Road', 'Bashnet', 'Ibagwa', 'Magangani', 'Chilika', 'Nsukusumo']
        }
      }
    },
    'mbeya': {
      name: 'Mbeya',
      districts: {
        'mbeya-urban': {
          name: 'Mbeya Urban',
          streets: ['Nelson Mandela St', 'Independence Ave', 'Kefa Road', 'Tanzam Road', 'Mbeya Town Centre', 'Hospital St', 'Nkumbi', 'Mbalizi', 'Chunya']
        },
        'mbeya-rural': {
          name: 'Mbeya Rural',
          streets: ['Mbeya-Iringa Rd', 'Rungwe Road', 'Songwe', 'Mbezi', 'Msenda', 'Mbeya-Zambia Border', 'Chunya Road', 'Malangi', 'Kapologwe']
        },
        'rungwe': {
          name: 'Rungwe',
          streets: ['Rungwe Main Rd', 'Kyela Road', 'Lake Tanganyika Rd', 'Kiwira', 'Busokelo', 'Masoko', 'Mbeya Road', 'Ndumbi', 'Lusungu']
        }
      }
    },
    'morogoro': {
      name: 'Morogoro',
      districts: {
        'morogoro-urban': {
          name: 'Morogoro Urban',
          streets: ['Dar Road', 'Iringa Road', 'Market Street', 'Morogoro Town Centre', 'Station Rd', 'Kikundi St', 'Kichangani', 'Miembeni', 'Buguruni']
        },
        'morogoro-rural': {
          name: 'Morogoro Rural',
          streets: ['Dar-Iringa Rd', 'Uluguru Mts', 'Mvomero Road', 'Mlandizi', 'Chalinze', 'Mikumi', 'Mikumi National Park', 'Mazava', 'Udekwa']
        },
        'mvomero': {
          name: 'Mvomero',
          streets: ['Mvomero Main Rd', 'Morogoro Rd', 'Berega', 'Madibira', 'Turiani', 'Mgeta', 'Dakawa', 'Choma', 'Lukosi']
        }
      }
    },
    'dar-coastal': {
      name: 'Coast Region (Pwani)',
      districts: {
        'bagamoyo': {
          name: 'Bagamoyo',
          streets: ['Bagamoyo Main Rd', 'Dar-Chalinze Rd', 'Beach Road', 'Historical Site Rd', 'Chalinze', 'Sange', 'Kaole', 'Kunduchi', 'Mbweni']
        },
        'pangani': {
          name: 'Pangani',
          streets: ['Pangani Main Rd', 'Tanga Rd', 'Pangani Beach Rd', 'Lusinga', 'Bumbuli', 'Muzi', 'Marumba', 'Manga', 'Ndolage']
        }
      }
    },
    'lindi': {
      name: 'Lindi',
      districts: {
        'lindi-urban': {
          name: 'Lindi Urban',
          streets: ['Lindi Main St', 'Beach Road', 'Market Street', 'Lindi Town Centre', 'Port Road', 'Mikindani Rd', 'Hospital Rd', 'Police St', 'School St']
        },
        'mtwara': {
          name: 'Mtwara',
          streets: ['Mtwara Main Rd', 'Port Road', 'Mikindani', 'Beach Road', 'Market Street', 'Newala Road', 'Masasi Road', 'Lindi Road', 'Hospital St']
        }
      }
    },
    'tanga': {
      name: 'Tanga',
      districts: {
        'tanga-urban': {
          name: 'Tanga Urban',
          streets: ['Makonde Rd', 'Hospital Rd', 'Sokoine St', 'Tanga Town Centre', 'Port Road', 'Amboni Cave Rd', 'Beach Road', 'Market Street', 'Sheikh Ali Mwinyi St']
        },
        'bumbuli': {
          name: 'Bumbuli',
          streets: ['Bumbuli Main Rd', 'Tanga-Arusha Rd', 'Kilimanjaro Rd', 'Same Road', 'Mwanga', 'Korogwe', 'Amboni', 'Pangani', 'Same']
        }
      }
    },
    'iringa': {
      name: 'Iringa',
      districts: {
        'iringa-urban': {
          name: 'Iringa Urban',
          streets: ['Dar Road', 'Dodoma Road', 'Mbeya Road', 'Iringa Town Centre', 'Market Street', 'Hospital Rd', 'Kalenga', 'Kitumbi', 'Tunungu']
        },
        'iringa-rural': {
          name: 'Iringa Rural',
          streets: ['Iringa-Songea Rd', 'Iringa-Mbeya Rd', 'Njombe Road', 'Ihimba', 'Mufindi', 'Makete', 'Ilula', 'Rugomelo', 'Mimbizi']
        }
      }
    },
    'singida': {
      name: 'Singida',
      districts: {
        'singida-urban': {
          name: 'Singida Urban',
          streets: ['Singida Main St', 'Moshi Road', 'Arusha Road', 'Dodoma Road', 'Market Street', 'Hospital Rd', 'Iramba Rd', 'Ikungi', 'Manyoni']
        },
        'ikungi': {
          name: 'Ikungi',
          streets: ['Ikungi Main Rd', 'Dodoma Rd', 'Singida Rd', 'Manyoni', 'Iramba', 'Mwangata', 'Loleza', 'Ilongero', 'Singida Rural']
        }
      }
    },
    'mwanza': {
      name: 'Mwanza',
      districts: {
        'mwanza-urban': {
          name: 'Mwanza Urban',
          streets: ['Mwanza Main St', 'Lake Victoria Road', 'Tabora Road', 'Market Street', 'Port Road', 'Kenyatta Ave', 'Bukoba Road', 'Hospital St', 'Beach Road']
        },
        'bukoba': {
          name: 'Bukoba',
          streets: ['Bukoba Main Rd', 'Lake Victoria Rd', 'Mwanza Road', 'Kagera Road', 'Market Street', 'Hospital Rd', 'Port Road', 'Beach Rd', 'School St']
        }
      }
    }
  },

  // Electricity Networks (simulated data with random status)
  networks: [
    { id: 'net-dar-01', name: 'Dar Es Salaam Grid - North', region: 'dar', district: 'kinondoni', color: '#FF6B6B' },
    { id: 'net-dar-02', name: 'Dar Es Salaam Grid - Central', region: 'dar', district: 'ilala', color: '#4ECDC4' },
    { id: 'net-dar-03', name: 'Dar Es Salaam Grid - South', region: 'dar', district: 'temeke', color: '#45B7D1' },
    { id: 'net-arusha-01', name: 'Arusha Main Network', region: 'arusha', district: 'arusha-urban', color: '#96CEB4' },
    { id: 'net-arusha-02', name: 'Mt. Meru Rural Network', region: 'arusha', district: 'arusha-rural', color: '#FFEAA7' },
    { id: 'net-dodoma-01', name: 'Dodoma Central Grid', region: 'dodoma', district: 'dodoma-urban', color: '#DDA0DD' },
    { id: 'net-dodoma-02', name: 'Dodoma Rural Network', region: 'dodoma', district: 'dodoma-rural', color: '#98D8C8' },
    { id: 'net-mbeya-01', name: 'Mbeya Urban Network', region: 'mbeya', district: 'mbeya-urban', color: '#F7DC6F' },
    { id: 'net-mbeya-02', name: 'Rungwe Highland Network', region: 'mbeya', district: 'rungwe', color: '#BB8FCE' },
    { id: 'net-morogoro-01', name: 'Morogoro Central Grid', region: 'morogoro', district: 'morogoro-urban', color: '#85C1E2' },
    { id: 'net-morogoro-02', name: 'Uluguru Valley Network', region: 'morogoro', district: 'morogoro-rural', color: '#F8B88B' },
  ],

  // Function to get random status (up/down)
  getNetworkStatus: function(networkId) {
    // Simulated random status - 90% up, 10% down
    const isUp = Math.random() > 0.1;
    return isUp ? 'operational' : 'maintenance';
  },

  // Function to get regions list
  getRegions: function() {
    return Object.entries(this.regions).map(([key, region]) => ({
      code: key,
      name: region.name
    }));
  },

  // Function to get districts for a region
  getDistricts: function(regionCode) {
    if (!this.regions[regionCode]) return [];
    return Object.entries(this.regions[regionCode].districts).map(([key, district]) => ({
      code: key,
      name: district.name
    }));
  },

  // Function to get streets for a district
  getStreets: function(regionCode, districtCode) {
    if (!this.regions[regionCode] || !this.regions[regionCode].districts[districtCode]) return [];
    return this.regions[regionCode].districts[districtCode].streets;
  },

  // Function to get networks for a location
  getNetworksForLocation: function(regionCode, districtCode = null) {
    return this.networks.filter(net => {
      if (districtCode) {
        return net.region === regionCode && net.district === districtCode;
      }
      return net.region === regionCode;
    }).map(net => ({
      ...net,
      status: this.getNetworkStatus(net.id)
    }));
  }
};
