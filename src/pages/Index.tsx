
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
  return (
    <div className="min-h-screen bg-white">
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
