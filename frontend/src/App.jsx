import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './store/UserContext';
import { ReviewProvider } from './store/reviewContext';
import NavBar from './components/NavBar';
import Start from './views/Start';
import BakerySelection from './views/BakerySelection';
import PastrySelection from './views/PastrySelection';
import PastryRating from './views/PastryRating';
import BakeryRating from './views/BakeryRating';
import ThankYou from './views/ThankYou';
import Admin from './views/Admin';

// Import CSS
import './styles/global.css';

function App() {
  return (
    <UserProvider>
      <ReviewProvider>
        <Router>
          <div className="app">
            <NavBar />
            <main className="app-content">
              <Routes>
                <Route path="/" element={<Start />} />
                <Route path="/bakery-selection" element={<BakerySelection />} />
                <Route path="/pastry-selection" element={<PastrySelection />} />
                <Route path="/pastry-rating" element={<PastryRating />} />
                <Route path="/bakery-rating" element={<BakeryRating />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/admin/*" element={<Admin />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ReviewProvider>
    </UserProvider>
  );
}

export default App;