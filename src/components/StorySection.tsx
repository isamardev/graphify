
import { Card, CardContent } from '@/components/ui/card';

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
    <section id="story" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The Story Behind <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Graphipy</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Born from a belief that every wall has the potential to inspire, heal, and transform spaces into experiences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white">Our Mission</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              At Graphipy, we believe that art has the power to transform not just spaces, but emotions and experiences. 
              Our mission is to create wall art that tells stories - whether it's bringing comfort to hospital patients, 
              inspiring creativity in offices, or adding warmth to homes.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              We combine artistic excellence with deep understanding of how visual elements affect human psychology, 
              creating pieces that don't just look beautiful, but serve a purpose in enhancing the human experience.
            </p>
          </div>
          
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-yellow-400/20 to-pink-400/20 rounded-full flex items-center justify-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                200+
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white text-gray-900 px-4 py-2 rounded-full font-semibold">
              Projects Completed
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <h3 className="text-3xl font-bold text-center mb-12">Our Journey</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{milestone.year}</div>
                  <h4 className="text-xl font-semibold text-white mb-3">{milestone.title}</h4>
                  <p className="text-gray-300 text-sm">{milestone.description}</p>
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
