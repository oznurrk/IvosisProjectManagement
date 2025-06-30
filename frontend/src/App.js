import React from 'react';
import '@mantine/core/styles.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, MantineProvider } from '@mantine/core';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import AdminPanel from './pages/AdminPanel';

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

function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}/>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
