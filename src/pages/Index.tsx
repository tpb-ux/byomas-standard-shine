import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ImpactSection from "@/components/ImpactSection";
import StatsSection from "@/components/StatsSection";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <NewsSection />
      <ProjectsSection />
      <ImpactSection />
      <StatsSection />
      <InfoSection />
      <Footer />
    </div>
  );
};

export default Index;
