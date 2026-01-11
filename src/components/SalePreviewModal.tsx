import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PreviewUrgencyBanner } from './PreviewUrgencyBanner';
import { PreviewPricingHero } from './PreviewPricingHero';
import { PreviewLandingHero } from './PreviewLandingHero';
import { Globe, Calendar, Info, Monitor, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface HolidaySaleData {
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
}

interface SalePreviewModalProps {
  sale: HolidaySaleData | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (saleId: string, currentStatus: boolean) => void;
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

export const SalePreviewModal = ({ sale, isOpen, onClose, onActivate }: SalePreviewModalProps) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  if (!sale) return null;

  const endDate = new Date(sale.end_date);
  const isDefaultSale = endDate.getFullYear() >= 2099;
  
  const previewSaleData = {
    saleLabel: sale.sale_label,
    holidayName: sale.holiday_name,
    bannerText: sale.banner_text,
    emoji: sale.holiday_emoji,
    endDate: isDefaultSale ? null : endDate,
    isDefault: isDefaultSale,
  };

  const getStatus = () => {
    const now = new Date();
    const startDate = new Date(sale.start_date);

    if (now < startDate) {
      return { label: 'Upcoming', variant: 'secondary' as const };
    } else if (now > endDate && !isDefaultSale) {
      return { label: 'Expired', variant: 'destructive' as const };
    } else if (sale.is_active) {
      return { label: 'Active', variant: 'default' as const };
    } else {
      return { label: 'Ready', variant: 'outline' as const };
    }
  };

  const status = getStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>{sale.holiday_emoji}</span>
            Preview: {sale.holiday_name}
          </DialogTitle>
          <DialogDescription>
            See how this sale will appear across your site
          </DialogDescription>
        </DialogHeader>

        {/* Sale Info Header */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {sale.country_code ? (
                <>
                  {COUNTRY_FLAGS[sale.country_code]} {COUNTRY_NAMES[sale.country_code]}
                </>
              ) : (
                <>🌍 Global (US)</>
              )}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {isDefaultSale ? (
                'No expiration (permanent fallback)'
              ) : (
                <>
                  {format(new Date(sale.start_date), 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                </>
              )}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <Badge variant={isDefaultSale ? 'secondary' : 'default'}>
            {isDefaultSale ? 'Default Mode (Fallback)' : 'Campaign Mode'}
          </Badge>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Device Toggle */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={deviceView === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('desktop')}
          >
            <Monitor className="w-4 h-4 mr-1" />
            Desktop
          </Button>
          <Button
            variant={deviceView === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDeviceView('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Mobile
          </Button>
        </div>

        {/* Preview Tabs */}
        <Tabs defaultValue="banner" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="banner">Urgency Banner</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Hero</TabsTrigger>
            <TabsTrigger value="landing">Landing Label</TabsTrigger>
          </TabsList>

          <TabsContent value="banner" className="mt-4">
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="p-2 bg-muted border-b flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground ml-2">cakeaiartist.com</span>
              </div>
              <div className={deviceView === 'mobile' ? 'max-w-sm mx-auto' : ''}>
                <PreviewUrgencyBanner sale={previewSaleData} />
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                {isDefaultSale 
                  ? 'Default mode shows "Limited spots remaining" instead of a countdown timer. This appears when no campaign is active for a country.'
                  : 'Campaign mode shows a countdown timer until the sale ends. The banner uses the party gradient.'
                }
              </p>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="p-2 bg-muted border-b flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground ml-2">cakeaiartist.com/pricing</span>
              </div>
              <div className={`p-4 ${deviceView === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <PreviewPricingHero sale={previewSaleData} />
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                This is the hero section at the top of the pricing page. 
                {isDefaultSale 
                  ? ' Shows "EXCLUSIVE LIFETIME DEAL" with spots remaining counter.'
                  : ` Shows "${sale.holiday_name}" with countdown timer.`
                }
              </p>
            </div>
          </TabsContent>

          <TabsContent value="landing" className="mt-4">
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="p-2 bg-muted border-b flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground ml-2">cakeaiartist.com/{sale.country_code?.toLowerCase() || ''}</span>
              </div>
              <div className={`p-4 ${deviceView === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <PreviewLandingHero sale={previewSaleData} />
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                This label appears in the hero section of country landing pages (e.g., /india, /australia).
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant={sale.is_active ? 'destructive' : 'default'}
            onClick={() => {
              onActivate(sale.id, sale.is_active);
              onClose();
            }}
          >
            {sale.is_active ? 'Deactivate Sale' : 'Activate Sale'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
