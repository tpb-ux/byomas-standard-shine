import { CheckCircle2 } from "lucide-react";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

const Timeline = () => {
  const events: TimelineEvent[] = [
    {
      year: "2005",
      title: "Fundação",
      description: "Byomas Standard foi estabelecida como pioneira em padrões de certificação ambiental."
    },
    {
      year: "2010",
      title: "Expansão Global",
      description: "Projetos certificados em mais de 50 países, estabelecendo presença internacional."
    },
    {
      year: "2015",
      title: "5 Bilhões de Créditos",
      description: "Alcançamos a marca de 5 bilhões de créditos de carbono verificados globalmente."
    },
    {
      year: "2020",
      title: "Novos Padrões",
      description: "Lançamento de padrões para biodiversidade e desenvolvimento sustentável."
    },
    {
      year: "2025",
      title: "Liderança em Inovação",
      description: "Referência mundial em certificação climática com mais de 3.400 projetos ativos."
    }
  ];

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border md:left-1/2" />
      
      <div className="space-y-12">
        {events.map((event, index) => (
          <div
            key={index}
            className={`relative flex items-center ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
              <div className="ml-16 md:ml-0 bg-card border border-border p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-primary">{event.year}</span>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{event.title}</h3>
                <p className="text-muted-foreground">{event.description}</p>
              </div>
            </div>
            
            <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-primary border-4 border-background transform -translate-x-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
