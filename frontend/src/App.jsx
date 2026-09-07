import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BoardList from './components/Board/BoardList';
import Board from './components/Board/Board';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/boards" element={<BoardList />} />
          <Route path="/board/:id" element={<Board />} />
          <Route path="/" element={<Navigate to="/boards" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;