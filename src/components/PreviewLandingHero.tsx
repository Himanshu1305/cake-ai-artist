interface PreviewSaleData {
  saleLabel: string;
  emoji: string;
  endDate: Date | null;
  isDefault: boolean;
}

interface PreviewLandingHeroProps {
  sale: PreviewSaleData;
}

export const PreviewLandingHero = ({ sale }: PreviewLandingHeroProps) => {
  const isDefaultMode = sale.isDefault;

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="bg-gradient-to-br from-party-pink/20 via-party-purple/20 to-party-blue/20 rounded-lg p-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Hero Section Label</p>
        <div className="inline-flex items-center gap-2 text-lg font-bold text-foreground bg-gradient-to-r from-party-pink to-party-purple bg-clip-text text-transparent">
          <span className="inline-block animate-bounce text-2xl">{sale.emoji}</span>
          <span>
            {sale.saleLabel.replace('!', '')} {isDefaultMode ? 'LIMITED OFFER' : 'ENDS IN:'}
          </span>
          {!isDefaultMode && sale.endDate && (
            <span className="text-party-purple font-mono">
              {formatTimeRemaining(sale.endDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
