
import Header from '../components/Header';
import Footer from '../components/Footer';
import TeamSection from '../components/TeamSection';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Team = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <TeamSection />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Team;
