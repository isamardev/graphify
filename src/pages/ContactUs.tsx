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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 mt-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get In <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to transform your space with stunning wall art? Let's discuss your project and bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 mx-auto">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-gray-900">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm mb-1">{detail}</p>
                    ))}
                    {info.action && (
                      <Button variant="outline" size="sm" className="mt-3">
                        {info.action}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tell Us About Your Project
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below with your project details, and we'll get back to you with a personalized consultation and quote.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+92 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select onValueChange={(value) => handleInputChange('businessType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">Project Budget</Label>
                    <Select onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-50k">Under PKR 50,000</SelectItem>
                        <SelectItem value="50k-100k">PKR 50,000 - 100,000</SelectItem>
                        <SelectItem value="100k-250k">PKR 100,000 - 250,000</SelectItem>
                        <SelectItem value="250k-500k">PKR 250,000 - 500,000</SelectItem>
                        <SelectItem value="500k-1m">PKR 500,000 - 1,000,000</SelectItem>
                        <SelectItem value="over-1m">Over PKR 1,000,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP</SelectItem>
                        <SelectItem value="1-month">Within 1 month</SelectItem>
                        <SelectItem value="2-3-months">2-3 months</SelectItem>
                        <SelectItem value="3-6-months">3-6 months</SelectItem>
                        <SelectItem value="6-months-plus">6+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Project Details *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your space, design preferences, and project goals..."
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="attachments">Reference Files (Optional)</Label>
                  <Input
                    id="attachments"
                    value={formData.attachments}
                    onChange={(e) => handleInputChange('attachments', e.target.value)}
                    placeholder="Share a link to your inspiration images or files"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You can share Google Drive, Dropbox, or other file sharing links
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Message...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Project Types & Additional Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  What We Specialize In
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projectTypes.map((type, index) => {
                    const IconComponent = type.icon;
                    return (
                      <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-4 text-center">
                          <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <h4 className="font-semibold text-gray-900">{type.label}</h4>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Free Consultation</h4>
                      <p className="text-gray-600 text-sm">
                        Every project starts with a complimentary consultation to understand your vision and space.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Custom Design Process</h4>
                      <p className="text-gray-600 text-sm">
                        We create bespoke designs tailored specifically to your space and requirements.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Professional Installation</h4>
                      <p className="text-gray-600 text-sm">
                        Our experienced team ensures perfect installation and finishing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prefer to Schedule a Call?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Book a consultation call to discuss your project in detail with our design experts.
                  </p>
                  <Link to="/#contact">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Schedule Consultation
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Map placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visit Our Studio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive Map</p>
                      <p className="text-sm text-gray-500">123 Design Street, Creative District</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <WhatsAppButton />
      <FloatingCTA />
      <Footer />
    </div>
  );
};

export default ContactUs;
