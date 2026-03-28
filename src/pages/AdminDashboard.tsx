import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Folder, Image, Briefcase, MessageSquare, Quote, User, FileText, Star } from 'lucide-react';
import { TeamManager } from '@/components/admin/TeamManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { CollectionManager } from '@/components/admin/CollectionManager';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { ServiceManager } from '@/components/admin/ServiceManager';
import { AuthorManager } from '@/components/admin/AuthorManager';
import { BlogManager } from '@/components/admin/BlogManager';
import { ContactViewer } from '@/components/admin/ContactViewer';
import { QuoteViewer } from '@/components/admin/QuoteViewer';
import { ReviewManager } from '@/components/admin/ReviewManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
    
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'collections', label: 'Collections', icon: Image },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'authors', label: 'Authors', icon: User },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'contacts', label: 'Contacts', icon: MessageSquare },
    { id: 'quotes', label: 'Quotes', icon: Quote },
    { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white tracking-tight">Admin <span className="text-[#06B6D4]">Dashboard</span></h1>
              <Badge variant="outline" className="border-[#3584DE]/20 text-[#3584DE] bg-[#3584DE]/5">v2.0 Luxury</Badge>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-white/5 p-1 text-gray-400 border border-white/10 min-w-full lg:min-w-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#3584DE] data-[state=active]:text-white data-[state=active]:shadow-lg shadow-[#3584DE]/20 gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="teams" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Team Management</CardTitle>
                <CardDescription className="text-gray-400">Manage team members and their roles in the organization.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <TeamManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Categories</CardTitle>
                <CardDescription className="text-gray-400">Organize your collections into meaningful categories.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <CategoryManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Collection Management</CardTitle>
                <CardDescription className="text-gray-400">Manage your portfolio collections and artworks.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <CollectionManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Project Management</CardTitle>
                <CardDescription className="text-gray-400">Manage individual projects and gallery items.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ProjectManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Service Management</CardTitle>
                <CardDescription className="text-gray-400">Manage professional services and pricing.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ServiceManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authors" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Author Management</CardTitle>
                <CardDescription className="text-gray-400">Manage authors for your journal articles.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <AuthorManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blogs" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Blog Management</CardTitle>
                <CardDescription className="text-gray-400">Manage blog posts and editorial content.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <BlogManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Contact Messages</CardTitle>
                <CardDescription className="text-gray-400">View and manage contact form inquiries.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ContactViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Quote Requests</CardTitle>
                <CardDescription className="text-gray-400">View and manage project quote requests.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <QuoteViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0 focus-visible:outline-none">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader className="border-b border-white/5 pb-8">
                <CardTitle className="text-2xl font-bold text-white">Review Management</CardTitle>
                <CardDescription className="text-gray-400">Manage client reviews and feedback.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <ReviewManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
