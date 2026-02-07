import { HashRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import StockList from './pages/StockList';
import StockDetail from './pages/StockDetail';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="stocks" element={<StockList />} />
          <Route path="stocks/:ticker" element={<StockDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
