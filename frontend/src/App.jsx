import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import User from "./pages/User"; // Fontos: nagybetű!
import Login from './pages/login';
import Register from './pages/register';
import Protected from './pages/protected';
import SportList from './pages/sportok';
import Main from './pages/Main';
import Teszt from './pages/teszt';
function App() {
  return (
    <Router> {/* Itt ágyazd be Router-be */}
      <div>
        <Routes>
          <Route path="/" element={<User />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/protected" element={<Protected />} />
          <Route path ="/sportok" element={<SportList />} />
          <Route path ="/home" element={<Main />} />
          <Route path ="/teszt" element={<Teszt />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
