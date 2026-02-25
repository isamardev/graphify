import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Quote } from '@/lib/adminData';

export const QuoteViewer = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';
  const assetBase = apiBase.replace(/\/api\/?$/i, '');

  const buildApiUrl = (segment: string) => {
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const root = /\/api$/i.test(base) ? base : `${base}/api`;
    return `${root}/${segment.replace(/^\/+/, '')}`;
  };

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

  const getFirstReferenceImage = (value: unknown) => {
    if (!value) return '';
    if (Array.isArray(value)) {
      return String(value.find(Boolean) ?? '');
    }
    if (typeof value === 'string') {
      const first = value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)[0];
      return first || value;
    }
    if (typeof value === 'object') {
      const maybeUrl = (value as any)?.url ?? (value as any)?.path ?? '';
      return typeof maybeUrl === 'string' ? maybeUrl : '';
    }
    return '';
  };

  useEffect(() => {
    let isActive = true;

    const normalizeQuote = (quote: any): Quote => ({
      id: String(quote?.id ?? ''),
      name: quote?.name || '',
      email: quote?.email || '',
      phone: quote?.phone || '',
      project_type: quote?.project_type || '',
      budget_range: quote?.budget_range || '',
      preferred_style: quote?.preferred_style || '',
      wall_dimension: quote?.wall_dimension || '',
      project_deadline: quote?.project_deadline || '',
      project_description: quote?.project_description || '',
      reference_image: quote?.reference_image || '',
      created_at: quote?.created_at || ''
    });

    const loadQuotes = async () => {
      try {
        const response = await axios.get(buildApiUrl('quotes'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setQuotes((Array.isArray(payload) ? payload : []).map(normalizeQuote));
      } catch (error) {
        if (!isActive) return;
        setQuotes([]);
      }
    };

    loadQuotes();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const refreshQuotes = async () => {
    try {
      const response = await axios.get(buildApiUrl('quotes'));
      const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setQuotes((Array.isArray(payload) ? payload : []).map((quote: any) => ({
        id: String(quote?.id ?? ''),
        name: quote?.name || '',
        email: quote?.email || '',
        phone: quote?.phone || '',
        project_type: quote?.project_type || '',
        budget_range: quote?.budget_range || '',
        preferred_style: quote?.preferred_style || '',
        wall_dimension: quote?.wall_dimension || '',
        project_deadline: quote?.project_deadline || '',
        project_description: quote?.project_description || '',
        reference_image: quote?.reference_image || '',
        created_at: quote?.created_at || ''
      })));
    } catch (error) {
      setQuotes([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quote Requests</h3>
        <Button
          onClick={refreshQuotes}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Project Type</TableHead>
              <TableHead>Budget Range</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No quote requests found
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.name}</TableCell>
                  <TableCell>{quote.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{quote.project_type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">{quote.budget_range}</TableCell>
                  <TableCell className="text-sm">{quote.project_deadline}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(quote.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingQuote(quote)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingQuote} onOpenChange={() => setViewingQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quote Request Details</DialogTitle>
          </DialogHeader>
          {viewingQuote && (
            <div className="space-y-4">
              {(() => {
                const referenceImageUrl = normalizeImageUrl(
                  getFirstReferenceImage((viewingQuote as any).reference_image)
                );
                return (
                  <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Name:</Label>
                  <p className="text-sm">{viewingQuote.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Email:</Label>
                  <p className="text-sm">{viewingQuote.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Phone:</Label>
                  <p className="text-sm">{viewingQuote.phone}</p>
                </div>
                <div>
                  <Label className="font-medium">Project Type:</Label>
                  <Badge variant="secondary">{viewingQuote.project_type}</Badge>
                </div>
                <div>
                  <Label className="font-medium">Budget Range:</Label>
                  <p className="text-sm font-semibold text-primary">{viewingQuote.budget_range}</p>
                </div>
                <div>
                  <Label className="font-medium">Preferred Style:</Label>
                  <p className="text-sm">{viewingQuote.preferred_style}</p>
                </div>
                <div>
                  <Label className="font-medium">Wall Dimension:</Label>
                  <p className="text-sm">{viewingQuote.wall_dimension}</p>
                </div>
                <div>
                  <Label className="font-medium">Project Deadline:</Label>
                  <p className="text-sm">{viewingQuote.project_deadline}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Project Description:</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {viewingQuote.project_description}
                </p>
              </div>
              {referenceImageUrl && (
                <div>
                  <Label className="font-medium">Reference Image:</Label>
                  <div className="mt-1">
                    <img
                      src={referenceImageUrl}
                      alt="Reference"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
              <div className="pt-2 border-t">
                <Label className="font-medium text-xs text-muted-foreground">
                  Submitted: {formatDate(viewingQuote.created_at)}
                </Label>
              </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
