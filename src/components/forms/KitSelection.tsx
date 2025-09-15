import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

interface CustomerData {
  schoolName: string;
  contactPerson: string;
  phone: string;
  area: string;
  studentCount?: number;
  createdAt: Date;
}

interface SelectedKit {
  kitId: string;
  kitName: string;
  price: number;
  quantity: number;
}

interface KitSelectionProps {
  customerData: CustomerData;
  onBack: () => void;
  onNext: (orderData: { customer: CustomerData; selectedKits: SelectedKit[] }) => void;
}

export function KitSelection({ customerData, onBack, onNext }: KitSelectionProps) {
  const [selectedKits, setSelectedKits] = useState<SelectedKit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load kits from database
  const kits = useLiveQuery(() => db.kits.filter(kit => kit.isActive === true).toArray());

  const handleKitToggle = (kitId: string, kitName: string, price: number) => {
    setSelectedKits(prev => {
      const existing = prev.find(k => k.kitId === kitId);
      if (existing) {
        return prev.filter(k => k.kitId !== kitId);
      } else {
        return [...prev, { kitId, kitName, price, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (kitId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedKits(prev =>
      prev.map(kit =>
        kit.kitId === kitId ? { ...kit, quantity } : kit
      )
    );
  };

  const totalAmount = selectedKits.reduce((sum, kit) => sum + (kit.price * kit.quantity), 0);

  const handleSubmit = async () => {
    if (selectedKits.length === 0) {
      alert('Please select at least one kit');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create order ID
      const orderId = `ORD_${Date.now()}_${uuidv4().slice(0, 6)}`;
      
      // Prepare order data
      const orderData = {
        orderId,
        customerInfo: customerData,
        selectedKits: selectedKits.map(kit => ({
          kitId: kit.kitId,
          kitName: kit.kitName,
          quantity: kit.quantity,
          pricePerKit: kit.price,
          totalAmount: kit.price * kit.quantity,
        })),
        totalOrderValue: totalAmount,
        orderDate: new Date(),
        status: 'pending' as const,
      };

      // Save to database
      await db.orders.add(orderData);
      
      onNext({
        customer: customerData,
        selectedKits
      });
      
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  if (!kits) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading kits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl text-white/10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>📚</div>
        <div className="absolute top-32 right-20 text-3xl text-white/10 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🧮</div>
        <div className="absolute bottom-40 right-10 text-3xl text-white/10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.2s' }}>🎨</div>
      </div>

      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors"
            >
              <span className="mr-2">←</span> Back to Customer Details
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">📦 Select Educational Kits</h1>
            <p className="text-white/80">Choose kits for {customerData.schoolName}</p>
          </div>

          {/* Customer Info Summary */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{customerData.schoolName}</h3>
                  <p className="text-white/70 text-sm">{customerData.contactPerson} • {customerData.area}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/70 text-sm">Students: {customerData.studentCount || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {kits.map((kit) => {
              const isSelected = selectedKits.some(k => k.kitId === kit.id);
              const selectedKit = selectedKits.find(k => k.kitId === kit.id);

              return (
                <Card key={kit.id} className={`bg-white/10 backdrop-blur-sm border-white/20 text-white transition-all ${isSelected ? 'ring-2 ring-white/40' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleKitToggle(kit.id, kit.kitName, kit.price)}
                        className="border-white/30"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{kit.kitName}</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-white/20 text-white">
                          {kit.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm mb-3">{kit.description}</p>
                    <p className="text-white/70 text-xs mb-3">
                      Classes: {kit.targetClasses.join(', ')}
                    </p>
                    <div className="text-white/60 text-xs mb-4">
                      <p className="font-medium mb-1">Includes:</p>
                      <ul className="list-disc list-inside">
                        {kit.contents.slice(0, 3).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                        {kit.contents.length > 3 && (
                          <li>+ {kit.contents.length - 3} more items</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">₹{kit.price}/kit</span>
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <span className="text-white/70 text-sm">Qty:</span>
                          <Input
                            type="number"
                            min="1"
                            value={selectedKit?.quantity || 1}
                            onChange={(e) => handleQuantityChange(kit.id, parseInt(e.target.value) || 1)}
                            className="w-16 h-8 bg-white/10 border-white/20 text-white text-center"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          {selectedKits.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-6">
              <CardHeader>
                <CardTitle className="text-white">📋 Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedKits.map((kit) => (
                    <div key={kit.kitId} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{kit.kitName}</span>
                        <span className="text-white/70 ml-2">x{kit.quantity}</span>
                      </div>
                      <span className="font-bold">₹{(kit.price * kit.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount</span>
                      <span>₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              ← Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedKits.length === 0 || isSubmitting}
              className="flex-1 bg-white text-blue-600 hover:bg-white/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Order...' : `Save Order (₹${totalAmount.toLocaleString()})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
