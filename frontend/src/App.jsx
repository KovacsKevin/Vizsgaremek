import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import User from "./pages/User"; // Fontos: nagybetű!
import Login from './pages/Auth/login';
import Register from './pages/Auth/register';
import Protected from './pages/protected';
import SportList from './pages/sportok';
//import SearchResults from './pages/searchresult';
import HomePage from './pages/Main/Homepage';
import SportMateFinder from './pages/sport-mate-finder';
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
          <Route path ="/homepage" element={<HomePage />} />
          <Route path ="/sportmate" element={<SportMateFinder />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
