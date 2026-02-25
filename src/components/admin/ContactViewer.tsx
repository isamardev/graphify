import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Eye, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Contact } from '@/lib/adminData';

export const ContactViewer = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const apiBase = (import.meta as any)?.env?.VITE_API_BASE_URL || 'https://data.graphify.art';

  const buildApiUrl = (segment: string) => {
    const base = String(apiBase || '').replace(/\/+$/g, '');
    const root = /\/api$/i.test(base) ? base : `${base}/api`;
    return `${root}/${segment.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    let isActive = true;

    const normalizeContact = (contact: any): Contact => ({
      id: String(contact?.id ?? ''),
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      business_type: contact?.business_type || '',
      project_budget: contact?.project_budget || '',
      project_timeline: contact?.project_timeline || '',
      project_detail: contact?.project_detail || '',
      reference_file: contact?.reference_file || '',
      created_at: contact?.created_at || ''
    });

    const loadContacts = async () => {
      try {
        const response = await axios.get(buildApiUrl('contacts'));
        const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
        if (!isActive) return;
        setContacts((Array.isArray(payload) ? payload : []).map(normalizeContact));
      } catch (error) {
        if (!isActive) return;
        setContacts([]);
      }
    };

    loadContacts();

    return () => {
      isActive = false;
    };
  }, [apiBase]);

  const refreshContacts = async () => {
    try {
      const response = await axios.get(buildApiUrl('contacts'));
      const payload = Array.isArray(response.data?.data) ? response.data.data : response.data;
      setContacts((Array.isArray(payload) ? payload : []).map((contact: any) => ({
        id: String(contact?.id ?? ''),
        name: contact?.name || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        business_type: contact?.business_type || '',
        project_budget: contact?.project_budget || '',
        project_timeline: contact?.project_timeline || '',
        project_detail: contact?.project_detail || '',
        reference_file: contact?.reference_file || '',
        created_at: contact?.created_at || ''
      })));
    } catch (error) {
      setContacts([]);
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
        <h3 className="text-lg font-semibold">Contact Messages</h3>
        <Button
          onClick={refreshContacts}
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
              <TableHead>Business Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No contact messages found
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{contact.business_type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">{contact.project_budget}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(contact.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingContact(contact)}
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
      <Dialog open={!!viewingContact} onOpenChange={() => setViewingContact(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>
          {viewingContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Name:</Label>
                  <p className="text-sm">{viewingContact.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Email:</Label>
                  <p className="text-sm">{viewingContact.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Phone:</Label>
                  <p className="text-sm">{viewingContact.phone}</p>
                </div>
                <div>
                  <Label className="font-medium">Business Type:</Label>
                  <Badge variant="secondary">{viewingContact.business_type}</Badge>
                </div>
                <div>
                  <Label className="font-medium">Project Budget:</Label>
                  <p className="text-sm font-semibold text-primary">{viewingContact.project_budget}</p>
                </div>
                <div>
                  <Label className="font-medium">Timeline:</Label>
                  <p className="text-sm">{viewingContact.project_timeline}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Project Details:</Label>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                  {viewingContact.project_detail}
                </p>
              </div>
              {viewingContact.reference_file && (
                <div>
                  <Label className="font-medium">Reference File:</Label>
                  <p className="text-sm text-blue-600 mt-1">
                    <a href={viewingContact.reference_file} target="_blank" rel="noopener noreferrer">
                      View Reference File
                    </a>
                  </p>
                </div>
              )}
              <div className="pt-2 border-t">
                <Label className="font-medium text-xs text-muted-foreground">
                  Submitted: {formatDate(viewingContact.created_at)}
                </Label>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
