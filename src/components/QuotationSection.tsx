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
import { Badge } from '@/components/ui/badge';

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
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <section id="contact" className={`${isModal ? 'p-0' : 'py-16 md:py-24 bg-transparent relative overflow-hidden'}`}>
      {!isModal && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#3584DE]/5 blur-[120px] -z-10 rounded-full scale-150"></div>
      )}
      
      <div className={`${isModal ? '' : 'max-w-7xl mx-auto px-4 md:px-6'}`}>
        <Card className={`${isModal ? 'border-none rounded-none shadow-none bg-[#0F172A]' : 'bg-white/5 border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className={`lg:col-span-2 p-8 md:p-12 bg-gradient-to-br from-[#3584DE] to-[#06B6D4] text-white flex flex-col justify-between`}>
              <div>
                <Badge variant="outline" className="mb-6 border-white/20 text-white bg-white/10 px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                  Get a Quote
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Let's Create <br />Something <span className="text-white/70 italic">Extraordinary</span></h2>
                <p className="text-white/80 font-light leading-relaxed mb-8">
                  Fill out the form to receive a personalized proposal for your project. Our design team will review your requirements and get back to you within 24 hours.
                </p>
                
                <div className="space-y-6">
                  {[
                    { title: "Bespoke Consultations", desc: "One-on-one sessions with our lead designers." },
                    { title: "Premium Materials", desc: "Access to exclusive, high-end textures and paints." },
                    { title: "Global Delivery", desc: "Expert teams available for international projects." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 shrink-0"></div>
                      <div>
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        <p className="text-white/60 text-xs font-light">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Support Email</p>
                <p className="text-lg font-medium">concierge@graphify.art</p>
              </div>
            </div>

            <div className="lg:col-span-3 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Full Name</Label>
                    <Input 
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Email Address</Label>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Project Type</Label>
                    <Select value={formData.projectType} onValueChange={(val) => handleInputChange('projectType', val)}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-white/10 text-white">
                        <SelectItem value="Residential">Residential Art</SelectItem>
                        <SelectItem value="Corporate">Corporate Graphics</SelectItem>
                        <SelectItem value="Healthcare">Healthcare Murals</SelectItem>
                        <SelectItem value="Hospitality">Hospitality Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Phone Number</Label>
                    <Input 
                      placeholder="+1 (555) 000-0000" 
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Estimated Budget</Label>
                    <Select value={formData.budget} onValueChange={(val) => handleInputChange('budget', val)}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE]">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-white/10 text-white">
                        <SelectItem value="Small">Under $1,000</SelectItem>
                        <SelectItem value="Medium">$1,000 - $5,000</SelectItem>
                        <SelectItem value="Large">$5,000 - $15,000</SelectItem>
                        <SelectItem value="Premium">$15,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Preferred Style</Label>
                    <Input 
                      placeholder="e.g. Minimalist, Abstract, Realistic" 
                      value={formData.style}
                      onChange={(e) => handleInputChange('style', e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Wall Dimensions</Label>
                    <Input 
                      placeholder="e.g. 10ft x 12ft" 
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm ml-1">Project Deadline</Label>
                    <Input 
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#3584DE] [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm ml-1">Project Description</Label>
                  <Textarea 
                    placeholder="Tell us about your space and vision..." 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    className="bg-white/5 border-white/10 rounded-xl min-h-[120px] text-white focus:ring-[#3584DE] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-gray-300 text-sm ml-1">Reference Images (Optional)</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Upload</span>
                      </Label>
                    </div>
                    {formData.referenceImages && Array.from(formData.referenceImages).map((file, idx) => (
                      <div key={idx} className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-full object-cover" 
                        />
                        <button 
                          type="button"
                          onClick={() => removeFiles()}
                          className="absolute top-2 right-2 w-6 h-6 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#3584DE] hover:bg-[#3584DE]/90 text-white h-16 text-lg font-bold rounded-2xl shadow-lg shadow-[#3584DE]/20 transition-all duration-300 hover:scale-[1.01]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting Request...</span>
                    </div>
                  ) : (
                    "Send Request"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default QuotationSection;
