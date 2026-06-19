/* Shared solar content — single source for sellers & solutions */

export const SELLERS = [
  {
    id: 'sp1',
    image: require('../images/solar/banner3.jpg'),
    membername: 'SunPeak Installers',
    position: 'Premium rooftop partner',
    rating: 5,
    description: 'Certified installers with 12+ years of residential and commercial PV experience across the region.',
    location: 'Texas',
  },
  {
    id: 'sp2',
    image: require('../images/solar/partner-02.jpg'),
    membername: 'BrightGrid Solar',
    position: 'Net metering specialists',
    rating: 5,
    description: 'Full-service design, permitting, and interconnection support with transparent pricing.',
    location: 'California',
  },
  {
    id: 'sp3',
    image: require('../images/solar/partner-03.jpg'),
    membername: 'HelioCraft Energy',
    position: 'Commercial & industrial',
    rating: 4,
    description: 'Large-format arrays, carports, and battery-ready systems for businesses scaling clean power.',
    location: 'Arizona',
  },
  {
    id: 'sp4',
    image: require('../images/solar/partner-04.jpg'),
    membername: 'EcoVolt Solutions',
    position: 'Maintenance & monitoring',
    rating: 5,
    description: 'Ongoing panel care, inverter checks, and 24/7 production monitoring for peace of mind.',
    location: 'Florida',
  },
  {
    id: 'sp5',
    image: require('../images/solar/partner-05.jpg'),
    membername: 'NorthStar PV',
    position: 'Battery & backup systems',
    rating: 5,
    description: 'AC- and DC-coupled storage design with critical-load panels and smart energy management.',
    location: 'Texas',
  },
  {
    id: 'sp6',
    image: require('../images/solar/partner-06.jpg'),
    membername: 'ClearSky Electric',
    position: 'Design & engineering',
    rating: 4,
    description: 'Structural stamps, shade analysis, and rapid shutdown plans delivered on schedule.',
    location: 'California',
  },
  {
    id: 'sp7',
    image: require('../images/solar/partner-07.jpg'),
    membername: 'Summit Solar Co.',
    position: 'Financing & PPAs',
    rating: 5,
    description: 'Loan, lease, and PPA options with clear savings assumptions and no hidden fees.',
    location: 'Colorado',
  },
  {
    id: 'sp8',
    image: require('../images/solar/partner-08.jpg'),
    membername: 'GreenLeaf Power',
    position: 'Agricultural & ground-mount',
    rating: 4,
    description: 'Agrivoltaics and ground-mount arrays for farms and rural properties.',
    location: 'Florida',
  },
];

export const SOLUTIONS = [
  {
    id: 'sol-res',
    num: '01',
    title: 'Residential Solar',
    vendorName: 'SunPeak Installers',
    image: require('../images/solar/sol-residential.jpg'),
    short: 'Rooftop arrays sized for your usage, roof, and utility rules.',
    description: 'Turnkey residential PV with tier-1 modules, rapid shutdown, and production monitoring—optimized for net metering, NEM 3.0 strategies, and long-term savings.',
  },
  {
    id: 'sol-com',
    num: '02',
    title: 'Commercial Solar',
    vendorName: 'HelioCraft Energy',
    image: require('../images/solar/sol-commercial.jpg'),
    short: 'Flat roofs, carports, and C&I demand-charge reduction.',
    description: 'Engineering for commercial roofs and parking structures with demand-charge analysis, incentive stacking, and phased construction to limit business disruption.',
  },
  {
    id: 'sol-om',
    num: '03',
    title: 'O&M & Monitoring',
    vendorName: 'EcoVolt Solutions',
    image: require('../images/solar/sol-maintenance.jpg'),
    short: 'Inspections, cleaning, and alerts to protect your ROI.',
    description: 'Annual inspections, thermal imaging, inverter firmware updates, and 24/7 monitoring so issues are caught before they hurt production.',
  },
  {
    id: 'sol-bat',
    num: '04',
    title: 'Battery & Backup',
    vendorName: 'NorthStar PV',
    image: require('../images/solar/sol-battery.jpg'),
    short: 'Storage for backup, arbitrage, and grid services.',
    description: 'Battery sizing for backup circuits, time-of-use arbitrage, and participation in utility programs where available—integrated with your solar system.',
  },
  {
    id: 'sol-ev',
    num: '05',
    title: 'EV Charging',
    vendorName: 'BrightGrid Solar',
    image: require('../images/solar/sol-ev.jpg'),
    short: 'Charge at home or at your workplace.',
    description: 'Level 2 chargers coordinated with your panel capacity and solar production—ideal for homeowners and fleet-ready commercial sites.',
  },
  {
    id: 'sol-fin',
    num: '06',
    title: 'Financing & Incentives',
    vendorName: 'Summit Solar Co.',
    image: require('../images/solar/sol-financing.jpg'),
    short: 'Loans, leases, and tax credit guidance.',
    description: 'Side-by-side comparisons of cash purchase, loans, and leases with realistic assumptions for ITC, local rebates, and SRECs where applicable.',
  },
  {
    id: 'sol-site',
    num: '07',
    title: 'Site & Shade Analysis',
    vendorName: 'ClearSky Electric',
    image: require('../images/solar/sol-site.jpg'),
    short: 'LiDAR-based models and production forecasts.',
    description: 'Detailed shade reports and annual production estimates so you know expected kWh before you sign—no guesswork.',
  },
  {
    id: 'sol-ground',
    num: '08',
    title: 'Ground & Ag Solar',
    vendorName: 'GreenLeaf Power',
    image: require('../images/solar/sol-ground.jpg'),
    short: 'Ground-mount and agrivoltaic systems.',
    description: 'Fixed-tilt and tracker options for open land, dual-use agriculture, and rural properties with soil and environmental considerations.',
  },
];

export const SELLER_LOCATIONS = ['All', 'Texas', 'California', 'Arizona', 'Florida', 'Colorado'];

/** Long-form copy & lists for `/properties/:id` detail page (merged with SELLERS entries). */
export const SELLER_DETAIL_EXTRA = {
  sp1: {
    detailAbout:
      'SunPeak coordinates design, permitting, and utility interconnection end to end. Their crews are trained on rapid shutdown, fire setbacks, and code-compliant rooftop layouts. Warranty registration and monitoring handoff are included on every project.',
    expertise: ['Residential & commercial PV', 'Permitting & interconnection', 'Production monitoring & warranty'],
    serviceIds: ['sol-res', 'sol-com', 'sol-om', 'sol-site'],
  },
  sp2: {
    detailAbout:
      'BrightGrid focuses on net metering workflows, transparent pricing, and homeowner education. You get a single point of contact from site survey through permission to operate, with clear assumptions on savings and production.',
    expertise: ['Net metering & rate strategy', 'Turnkey design-build', 'Transparent proposals'],
    serviceIds: ['sol-res', 'sol-fin', 'sol-site', 'sol-om'],
  },
  sp3: {
    detailAbout:
      'HelioCraft delivers large-format arrays, carports, and battery-ready C&I systems. Engineering emphasizes demand-charge reduction, phased construction, and minimal disruption to operations.',
    expertise: ['C&I rooftop & carport', 'Demand-charge analysis', 'Battery-ready design'],
    serviceIds: ['sol-com', 'sol-bat', 'sol-ev', 'sol-fin'],
  },
  sp4: {
    detailAbout:
      'EcoVolt keeps systems performing with inspections, cleaning schedules, and 24/7 production alerts. Their O&M plans are structured around inverter health, string balance, and rapid response when alerts fire.',
    expertise: ['O&M programs', 'Thermal & visual inspections', 'Remote monitoring'],
    serviceIds: ['sol-om', 'sol-site', 'sol-res'],
  },
  sp5: {
    detailAbout:
      'NorthStar designs AC- and DC-coupled storage with critical-load panels and smart energy management. They size backup circuits for real loads—not generic “whole home” promises without a load study.',
    expertise: ['Battery & backup', 'Critical-load design', 'Smart panels & EMS'],
    serviceIds: ['sol-bat', 'sol-res', 'sol-ev', 'sol-om'],
  },
  sp6: {
    detailAbout:
      'ClearSky provides structural stamps, shade analysis, and rapid shutdown documentation on schedule. Ideal when you already have an installer but need engineering deliverables your AHJ will accept.',
    expertise: ['Structural & electrical PE', 'Shade & production models', 'Plan sets & stamps'],
    serviceIds: ['sol-site', 'sol-res', 'sol-com'],
  },
  sp7: {
    detailAbout:
      'Summit compares loan, lease, and PPA options with realistic savings assumptions—no hidden fees in the fine print. They align financing choice with your tax appetite and payback expectations.',
    expertise: ['Loans, leases & PPAs', 'ITC & incentive guidance', 'Savings modeling'],
    serviceIds: ['sol-fin', 'sol-res', 'sol-com'],
  },
  sp8: {
    detailAbout:
      'GreenLeaf serves farms and rural properties with ground-mount and agrivoltaic layouts. Soil conditions, tracker vs fixed-tilt, and dual-use spacing are evaluated before equipment is specified.',
    expertise: ['Ground-mount & trackers', 'Agrivoltaics', 'Rural interconnection'],
    serviceIds: ['sol-ground', 'sol-site', 'sol-com', 'sol-om'],
  },
};

export function getSellerById(id) {
  const base = SELLERS.find((s) => s.id === id);
  if (!base) return null;
  const extra = SELLER_DETAIL_EXTRA[base.id] || {};
  const { serviceIds, ...restExtra } = extra;
  const merged = { ...base, ...restExtra };
  merged.services = Array.isArray(serviceIds)
    ? serviceIds.map((sid) => SOLUTIONS.find((sol) => sol.id === sid)).filter(Boolean)
    : [];
  return merged;
}
