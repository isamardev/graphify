import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage team members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>Manage project categories</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collections">
            <Card>
              <CardHeader>
                <CardTitle>Collection Management</CardTitle>
                <CardDescription>Manage art collections</CardDescription>
              </CardHeader>
              <CardContent>
                <CollectionManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Manage projects and artwork</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
                <CardDescription>Manage services and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <ServiceManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authors">
            <Card>
              <CardHeader>
                <CardTitle>Author Management</CardTitle>
                <CardDescription>Manage blog authors</CardDescription>
              </CardHeader>
              <CardContent>
                <AuthorManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blogs">
            <Card>
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>Manage blog posts and content</CardDescription>
              </CardHeader>
              <CardContent>
                <BlogManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>View contact form submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Quote Requests</CardTitle>
                <CardDescription>View quote request submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <QuoteViewer />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>Manage client reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
