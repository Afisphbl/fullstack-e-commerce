import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchOrderById, Order } from '@/lib/api';
import { ChevronLeft, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const trackingSteps = [
  { key: 'ordered', label: 'Ordered', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'in-transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const TrackOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => { if (id) fetchOrderById(id).then(o => setOrder(o || null)); }, [id]);

  if (!order) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading...</div>;

  const completedStatuses = order.timeline.map(t => t.status);
  const currentStepIndex = trackingSteps.findIndex(s => s.key === completedStatuses[completedStatuses.length - 1]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <h1 className="text-3xl font-display font-bold text-foreground mb-2">Track Order</h1>
      <p className="text-muted-foreground mb-8">{order.id} {order.trackingNumber && `• ${order.trackingNumber}`}</p>

      <div className="bg-card rounded-lg border border-border p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          {trackingSteps.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1 relative">
                {i > 0 && (
                  <div className={`absolute top-5 right-1/2 w-full h-0.5 -z-10 ${i <= currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs text-center ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Clock className="h-4 w-4" /> Estimated Delivery: <span className="text-foreground font-medium">{order.estimatedDelivery}</span>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-display font-semibold text-foreground mb-4">Tracking History</h2>
        <div className="space-y-4">
          {[...order.timeline].reverse().map((t, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary animate-glow' : 'bg-muted-foreground/30'}`} />
                {i < order.timeline.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium text-foreground">{t.description}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
