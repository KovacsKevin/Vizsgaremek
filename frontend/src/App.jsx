import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/login';
import Register from './pages/Auth/register';
import Protected from './pages/protected';
import SportList from './pages/sportok';
import HomePage from './pages/Main/Homepage';
import SportMateFinder from './pages/sport-mate-finder';
import MyEvents from "./pages/Main/MyEvents";
import TestImages from './pages/TestImages';
import Profile from './pages/Profile/Profile'; 

function App() {
  return (
    <Router> 
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/protected" element={<Protected />} />
          <Route path ="/sportok" element={<SportList />} />
          <Route path ="/" element={<HomePage />} />
          <Route path ="/sportmate" element={<SportMateFinder />} />
          <Route path ="/my-events" element={<MyEvents />} />
          <Route path ="/testimages" element={<TestImages />} />
          <Route path ="/profile" element={<Profile />} /> 
          <Route path="*" element={< HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
