import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import User from "./pages/User"; // Fontos: nagybetű!

function App() {
  return (
    <Router> {/* Itt ágyazd be Router-be */}
      <div>
        <Routes>
          <Route path="/" element={<User />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
