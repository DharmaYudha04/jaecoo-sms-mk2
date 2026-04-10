export type VehicleImageMatch = {
  src: string;
  alt: string;
};

const vehicleImageEntries: Array<{ patterns: string[]; image: VehicleImageMatch }> = [
  {
    patterns: ['j5 ev', 'j5ev'],
    image: { src: '/assets/j5ev.webp', alt: 'JAECOO J5 EV' },
  },
  {
    patterns: ['j7 shs-p', 'j7 shsp', 'j7 shs p', 'j7 shs'],
    image: { src: '/assets/j7shsp.webp', alt: 'JAECOO J7 SHS-P' },
  },
  {
    patterns: ['j7 awd'],
    image: { src: '/assets/j7shsp.webp', alt: 'JAECOO J7 AWD' },
  },
  {
    patterns: ['j8 shs-p ardis', 'j8 shsp ardis', 'j8 shs p ardis', 'j8 shs-p'],
    image: { src: '/assets/j8shspardis.webp', alt: 'JAECOO J8 SHS-P Ardis' },
  },
  {
    patterns: ['j8 awd'],
    image: { src: '/assets/j8ardis.webp', alt: 'JAECOO J8 AWD' },
  },
  {
    patterns: ['j8 ardis', 'j8'],
    image: { src: '/assets/j8ardis.webp', alt: 'JAECOO J8 Ardis' },
  },
];

export function getVehicleImageByModel(model?: string | null): VehicleImageMatch {
  const normalized = (model ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  const match = vehicleImageEntries.find((entry) =>
    entry.patterns.some((pattern) => normalized.includes(pattern)),
  );

  return match?.image ?? { src: '/assets/j7shsp.webp', alt: model || 'JAECOO Vehicle' };
}
