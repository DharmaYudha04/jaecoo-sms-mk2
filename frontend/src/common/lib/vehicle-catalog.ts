export type VehicleCatalogItem = {
  value: string;
  shortLabel: string;
  badge: string;
  image: { src: string; alt: string };
  aliases?: string[];
};

export const VEHICLE_CATALOG: VehicleCatalogItem[] = [
  {
    value: 'JAECOO J5 EV',
    shortLabel: 'J5 EV',
    badge: 'EV',
    image: { src: '/assets/j5ev.webp', alt: 'JAECOO J5 EV' },
    aliases: ['j5ev', 'j5 ev', 'jaecoo j5 ev premium'],
  },
  {
    value: 'JAECOO J7 SHS-P',
    shortLabel: 'J7 SHS-P',
    badge: 'SHS-P',
    image: { src: '/assets/j7shsp.webp', alt: 'JAECOO J7 SHS-P' },
    aliases: ['j7 shsp', 'j7 shs p', 'j7 shs-p'],
  },
  {
    value: 'JAECOO J8 ARDIS',
    shortLabel: 'J8 ARDIS',
    badge: 'ARDIS',
    image: { src: '/assets/j8ardis.webp', alt: 'JAECOO J8 ARDIS' },
    aliases: ['j8 ardis', 'jaecoo j8 ardis'],
  },
  {
    value: 'JAECOO J8 SHS-P ARDIS',
    shortLabel: 'J8 SHS-P ARDIS',
    badge: 'SHS-P ARDIS',
    image: { src: '/assets/j8shspardis.webp', alt: 'JAECOO J8 SHS-P ARDIS' },
    aliases: ['j8 shsp ardis', 'j8 shs-p ardis', 'j8 shs p ardis'],
  },
];

export const VEHICLE_OPTIONS = VEHICLE_CATALOG.map((item) => item.value) as [string, ...string[]];

function normalize(value?: string | null) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function getVehicleCatalogItemByModel(model?: string | null): VehicleCatalogItem {
  const normalized = normalize(model);
  return (
    VEHICLE_CATALOG.find((item) => {
      const candidates = [item.value, item.shortLabel, ...(item.aliases ?? [])].map((entry) => normalize(entry));
      return candidates.some((candidate) => candidate && normalized.includes(candidate));
    }) ?? VEHICLE_CATALOG[0]
  );
}
