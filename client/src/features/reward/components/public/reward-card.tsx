'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Hadiah } from '../../types/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RewardExchangePreview from '@/features/reward-exchange/components/user/confirmation-exchange-button';
import { BadgePercent, Coins, Gift } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RewardCardProps {
  reward: Hadiah;
}

export function RewardCard({ reward }: RewardCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className="overflow-hidden h-[200px] p-0 flex flex-col gap-0 
        border border-glass-border bg-glass-bg bg-background/10 backdrop-blur-xl shadow-lg transition 
        hover:shadow-xl hover:brightness-103"
      style={{
        borderColor: 'var(--glass-border)',
      }}
    >
      <div
        className="flex-grow flex items-center justify-center gap-3 bg-secondary-1/10 dark:bg-secondary-1/20 relative"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,200,100,0.08), transparent 70%)',
        }}
      >
        <Gift className="w-8 h-8 text-foreground/70 -rotate-12" />
        <Gift className="w-12 h-12 text-foreground/70" />
        <Gift className="w-8 h-8 text-foreground/70 rotate-12" />
      </div>
      <CardContent
        className="p-4 flex flex-col justify-between gap-1 relative bg-glass-bg backdrop-blur-xl text-foreground"
        style={{
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom right, rgba(255, 200, 120, 0.05), rgba(255, 255, 255, 0.02) 50%, transparent 90%)',
          }}
        />
        <div className="space-y-1 z-10">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {reward.nama}
          </CardTitle>
          <Badge
            variant="outline"
            className="w-fit gap-1 text-xs font-medium 
              text-amber-700 dark:text-amber-400 
              border border-amber-300 dark:border-amber-400/40 
              bg-amber-100/50 dark:bg-amber-400/10 
              backdrop-blur-sm"
          >
            <BadgePercent className="w-4 h-4" />
            {parseInt(reward.harga_poin, 10).toLocaleString()} points
          </Badge>
        </div>

        <CardFooter className="pt-1 px-0 justify-center z-10">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="w-full text-sm font-semibold rounded-md px-3 py-1.5
                  bg-secondary-1/50 dark:bg-secondary-1/40
                  text-foreground hover:bg-secondary-1/40 dark:hover:bg-secondary-1/30 
                  border border-glass-border backdrop-blur-md shadow-sm transition"
                style={{
                  borderColor: 'var(--glass-border)',
                }}
              >
                Redeem
              </Button>
            </DialogTrigger>

            <DialogContent
              className="rounded-xl border border-glass-border bg-glass-bg backdrop-blur-xl shadow-xl px-6 py-6 space-y-2"
              style={{
                background: 'var(--glass-background)',
                borderColor: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                backdropFilter: 'var(--glass-blur)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  background:
                    'radial-gradient(ellipse at top left, rgba(255, 200, 100, 0.06), transparent 70%)',
                }}
              />

              <DialogHeader className="relative z-10 space-y-2">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {reward.nama}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {reward.deskripsi?.trim() || '-'}
                </DialogDescription>
              </DialogHeader>

              <div className="relative z-10 space-y-1 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Price:</span>{' '}
                  <Badge className="w-fit gap-1 text-xs font-medium text-amber-700 border-amber-300 bg-amber-100 px-2 py-1">
                    <Coins className="w-4 h-4" />
                    {parseInt(reward.harga_poin, 10).toLocaleString()} pts
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-foreground">Stock:</span>{' '}
                  <span className="font-semibold">{reward.stok}</span>
                </div>
              </div>

              <div className="relative z-10">
                <RewardExchangePreview
                  idHadiah={reward.id}
                  hargaPoin={Number(reward.harga_poin)}
                  onSuccessClose={() => setOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
