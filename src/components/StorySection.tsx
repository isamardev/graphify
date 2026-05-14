
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/BrandLogo';

const StorySection = () => {
  const milestones = [
    {
      year: "2018",
      title: "The Beginning",
      description: "Launched Walluxe focused on scalable, brand-aligned wall art for print partners"
    },
    {
      year: "2020",
      title: "Print Partner Focus",
      description: "Shifted fully to supplying print-ready packs and repeatable design systems for catalogs"
    },
    {
      year: "2022",
      title: "Global Reach",
      description: "Supporting printing brands overseas with turnaround-focused production workflows"
    },
    {
      year: "2026",
      title: "300+ Artworks Delivered",
      description: "Hundreds of print-ready artworks shipped, built for resale and showroom display"
    }
  ];

  return (
    <section id="story" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <BrandLogo imgClassName="h-10 md:h-11 w-auto max-w-[260px] md:max-w-[320px]" />
          </div>
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            Bespoke wall art · Print partners worldwide
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            The Story Behind <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Walluxe</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Built for printing companies that need a reliable design partner, not one-off files, but a pipeline of
            trend-aware, print-ready wall art.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white tracking-tight">Our Mission</h3>
              <p className="text-lg text-gray-400 leading-relaxed font-light">
                Walluxe exists to help printing brands grow their wall art lines with designs that sell, aligned to your
                audience, formatted for production, and licensed for commercial use.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-400 leading-relaxed font-light">
                We combine trend research with print specifications so your team spends less time fixing files and more
                time fulfilling orders for real customers.
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#3584DE] to-[#06B6D4] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative aspect-square bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-black/40">
              <div className="text-8xl font-black bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent mb-2">
                300+
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                Artworks Delivered
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Our <span className="text-[#06B6D4]">Journey</span></h3>
            <div className="h-px flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-500 group">
                <CardContent className="p-8 text-center">
                  <div className="text-3xl font-bold text-[#3584DE] mb-4 group-hover:scale-110 transition-transform duration-300">{milestone.year}</div>
                  <h4 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#06B6D4] transition-colors">{milestone.title}</h4>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
