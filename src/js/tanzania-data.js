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

  // ---- Deterministic status + downtime reporting layer ----
  _statusReady: false,

  // Simple deterministic string hash so statuses stay stable within a session
  _hash: function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  },

  _incidentCauses: [
    'Transformer overload',
    'Scheduled maintenance',
    'Storm / weather damage',
    'Underground cable fault',
    'Equipment upgrade',
    'Vandalism on line',
    'Overvoltage protection trip',
    'Substation breaker fault'
  ],

  _buildIncidents: function (net) {
    const causes = this._incidentCauses;
    const base = this._hash(net.id);
    const count = 3 + (base % 4); // 3 - 6 incidents
    const incidents = [];
    let totalDownMin = 0;

    for (let i = 0; i < count; i++) {
      const s = this._hash(net.id + ':' + i);
      const daysAgo = (s % 75) + i * 4 + 1;
      const date = new Date(Date.now() - daysAgo * 86400000 - (s % 86400) * 1000);
      const durationMin = 15 + (s % 285); // 15 - 300 min
      totalDownMin += durationMin;
      incidents.push({
        id: net.id + '-inc-' + i,
        date: date,
        durationMin: durationMin,
        cause: causes[s % causes.length],
        resolved: true,
        severity: durationMin > 180 ? 'high' : durationMin > 60 ? 'medium' : 'low'
      });
    }

    incidents.sort(function (a, b) { return b.date - a.date; });
    // For impaired lines, the most recent incident is still ongoing
    if (net.status !== 'operational' && incidents.length) {
      incidents[0].resolved = false;
    }
    return { incidents: incidents, totalDownMin: totalDownMin };
  },

  _initStatuses: function () {
    if (this._statusReady) return;
    const self = this;
    this.networks.forEach(function (net) {
      const seed = self._hash(net.id);
      const r = seed % 100;
      // Mostly operational, with some maintenance and the occasional outage
      net.status = r < 60 ? 'operational' : r < 78 ? 'maintenance' : 'down';

      // Uptime: operational lines are healthier than impaired ones
      const jitter = (seed % 60) / 10; // 0.0 - 5.9
      net.uptime = net.status === 'operational'
        ? +(99.9 - jitter * 0.15).toFixed(2)
        : net.status === 'maintenance'
          ? +(98.5 - jitter * 0.4).toFixed(2)
          : +(92.0 - jitter * 0.9).toFixed(2);

      net.customers = 850 + (seed % 7400);
      net.voltage = net.status === 'down' ? 0 : 228 + (seed % 9); // ~230V nominal
      net.loadPct = 35 + (seed % 60); // current load %

      const report = self._buildIncidents(net);
      net.incidents = report.incidents;
      net.downtime30dMin = report.totalDownMin;

      // Last incident reference for quick display
      net.lastIncident = net.incidents.length ? net.incidents[0] : null;
    });
    this._statusReady = true;
  },

  // Returns the stored status string for a network (accepts id or name)
  getNetworkStatus: function (networkRef) {
    this._initStatuses();
    const net = this.getNetworkReport(networkRef);
    return net ? net.status : 'operational';
  },

  // Returns the full network object incl. status, uptime and incidents
  getNetworkReport: function (networkRef) {
    this._initStatuses();
    return this.networks.find(function (n) {
      return n.id === networkRef || n.name === networkRef;
    }) || null;
  },

  // Aggregate stats across all networks (for summary cards)
  getNetworkSummary: function () {
    this._initStatuses();
    const summary = { total: this.networks.length, operational: 0, maintenance: 0, down: 0, customers: 0, avgUptime: 0 };
    let uptimeSum = 0;
    this.networks.forEach(function (n) {
      summary[n.status]++;
      summary.customers += n.customers;
      uptimeSum += n.uptime;
    });
    summary.avgUptime = +(uptimeSum / this.networks.length).toFixed(2);
    return summary;
  },

  // Resolve the network line that belongs to the logged-in user's profile
  getUserNetwork: function (profile) {
    this._initStatuses();
    if (profile && profile.region) {
      const byDistrict = this.networks.find(function (n) {
        return n.region === profile.region && n.district === profile.district;
      });
      if (byDistrict) return byDistrict;
      const byRegion = this.networks.find(function (n) {
        return n.region === profile.region;
      });
      if (byRegion) return byRegion;
    }
    return this.networks[0];
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
  },

  // Region hub coordinates for Leaflet grid map
  regionCoords: {
    dar: [-6.8000, 39.2833],
    arusha: [-3.3869, 36.6830],
    dodoma: [-6.1667, 35.7333],
    mbeya: [-8.7500, 33.4667],
    morogoro: [-6.8167, 37.6667],
    iringa: [-7.7667, 35.6833],
    songea: [-10.6667, 35.6333],
    mwanza: [-2.5167, 32.8833],
    tabora: [-5.0333, 32.7833],
    bukoba: [-1.3333, 31.8333]
  },

  _districtOffset: function (region, district) {
    const seed = this._hash(region + ':' + district);
    const angle = (seed % 360) * (Math.PI / 180);
    const dist = 0.04 + (seed % 30) / 1000;
    return { dlat: Math.sin(angle) * dist, dlng: Math.cos(angle) * dist };
  },

  /** Geo geometry for a distribution line: hub → substation → street branches */
  getNetworkGeometry: function (net) {
    this._initStatuses();
    const hub = this.regionCoords[net.region] || [-6.8000, 39.2833];
    const off = this._districtOffset(net.region, net.district);
    const subLat = hub[0] + off.dlat;
    const subLng = hub[1] + off.dlng;
    const streets = (this.getStreets(net.region, net.district) || []).slice(0, 6);
    const branches = streets.map((street, i) => {
      const a = (-Math.PI / 2) + i * ((Math.PI * 1.1) / Math.max(streets.length - 1, 1));
      const r = 0.012 + (i % 3) * 0.004;
      return {
        street,
        lat: subLat + Math.sin(a) * r,
        lng: subLng + Math.cos(a) * r
      };
    });
    return {
      hub: { lat: hub[0], lng: hub[1] },
      substation: { lat: subLat, lng: subLng },
      branches,
      trunk: [[hub[0], hub[1]], [subLat, subLng]],
      branchLines: branches.map(b => [[subLat, subLng], [b.lat, b.lng]])
    };
  },

  getNetworksForScope: function (scope, profile) {
    this._initStatuses();
    const userNet = this.getUserNetwork(profile);
    if (scope === 'mine') return [userNet];
    if (scope === 'region') return this.networks.filter(n => n.region === userNet.region);
    return this.networks.slice();
  }
};
