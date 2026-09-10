import { Route, Routes } from 'react-router-dom';
import { ComponentsGalleryPage } from './pages/ComponentsGalleryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ComponentsGalleryPage />} />
    </Routes>
  );
}
