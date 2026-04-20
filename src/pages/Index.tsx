import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import HeroSection from '../components/HeroSection';
import PortfolioSection from '../components/PortfolioSection';
import ServicesSection from '../components/ServicesSection';
import StorySection from '../components/StorySection';
import BookingSection from '../components/BookingSection';
import ReviewsSection from '../components/ReviewsSection';
import TeamSection from '../components/TeamSection';
import QuotationSection from '../components/QuotationSection';
import Footer from '../components/Footer';
import Header from '../components/Header';
import FloatingCTA from '../components/FloatingCTA';
import WhatsAppButton from '../components/WhatsAppButton';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== '#contact') return;
    const el = document.getElementById('contact');
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <HeroSection />
      <PortfolioSection />
      <ServicesSection />
      <StorySection />
      <TeamSection />
      <BookingSection />
      <ReviewsSection />
      <QuotationSection />
      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default Index;
