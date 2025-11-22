import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useFoundingMembers } from '@/hooks/useFoundingMembers';
import { FoundingMemberBadge } from '@/components/FoundingMemberBadge';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SpotsRemainingCounter } from '@/components/SpotsRemainingCounter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';

export default function WallOfFounders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'tier_1_49' | 'tier_2_99'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { members, loading, loadMore, hasMore } = useFoundingMembers(filter);

  useEffect(() => {
    // Confetti on page load
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF1493', '#9370DB', '#FFD700'],
    });
  }, []);

  const filteredMembers = members.filter(member =>
    member.member_number.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <nav className="border-b border-border bg-surface-elevated/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-party bg-clip-text text-transparent">
            👑 THE FOUNDING 200 👑
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Meet the smart people who locked in lifetime access.
            <br />
            These legends will be remembered forever.
          </p>
        </motion.div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'tier_1_49' ? 'default' : 'outline'}
              onClick={() => setFilter('tier_1_49')}
              className="gap-1"
            >
              <span>👑</span> Tier 1
            </Button>
            <Button
              variant={filter === 'tier_2_99' ? 'default' : 'outline'}
              onClick={() => setFilter('tier_2_99')}
              className="gap-1"
            >
              <span>⭐</span> Tier 2
            </Button>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by member number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Members Grid */}
        {loading && members.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading founding members...</div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No members found yet. Be the first!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface-elevated border-2 border-border rounded-lg p-6 hover:shadow-party transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <FoundingMemberBadge
                      memberNumber={member.member_number}
                      tier={member.tier as 'tier_1_49' | 'tier_2_99'}
                      size="large"
                    />
                    {member.special_badge && (
                      <p className="text-sm text-party-purple font-semibold">
                        {member.special_badge}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button onClick={loadMore} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center bg-gradient-party rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Want to join this exclusive group?</h2>
          <div className="flex flex-col items-center gap-4 mb-6">
            <SpotsRemainingCounter className="text-lg" />
            <CountdownTimer />
          </div>
          <Button
            onClick={() => navigate('/pricing')}
            size="lg"
            className="bg-white text-party-purple hover:bg-white/90 font-bold text-lg px-8 py-6"
          >
            Become a Founding Member →
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
