import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Globe, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { SalePreviewModal } from './SalePreviewModal';

interface HolidaySale {
  id: string;
  country_code: string | null;
  holiday_name: string;
  holiday_emoji: string;
  sale_label: string;
  banner_text: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  'IN': '🇮🇳',
  'AU': '🇦🇺',
  'UK': '🇬🇧',
  'CA': '🇨🇦',
  'US': '🇺🇸',
};

const COUNTRY_NAMES: Record<string, string> = {
  'IN': 'India',
  'AU': 'Australia',
  'UK': 'United Kingdom',
  'CA': 'Canada',
  'US': 'United States',
};

export const HolidaySalesManager = () => {
  const [sales, setSales] = useState<HolidaySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const [previewSale, setPreviewSale] = useState<HolidaySale | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      // Admin can see all sales regardless of RLS (using their admin role)
      const { data, error } = await supabase
        .from('holiday_sales')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error loading sales:', error);
        toast.error('Failed to load holiday sales');
        return;
      }

      setSales(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load holiday sales');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (saleId: string, currentStatus: boolean) => {
    setUpdating(prev => new Set(prev).add(saleId));
    
    try {
      const { error } = await supabase
        .from('holiday_sales')
        .update({ is_active: !currentStatus })
        .eq('id', saleId);

      if (error) {
        console.error('Error updating sale:', error);
        toast.error('Failed to update sale status');
        return;
      }

      toast.success(`Sale ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadSales();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update sale status');
    } finally {
      setUpdating(prev => {
        const next = new Set(prev);
        next.delete(saleId);
        return next;
      });
    }
  };

  const getStatus = (sale: HolidaySale) => {
    const now = new Date();
    const startDate = new Date(sale.start_date);
    const endDate = new Date(sale.end_date);

    if (now < startDate) {
      return { label: 'Upcoming', variant: 'secondary' as const };
    } else if (now > endDate) {
      return { label: 'Expired', variant: 'destructive' as const };
    } else if (sale.is_active) {
      return { label: 'Active', variant: 'default' as const };
    } else {
      return { label: 'Ready', variant: 'outline' as const };
    }
  };

  const filteredSales = sales.filter(sale => {
    if (countryFilter === 'all') return true;
    if (countryFilter === 'global') return sale.country_code === null;
    return sale.country_code === countryFilter;
  });

  const countries = Array.from(new Set(sales.map(s => s.country_code).filter(Boolean))) as string[];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Holiday Sales Manager
            </CardTitle>
            <CardDescription>
              Manage country-specific holiday sales and promotions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadSales} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="global">🌍 Global (US)</SelectItem>
                {countries.map(code => (
                  <SelectItem key={code} value={code}>
                    {COUNTRY_FLAGS[code] || '🏳️'} {COUNTRY_NAMES[code] || code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Sales Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Active</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Holiday</TableHead>
                <TableHead>Banner Text</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No holiday sales found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map(sale => {
                  const status = getStatus(sale);
                  const isUpdating = updating.has(sale.id);
                  
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <Switch
                          checked={sale.is_active}
                          onCheckedChange={() => toggleActive(sale.id, sale.is_active)}
                          disabled={isUpdating}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {sale.country_code ? COUNTRY_FLAGS[sale.country_code] : '🌍'}
                          </span>
                          <span className="text-sm">
                            {sale.country_code ? COUNTRY_NAMES[sale.country_code] : 'Global'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{sale.holiday_emoji}</span>
                          <span className="font-medium">{sale.holiday_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                          {sale.banner_text}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(sale.start_date), 'MMM dd')}</div>
                          <div className="text-muted-foreground">
                            to {format(new Date(sale.end_date), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setPreviewSale(sale)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="default">Active</Badge>
            <span>Currently showing to users</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Ready</Badge>
            <span>Within date range but inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Upcoming</Badge>
            <span>Not yet started</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Expired</Badge>
            <span>Past end date</span>
          </div>
        </div>

        {/* Preview Modal */}
        <SalePreviewModal
          sale={previewSale}
          isOpen={!!previewSale}
          onClose={() => setPreviewSale(null)}
          onActivate={toggleActive}
        />
      </CardContent>
    </Card>
  );
};
