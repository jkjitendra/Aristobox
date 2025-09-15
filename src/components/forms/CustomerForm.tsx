import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const customerSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name required'),
  phone: z.string().min(10, 'Valid phone number required').max(15),
  area: z.string().min(2, 'Area/Location required'),
  studentCount: z.number().min(1).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onBack: () => void;
  onNext: (data: CustomerFormData) => void;
}

export function CustomerForm({ onBack, onNext }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema)
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onNext(data);
    setIsSubmitting(false);
  };

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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors"
            >
              <span className="mr-2">←</span> Back to Home
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">📋 New Order</h1>
            <p className="text-white/80">Enter school details to get started</p>
          </div>

          {/* Form Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <span className="mr-2">🏫</span>
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="schoolName" className="text-white/90">School Name *</Label>
                  <Input
                    id="schoolName"
                    {...register('schoolName')}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 mt-1"
                    placeholder="e.g., Delhi Public School"
                  />
                  {errors.schoolName && (
                    <p className="text-red-300 text-sm mt-1">{errors.schoolName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPerson" className="text-white/90">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    {...register('contactPerson')}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 mt-1"
                    placeholder="e.g., Principal Sharma"
                  />
                  {errors.contactPerson && (
                    <p className="text-red-300 text-sm mt-1">{errors.contactPerson.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white/90">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 mt-1"
                    placeholder="e.g., +91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="text-red-300 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="area" className="text-white/90">Area/Location *</Label>
                  <Input
                    id="area"
                    {...register('area')}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 mt-1"
                    placeholder="e.g., Sector 45, Gurgaon"
                  />
                  {errors.area && (
                    <p className="text-red-300 text-sm mt-1">{errors.area.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="studentCount" className="text-white/90">Student Count (Optional)</Label>
                  <Input
                    id="studentCount"
                    type="number"
                    {...register('studentCount', { valueAsNumber: true })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 mt-1"
                    placeholder="e.g., 500"
                  />
                  {errors.studentCount && (
                    <p className="text-red-300 text-sm mt-1">{errors.studentCount.message}</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-white text-blue-600 hover:bg-white/90"
                  >
                    {isSubmitting ? 'Processing...' : 'Continue to Kits →'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
