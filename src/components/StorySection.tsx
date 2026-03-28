
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const StorySection = () => {
  const milestones = [
    {
      year: "2018",
      title: "The Beginning",
      description: "Started with a passion for transforming blank walls into meaningful art pieces"
    },
    {
      year: "2019",
      title: "First Hospital Project",
      description: "Completed our first healthcare facility, bringing joy to children's wards"
    },
    {
      year: "2021",
      title: "Corporate Expansion",
      description: "Expanded into corporate and commercial spaces, creating branded environments"
    },
    {
      year: "2024",
      title: "200+ Projects",
      description: "Celebrating over 200 successful projects across various industries"
    }
  ];

  return (
    <section id="story" className="py-16 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
            Our Legacy
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            The Story Behind <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Graphify</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Born from a belief that every wall has the potential to inspire, heal, and transform spaces into experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white tracking-tight">Our Mission</h3>
              <p className="text-lg text-gray-400 leading-relaxed font-light">
                At Graphify, we believe that art has the power to transform not just spaces, but emotions and experiences. 
                Our mission is to create wall art that tells stories - whether it's bringing comfort to hospital patients, 
                inspiring creativity in offices, or adding warmth to homes.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-lg text-gray-400 leading-relaxed font-light">
                We combine artistic excellence with deep understanding of how visual elements affect human psychology, 
                creating pieces that don't just look beautiful, but serve a purpose in enhancing the human experience.
              </p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#3584DE] to-[#06B6D4] rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative aspect-square bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-black/40">
              <div className="text-8xl font-black bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent mb-2">
                200+
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                Projects Completed
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
