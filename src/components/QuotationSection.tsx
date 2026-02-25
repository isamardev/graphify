import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type QuotationSectionProps = {
  variant?: 'section' | 'modal';
  onSubmitted?: () => void;
};

const QuotationSection = ({ variant = 'section', onSubmitted }: QuotationSectionProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    projectType: '',
    style: '',
    dimensions: '',
    deadline: '',
    description: '',
    referenceImages: null as FileList | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';
  const isModal = variant === 'modal';

  const buildApiUrl = (segment: string) => {
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const root = /\/api$/i.test(base) ? base : `${base}/api`;
    return `${root}/${segment.replace(/^\/+/, '')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('email', formData.email);
    payload.append('phone', formData.phone);
    payload.append('project_type', formData.projectType);
    payload.append('budget_range', formData.budget);
    payload.append('preferred_style', formData.style);
    payload.append('wall_dimension', formData.dimensions);
    payload.append('project_deadline', formData.deadline);
    payload.append('project_description', formData.description);
    if (formData.referenceImages && formData.referenceImages.length > 0) {
      Array.from(formData.referenceImages).forEach((file) => {
        payload.append('reference_image', file);
      });
    }

    try {
      await axios.post(buildApiUrl('quotes'), payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast({
        title: 'Quote request sent!',
        description: "We'll respond with a customized quote soon."
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        budget: '',
        projectType: '',
        style: '',
        dimensions: '',
        deadline: '',
        description: '',
        referenceImages: null
      });
      removeFiles();
      onSubmitted?.();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, referenceImages: e.target.files }));
  };

  const removeFiles = () => {
    setFormData(prev => ({ ...prev, referenceImages: null }));
    const fileInput = document.getElementById('referenceImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const content = (
    <div className={isModal ? 'max-w-5xl mx-auto' : 'container mx-auto px-6'}>
      <div className={isModal ? 'text-center mb-10' : 'text-center mb-16'}>
        <h2 className={isModal ? 'text-3xl md:text-4xl font-bold text-white mb-3' : 'text-4xl md:text-5xl font-bold text-white mb-4'}>
          Get Your Custom <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Quote</span>
        </h2>
        <p className={isModal ? 'text-base md:text-lg text-gray-300 max-w-3xl mx-auto' : 'text-xl text-gray-300 max-w-3xl mx-auto'}>
          Share your vision with us and receive a detailed quote tailored to your specific requirements
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Project Details Form</CardTitle>
            <p className="text-gray-300">The more details you provide, the more accurate your quote will be</p>
          </CardHeader>
          <CardContent className={isModal ? 'p-6 sm:p-8' : 'p-8'}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white">Budget Range</Label>
                  <Select onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                      <SelectItem value="25000+">$25,000+</SelectItem>
                      <SelectItem value="discuss">Let's Discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="projectType" className="text-white">Project Type *</Label>
                  <Select onValueChange={(value) => handleInputChange('projectType', value)}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home Interior</SelectItem>
                      <SelectItem value="office">Office/Corporate</SelectItem>
                      <SelectItem value="healthcare">Healthcare Facility</SelectItem>
                      <SelectItem value="cafe">Cafe/Restaurant</SelectItem>
                      <SelectItem value="fitness">Fitness/Wellness Center</SelectItem>
                      <SelectItem value="retail">Retail Space</SelectItem>
                      <SelectItem value="educational">Educational Institution</SelectItem>
                      <SelectItem value="custom">Custom Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="style" className="text-white">Preferred Style</Label>
                  <Select onValueChange={(value) => handleInputChange('style', value)}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue placeholder="Select preferred style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern/Contemporary</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="realistic">Realistic/Photographic</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="colorful">Bright & Colorful</SelectItem>
                      <SelectItem value="calligraphy">Calligraphy/Typography</SelectItem>
                      <SelectItem value="nature">Nature/Landscape</SelectItem>
                      <SelectItem value="geometric">Geometric Patterns</SelectItem>
                      <SelectItem value="custom">Custom Style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dimensions" className="text-white">Wall Dimensions</Label>
                  <Input
                    id="dimensions"
                    type="text"
                    placeholder="e.g., 10ft x 8ft or 3m x 2.5m"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-white">Project Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="bg-white/10 border-white/30 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Project Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your vision, space usage, color preferences, themes, and any specific requirements..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 min-h-[150px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceImages" className="text-white">Upload Reference Images (optional)</Label>
                <div className="relative">
                  <div className="bg-white/10 border-2 border-dashed border-white/30 rounded-lg p-6 text-center hover:border-white/50 transition-colors">
                    <input
                      id="referenceImages"
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-white/70 mb-3" />
                      <p className="text-white text-sm mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-400 text-xs">
                        JPG, PNG, PDF files • Max 5 files • Up to 10MB each
                      </p>
                    </div>
                  </div>
                  
                  {formData.referenceImages && formData.referenceImages.length > 0 && (
                    <div className="mt-3 bg-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">
                          {formData.referenceImages.length} file(s) selected
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFiles}
                          className="text-white hover:text-red-300 hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white px-12 py-4 text-lg rounded-full"
                >
                  {isSubmitting ? 'Sending...' : 'Get My Custom Quote'}
                </Button>
                <p className="text-gray-300 text-sm mt-3">
                  We'll provide a detailed quote within 48 hours
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6 sm:p-8">
        {content}
      </div>
    );
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {content}
    </section>
  );
};

export default QuotationSection;
