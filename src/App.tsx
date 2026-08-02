/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import SolarSystem from './components/SolarSystem';
import GlassPreloader from './components/GlassPreloader';

export default function App() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, []);

  return (
    <>
      <GlassPreloader />
      <SolarSystem />
    </>
  );
}
