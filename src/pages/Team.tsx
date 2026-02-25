
import Header from '../components/Header';
import Footer from '../components/Footer';
import TeamSection from '../components/TeamSection';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Team = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center mb-6">
            <Link to="/" className="flex items-center text-white hover:text-yellow-400 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Our <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Team</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet the passionate artists and designers who bring creativity, expertise, and dedication to every project we undertake.
            </p>
          </div>
        </div>
      </section>

      <TeamSection />
      <Footer />
    </div>
  );
};

export default Team;
