import { Card, CardContent } from "@/components/ui/card";
import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";

const NewsSection = () => {
  const news = [
    {
      image: news1,
      category: "NATUREZA",
      title: "Projeto da agricultura e todo mundo natureza de fluxo",
      date: "01 de setembro, 2025"
    },
    {
      image: news2,
      category: "CLIMA",
      title: "A flora amazônia diz que os novos padrões são vitais",
      date: "28 de agosto, 2025"
    },
    {
      image: news3,
      category: "SUSTENTABILIDADE",
      title: "Segundo dia conferência sobre direito climático internacional",
      date: "25 de agosto, 2025"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">ÚLTIMAS NOTÍCIAS</h2>
          <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80">
            VER TODAS AS NOTÍCIAS →
          </a>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item, index) => (
            <Card key={index} className="group overflow-hidden border-none shadow-card transition-all hover:shadow-lg">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <p className="mb-2 text-xs font-semibold text-secondary">{item.category}</p>
                <h3 className="mb-3 text-lg font-semibold leading-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
