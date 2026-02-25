
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Team } from '@/lib/adminData';

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';
  const assetBase = apiBase.replace(/\/api\/?$/i, '');

  const normalizeImageUrl = (value?: string) => {
    if (!value) return '';
    if (/^(data:|blob:)/i.test(value)) return value;
    const injectPublic = (p: string) => p.replace(/^\/?storage\/(?!app\/public\/)/i, 'storage/app/public/');
    const cleaned = value.replace(/\\/g, '/');
    if (/^(https?:)?\/\//i.test(cleaned)) {
      try {
        const u = new URL(cleaned);
        u.pathname = injectPublic(u.pathname);
        return u.toString();
      } catch {
        return cleaned;
      }
    }
    if (cleaned.startsWith('/storage') || cleaned.startsWith('storage/')) {
      return `${assetBase}/${injectPublic(cleaned.replace(/^\/?/, ''))}`;
    }
    if (cleaned.startsWith('/')) return cleaned;
    return `/${cleaned}`;
  };

  useEffect(() => {
    let isActive = true;

    const normalizeTeam = (team: any): Team => ({
      id: String(team?.id ?? ''),
      name: team?.name || '',
      role: team?.role || '',
      description: team?.description || '',
      image: team?.image || ''
    });

    const loadTeams = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiBase}/api/teams`);
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setTeamMembers((Array.isArray(payload) ? payload : []).map(normalizeTeam));
      } catch (error) {
        if (!isActive) return;
        setTeamMembers([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadTeams();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Our <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Creative Team</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The talented artists and designers behind every masterpiece, bringing your vision to life with passion and expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-600">Loading team...</div>
          ) : teamMembers.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">No team members found.</div>
          ) : (
            teamMembers.map((member) => (
            <Card key={member.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="relative mb-6">
                  <img 
                    src={normalizeImageUrl(member.image)} 
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </CardContent>
            </Card>
          )))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
