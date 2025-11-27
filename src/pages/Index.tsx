import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ImpactSection from "@/components/ImpactSection";
import GreenTickSection from "@/components/GreenTickSection";
import StatsSection from "@/components/StatsSection";
import InfoSection from "@/components/InfoSection";
import PartnersSection from "@/components/PartnersSection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ScrollReveal>
        <div id="noticias">
          <NewsSection />
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <ProjectsSection />
      </ScrollReveal>
      <ScrollReveal>
        <ImpactSection />
      </ScrollReveal>
      <ScrollReveal>
        <GreenTickSection />
      </ScrollReveal>
      <ScrollReveal>
        <StatsSection />
      </ScrollReveal>
      <ScrollReveal>
        <div id="programas">
          <InfoSection />
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <PartnersSection />
      </ScrollReveal>
      <Footer />
    </div>
  );
};

export default Index;
