export interface BlackHole {
  id: string;
  nameKey: string;
  descKey: string;
  cx: number;
  cy: number;
  radius: number;
  color: string;
  secondaryColor?: string;
  hitRadius: number;
  tiltAngle?: number;
  hasJets?: boolean;
}

export const BLACK_HOLES: BlackHole[] = [
  {
    id: 'sagittarius_a',
    nameKey: 'bh_sagittarius_a',
    descKey: 'bh_sagittarius_a_desc',
    cx: 2500,
    cy: -2500,
    radius: 65,
    color: '#f97316',
    secondaryColor: '#fef08a',
    hitRadius: 220,
    tiltAngle: Math.PI / 7,
    hasJets: false
  },
  {
    id: 'cygnus_x1',
    nameKey: 'bh_cygnus_x1',
    descKey: 'bh_cygnus_x1_desc',
    cx: 708,
    cy: -1991,
    radius: 45,
    color: '#3b82f6',
    secondaryColor: '#67e8f9',
    hitRadius: 180,
    tiltAngle: -Math.PI / 6,
    hasJets: true
  },
  {
    id: 'm87_star',
    nameKey: 'bh_m87_star',
    descKey: 'bh_m87_star_desc',
    cx: 3400,
    cy: 2200,
    radius: 75,
    color: '#ea580c',
    secondaryColor: '#fef08a',
    hitRadius: 250,
    tiltAngle: Math.PI / 5,
    hasJets: true
  }
];
