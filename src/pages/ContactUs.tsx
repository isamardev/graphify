import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import FloatingCTA from '@/components/FloatingCTA';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle,
  Building,
  Users,
  Palette,
  Home
} from 'lucide-react';

const ContactUs = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    projectType: '',
    budget: '',
    timeline: '',
    message: '',
    attachments: ''
  });
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const projectDetail = [
      formData.message,
      formData.projectType ? `Project type: ${formData.projectType}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      business_type: formData.businessType,
      project_budget: formData.budget,
      project_timeline: formData.timeline,
      project_detail: projectDetail,
      reference_file: formData.attachments
    };

    try {
      await axios.post(`${apiBase}/api/contacts`, payload);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        businessType: '',
        projectType: '',
        budget: '',
        timeline: '',
        message: '',
        attachments: ''
      });
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'Please try again in a moment.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Studio",
      details: ["123 Design Street", "Creative District", "Karachi, Pakistan"],
      action: "Get Directions"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+92 321 234 5678", "+92 333 456 7890"],
      action: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["hello@graphify.com", "projects@graphify.com"],
      action: "Send Email"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM", "Sun: Closed"],
      action: null
    }
  ];

  const projectTypes = [
    { icon: Building, label: "Corporate Office", value: "corporate" },
    { icon: Home, label: "Healthcare Facility", value: "healthcare" },
    { icon: Users, label: "Hospitality", value: "hospitality" },
    { icon: Palette, label: "Residential", value: "residential" }
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
              Get In Touch
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
              Start Your <span className="bg-gradient-to-r from-[#3584DE] to-[#06B6D4] bg-clip-text text-transparent">Transformation</span>
            </h1>
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
              Have a project in mind? We'd love to hear from you. Let's create something extraordinary together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {[
                { icon: MapPin, title: "Our Studio", detail: "123 Creative Avenue, Design District, NY 10001", color: "text-[#3584DE]" },
                { icon: Phone, title: "Call Us", detail: "+1 (555) 123-4567", color: "text-[#06B6D4]" },
                { icon: Mail, title: "Email Us", detail: "hello@graphify.art", color: "text-blue-400" },
                { icon: Clock, title: "Working Hours", detail: "Mon - Fri: 9:00 AM - 6:00 PM", color: "text-cyan-400" }
              ].map((item, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl group hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1 tracking-tight">{item.title}</h4>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">{item.detail}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-300 ml-1">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-[#3584DE]"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-[#3584DE]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-300 ml-1">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-[#3584DE]"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="businessType" className="text-sm font-medium text-gray-300 ml-1">Business Type</Label>
                      <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12 focus:ring-[#3584DE]">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-white/10 text-white">
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Hospitality">Hospitality</SelectItem>
                          <SelectItem value="Residential">Residential</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-sm font-medium text-gray-300 ml-1">Your Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project vision..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white rounded-xl min-h-[150px] focus:ring-[#3584DE] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#3584DE] hover:bg-[#3584DE]/90 text-white h-14 rounded-xl text-lg font-bold shadow-lg shadow-[#3584DE]/20 transition-all duration-300 hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </div>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <FloatingCTA />
    </div>
  );
};

export default ContactUs;
