import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import User from "./pages/User"; // Fontos: nagybetű!
import Login from './pages/Auth/login';
import Register from './pages/Auth/register';
import Protected from './pages/protected';
import SportList from './pages/sportok';
import SearchResults from './pages/searchresult';
import HomePage from './pages/Main/Homepage';
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
          <Route path ="/search" element={<SearchResults />} />
          <Route path ="/homepage" element={<HomePage />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
