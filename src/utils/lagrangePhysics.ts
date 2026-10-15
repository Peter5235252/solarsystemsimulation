export interface LagrangePoint {
  id: string;
  name: string;
  system: 'sun-earth' | 'earth-moon';
  x: number;
  y: number;
  type: 'collinear' | 'triangular';
  desc: string;
  stability: 'Unstable (Halo required)' | 'Stable (Trojan orbit)';
}

/**
 * Mathematically calculate Sun-Earth & Earth-Moon Lagrange Points (L1 through L5).
 * In the restricted three-body problem with mass ratio mu = M2 / (M1 + M2):
 * - L1: (R - rH, 0) where rH = R * (mu/3)^(1/3)
 * - L2: (R + rH, 0)
 * - L3: (-R * (1 + 5/12*mu), 0)
 * - L4: (R * cos(60 deg), +R * sin(60 deg))
 * - L5: (R * cos(60 deg), -R * sin(60 deg))
 */
export function calculateLagrangePoints(
  sunPos: { x: number; y: number },
  earthPos: { x: number; y: number },
  moonPos: { x: number; y: number } | null
): { sunEarth: LagrangePoint[]; earthMoon: LagrangePoint[] } {
  // 1. Sun-Earth System
  const dxSE = earthPos.x - sunPos.x;
  const dySE = earthPos.y - sunPos.y;
  const distSE = Math.hypot(dxSE, dySE);
  const angleSE = Math.atan2(dySE, dxSE);

  // Sun-Earth mass ratio mu_SE ~ 3.003e-6
  const muSE = 3.00348e-6;
  const hillRadiusSE = distSE * Math.cbrt(muSE / 3);

  // Scaled visual offset so points are clearly distinguishable in simulation
  const visualHillSE = Math.max(22, hillRadiusSE * 18);

  const l1DistSE = distSE - visualHillSE;
  const l2DistSE = distSE + visualHillSE;
  const l3DistSE = -(distSE + visualHillSE * 0.25);

  const sunEarthPoints: LagrangePoint[] = [
    {
      id: 'se-l1',
      name: 'Sun–Earth L1',
      system: 'sun-earth',
      x: sunPos.x + Math.cos(angleSE) * l1DistSE,
      y: sunPos.y + Math.sin(angleSE) * l1DistSE,
      type: 'collinear',
      desc: 'Sun-facing equilibrium point ~1.5M km from Earth; host to SOHO & DSCOVR observatories.',
      stability: 'Unstable (Halo required)'
    },
    {
      id: 'se-l2',
      name: 'Sun–Earth L2',
      system: 'sun-earth',
      x: sunPos.x + Math.cos(angleSE) * l2DistSE,
      y: sunPos.y + Math.sin(angleSE) * l2DistSE,
      type: 'collinear',
      desc: 'Anti-solar equilibrium point ~1.5M km behind Earth; host to the James Webb Space Telescope (JWST) & Gaia.',
      stability: 'Unstable (Halo required)'
    },
    {
      id: 'se-l3',
      name: 'Sun–Earth L3',
      system: 'sun-earth',
      x: sunPos.x + Math.cos(angleSE) * l3DistSE,
      y: sunPos.y + Math.sin(angleSE) * l3DistSE,
      type: 'collinear',
      desc: 'Hidden behind the Sun along the orbital axis; unstable equilibrium point.',
      stability: 'Unstable (Halo required)'
    },
    {
      id: 'se-l4',
      name: 'Sun–Earth L4',
      system: 'sun-earth',
      x: sunPos.x + Math.cos(angleSE + Math.PI / 3) * distSE,
      y: sunPos.y + Math.sin(angleSE + Math.PI / 3) * distSE,
      type: 'triangular',
      desc: 'Leading Trojan equilibrium point 60° ahead of Earth; gravitationally stable.',
      stability: 'Stable (Trojan orbit)'
    },
    {
      id: 'se-l5',
      name: 'Sun–Earth L5',
      system: 'sun-earth',
      x: sunPos.x + Math.cos(angleSE - Math.PI / 3) * distSE,
      y: sunPos.y + Math.sin(angleSE - Math.PI / 3) * distSE,
      type: 'triangular',
      desc: 'Trailing Trojan equilibrium point 60° behind Earth; gravitationally stable.',
      stability: 'Stable (Trojan orbit)'
    }
  ];

  // 2. Earth-Moon System
  const earthMoonPoints: LagrangePoint[] = [];
  if (moonPos) {
    const dxEM = moonPos.x - earthPos.x;
    const dyEM = moonPos.y - earthPos.y;
    const distEM = Math.hypot(dxEM, dyEM);
    const angleEM = Math.atan2(dyEM, dxEM);

    // Earth-Moon mass ratio mu_EM ~ 0.0123
    const muEM = 0.0123;
    const hillRadiusEM = distEM * Math.cbrt(muEM / 3);
    const visualHillEM = Math.max(9, hillRadiusEM * 1.5);

    const l1DistEM = distEM - visualHillEM;
    const l2DistEM = distEM + visualHillEM;
    const l3DistEM = -(distEM * 0.95);

    earthMoonPoints.push(
      {
        id: 'em-l1',
        name: 'Earth–Moon L1',
        system: 'earth-moon',
        x: earthPos.x + Math.cos(angleEM) * l1DistEM,
        y: earthPos.y + Math.sin(angleEM) * l1DistEM,
        type: 'collinear',
        desc: 'Between Earth and Moon; ideal staging orbit for lunar gateway missions.',
        stability: 'Unstable (Halo required)'
      },
      {
        id: 'em-l2',
        name: 'Earth–Moon L2',
        system: 'earth-moon',
        x: earthPos.x + Math.cos(angleEM) * l2DistEM,
        y: earthPos.y + Math.sin(angleEM) * l2DistEM,
        type: 'collinear',
        desc: 'Far side of the Moon; radio-quiet zone host for lunar communication relays (Queqiao).',
        stability: 'Unstable (Halo required)'
      },
      {
        id: 'em-l3',
        name: 'Earth–Moon L3',
        system: 'earth-moon',
        x: earthPos.x + Math.cos(angleEM) * l3DistEM,
        y: earthPos.y + Math.sin(angleEM) * l3DistEM,
        type: 'collinear',
        desc: 'Directly opposite the Moon on the Earth-Moon axis.',
        stability: 'Unstable (Halo required)'
      },
      {
        id: 'em-l4',
        name: 'Earth–Moon L4',
        system: 'earth-moon',
        x: earthPos.x + Math.cos(angleEM + Math.PI / 3) * distEM,
        y: earthPos.y + Math.sin(angleEM + Math.PI / 3) * distEM,
        type: 'triangular',
        desc: '60° ahead of the Moon; location of Kordylewski dust clouds.',
        stability: 'Stable (Trojan orbit)'
      },
      {
        id: 'em-l5',
        name: 'Earth–Moon L5',
        system: 'earth-moon',
        x: earthPos.x + Math.cos(angleEM - Math.PI / 3) * distEM,
        y: earthPos.y + Math.sin(angleEM - Math.PI / 3) * distEM,
        type: 'triangular',
        desc: '60° behind the Moon; stable gravitational parking zone.',
        stability: 'Stable (Trojan orbit)'
      }
    );
  }

  return { sunEarth: sunEarthPoints, earthMoon: earthMoonPoints };
}

/**
 * Calculate JWST 3D Lissajous / Halo orbit position around Sun-Earth L2.
 * Executes a quasi-periodic halo orbit in the rotating reference frame.
 */
export function getJwstHaloPosition(
  l2Point: LagrangePoint,
  sunPos: { x: number; y: number },
  earthPos: { x: number; y: number },
  time: number
): { x: number; y: number; haloAngle: number; heading: number } {
  const dx = earthPos.x - sunPos.x;
  const dy = earthPos.y - sunPos.y;
  const earthAngle = Math.atan2(dy, dx);

  // Halo orbit period is ~6 months (omega ~ 2 * earth_orbital_freq)
  const haloFreq = 0.025;
  const haloAngle = time * haloFreq;

  // Semi-axes of the halo orbit (in plane vs out of plane projection)
  const ax = 18; // In-plane radial amplitude
  const ay = 28; // Transverse amplitude

  // Rotated coordinates aligned with Sun-Earth axis
  const localX = Math.sin(haloAngle) * ax;
  const localY = Math.cos(haloAngle) * ay;

  // Transform to simulation inertial plane
  const perpAngle = earthAngle + Math.PI / 2;
  const jwstX = l2Point.x + Math.cos(earthAngle) * localX + Math.cos(perpAngle) * localY;
  const jwstY = l2Point.y + Math.sin(earthAngle) * localX + Math.sin(perpAngle) * localY;

  // Sunshield points directly toward Sun (away from positive Sun-Earth vector)
  const heading = Math.atan2(-jwstY, -jwstX) - Math.PI / 2;

  return {
    x: jwstX,
    y: jwstY,
    haloAngle,
    heading
  };
}

/**
 * Draw Gravitational Jacobi Potential Contours around Sun-Earth and Earth-Moon.
 */
export function drawGravitationalContours(
  ctx: CanvasRenderingContext2D,
  sunPos: { x: number; y: number },
  earthPos: { x: number; y: number },
  moonPos: { x: number; y: number } | null,
  lagrange: { sunEarth: LagrangePoint[]; earthMoon: LagrangePoint[] },
  zoom: number
) {
  ctx.save();

  // 1. Sun-Earth Gravitational Contours
  const dx = earthPos.x - sunPos.x;
  const dy = earthPos.y - sunPos.y;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(sunPos.x, sunPos.y);
  ctx.rotate(angle);

  // Draw Roche lobe / Jacobi equipotential contours
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1 / zoom;

  // Primary equipotential oval passes through L1 and L2
  const l1 = lagrange.sunEarth.find(p => p.id === 'se-l1');
  const l2 = lagrange.sunEarth.find(p => p.id === 'se-l2');
  const l1Dist = l1 ? Math.hypot(l1.x - sunPos.x, l1.y - sunPos.y) : dist - 25;
  const l2Dist = l2 ? Math.hypot(l2.x - sunPos.x, l2.y - sunPos.y) : dist + 25;

  // Figure-8 Roche lobe passing through L1
  ctx.beginPath();
  const earthRelX = dist;
  const earthRobeRadius = (l2Dist - l1Dist) * 0.55;

  // Earth Hill Sphere / Roche Lobe
  ctx.ellipse(earthRelX, 0, earthRobeRadius * 1.05, earthRobeRadius * 0.85, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Outer Jacobi boundary contour enclosing L1, L2, L4, L5
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(147, 197, 253, 0.08)';
  ctx.setLineDash([4 / zoom, 4 / zoom]);
  ctx.ellipse(dist * 0.5, 0, dist * 0.65, dist * 0.58, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Outer horseshoe / tadpole libration contour passing through L4 & L5
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.09)';
  ctx.arc(0, 0, dist, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Connecting equilateral lines to L4 and L5
  const l4RelX = dist * Math.cos(Math.PI / 3);
  const l4RelY = dist * Math.sin(Math.PI / 3);
  const l5RelX = dist * Math.cos(-Math.PI / 3);
  const l5RelY = dist * Math.sin(-Math.PI / 3);

  ctx.strokeStyle = 'rgba(168, 85, 247, 0.14)';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(l4RelX, l4RelY); ctx.lineTo(earthRelX, 0);
  ctx.moveTo(0, 0); ctx.lineTo(l5RelX, l5RelY); ctx.lineTo(earthRelX, 0);
  ctx.stroke();

  ctx.restore();

  // 2. Earth-Moon Gravitational Contours
  if (moonPos) {
    const dxM = moonPos.x - earthPos.x;
    const dyM = moonPos.y - earthPos.y;
    const distM = Math.hypot(dxM, dyM);
    const angleM = Math.atan2(dyM, dxM);

    ctx.save();
    ctx.translate(earthPos.x, earthPos.y);
    ctx.rotate(angleM);

    ctx.strokeStyle = 'rgba(214, 211, 209, 0.15)';
    ctx.lineWidth = 0.8 / zoom;

    // Moon Hill Sphere
    ctx.beginPath();
    ctx.ellipse(distM, 0, distM * 0.28, distM * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lunar Orbit Equipotential
    ctx.beginPath();
    ctx.setLineDash([2 / zoom, 3 / zoom]);
    ctx.arc(0, 0, distM, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  // 3. Draw Lagrange Points Markers (L1 - L5)
  const allPoints = [...lagrange.sunEarth, ...lagrange.earthMoon];
  allPoints.forEach(lp => {
    const isSE = lp.system === 'sun-earth';
    const baseColor = isSE ? (lp.type === 'triangular' ? '#c084fc' : '#38bdf8') : '#cbd5e1';
    
    // Glowing equilibrium point crosshair
    ctx.beginPath();
    const r = 2.5 / zoom;
    ctx.arc(lp.x, lp.y, r, 0, Math.PI * 2);
    ctx.fillStyle = baseColor;
    ctx.fill();

    // Crosshair reticle
    const reticleLen = 5 / zoom;
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 0.75 / zoom;
    ctx.beginPath();
    ctx.moveTo(lp.x - reticleLen, lp.y); ctx.lineTo(lp.x + reticleLen, lp.y);
    ctx.moveTo(lp.x, lp.y - reticleLen); ctx.lineTo(lp.x, lp.y + reticleLen);
    ctx.stroke();

    // Label tag
    ctx.fillStyle = baseColor;
    ctx.font = `${Math.max(7, 9 / zoom)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(lp.name.replace('Sun–Earth ', '').replace('Earth–Moon ', 'M-'), lp.x + 6 / zoom, lp.y - 4 / zoom);
  });

  ctx.restore();
}
