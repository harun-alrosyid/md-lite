import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Technical from './components/Technical';
import Download from './components/Download';
import About from './components/About';
import Support from './components/Support';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen transition-colors selection:bg-indigo-500/30 selection:text-white" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Technical />
        <Download />
        <About />
        <Support />
      </main>
      <Footer />
    </div>
  );
}

export default App;
