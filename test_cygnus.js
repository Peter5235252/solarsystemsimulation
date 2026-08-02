const cygnus = {
    cx: 600,
    cy: -1900,
    scale: 6,
    points: [
      { x: -14, y: 15, name: 'Deneb' },  // 0 Deneb
      { x: 0, y: 0, name: 'Sadr' },     // 1 Sadr
      { x: 39, y: -37, name: 'Albireo' },  // 2 Albireo
      { x: 28, y: 15, name: 'Fawaris' },   // 3 Fawaris
      { x: -18, y: -19, name: 'Gienah' }  // 4 Gienah
    ]
};
// Cygnus X-1 is located near Eta Cygni, which is roughly halfway between Sadr (Gamma Cygni) and Albireo (Beta Cygni).
// Let's place it at roughly x=18, y=-18 relative to Sadr.
const cx1_x = 600 + (18 * 6);
const cx1_y = -1900 + (-18 * 6);
console.log(`Cygnus X-1 should be at roughly cx: ${cx1_x}, cy: ${cx1_y}`);
