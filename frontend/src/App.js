import React from 'react';
import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core';


import AppRoutes from './Routes/AppRoutes';

const theme = createTheme({
  focusRing:"never",
  colors:{
    'ivosis': ['#effafc','#d6f3f7','#b3e6ee','#7ed2e2','#42b6ce','#279ab3','#24809c','#23657b','#245366','#224657','#112d3b'],
    'natural': ['#f6f6f6','#e7e7e7','#d1d1d1','#b0b0b0','#888888','#6d6d6d','#5d5d5d','#4f4f4f','#454545','#3d3d3d','#000000']
  },
  primaryColor:"ivosis",
  primaryShade:4,
  defaultGradient:{
    from:"ivosis.4",
    to:"ivosis.8",
    deg:132
  }
});
window.addEventListener('error', (event) => {
  if (event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    event.stopImmediatePropagation();
    event.preventDefault();
    console.warn('ResizeObserver loop hatası yoksayıldı');
  }
});
function App() {
  return (
    <MantineProvider theme={theme}>
      <AppRoutes />
    </MantineProvider>
  );
}

export default App;
