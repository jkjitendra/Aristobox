import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
// import { 
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Portal } from '@radix-ui/react-portal';


interface StatusToggleProps {
  currentStatus: OrderStatus;
  availableStatuses: OrderStatus[];
  onStatusChange: (newStatus: OrderStatus) => void;
}



const StatusToggle = ({ currentStatus, availableStatuses, onStatusChange }: StatusToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getStatusInfo = (status: OrderStatus) => {
    const statusConfig = {
      pending: { icon: '⏳', color: 'bg-orange-500', label: 'Pending' },
      confirmed: { icon: '✅', color: 'bg-blue-500', label: 'Confirmed' },
      delivered: { icon: '🚚', color: 'bg-green-500', label: 'Delivered' },
      exported: { icon: '📤', color: 'bg-gray-500', label: 'Exported' }
    };
    return statusConfig[status];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentInfo = getStatusInfo(currentStatus);

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      {/* Status Display Badge */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
        <div className={`w-2 h-2 rounded-full ${currentInfo.color}`}></div>
        <span className="text-sm font-medium text-gray-700">{currentInfo.label}</span>
      </div>
      
      {/* Clear Action Button */}
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs flex items-center gap-1"
        >
          <span>Update Status</span>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[160px] z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="p-1">
              {availableStatuses.map(status => {
                const statusInfo = getStatusInfo(status);
                return (
                  <button
                    key={status}
                    onClick={() => {
                      onStatusChange(status);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                    <span className="text-sm font-medium text-gray-900">{statusInfo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderListProps {
  onBack: () => void;
}

type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'exported';

interface FilterState {
  status: string;
  area: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}


export function OrderList({ onBack }: OrderListProps) {
  const [exportingOrders, setExportingOrders] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    area: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  const allOrders = useLiveQuery(() => 
    db.orders.orderBy('orderDate').reverse().toArray()
  );

  const filteredOrders = allOrders?.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    
    if (filters.area && !order.customerInfo.area.toLowerCase().includes(filters.area.toLowerCase())) return false;
    
    if (filters.dateFrom) {
      const orderDate = new Date(order.orderDate);
      const fromDate = new Date(filters.dateFrom);
      if (orderDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const orderDate = new Date(order.orderDate);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (orderDate > toDate) return false;
    }
    
    if (filters.minAmount && order.totalOrderValue < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && order.totalOrderValue > parseFloat(filters.maxAmount)) return false;
    
    return true;
  }) || [];

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await db.orders.update(orderId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleExportOrders = async () => {
    if (!filteredOrders || filteredOrders.length === 0) return;
    
    setExportingOrders(true);
    
    // Prepare CSV data
    const csvHeaders = [
      'Order ID', 'School Name', 'Contact Person', 'Phone', 'Area',
      'Kit Name', 'Quantity', 'Price Per Kit', 'Total Amount',
      'Order Date', 'Status'
    ];

    const csvData = filteredOrders.flatMap(order => 
      order.selectedKits.map(kit => [
        order.orderId,
        order.customerInfo.schoolName,
        order.customerInfo.contactPerson,
        order.customerInfo.phone,
        order.customerInfo.area,
        kit.kitName,
        kit.quantity,
        kit.pricePerKit,
        kit.totalAmount,
        format(new Date(order.orderDate), 'yyyy-MM-dd HH:mm'),
        order.status
      ])
    );

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aristobox-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    // Mark orders as exported
    // const orderIds = orders.map(o => o.id!);
    // await db.orders.where('id').anyOf(orderIds).modify({ status: 'exported' });

    setExportingOrders(false);
  };

  // const getStatusColor = (status: OrderStatus) => {
  //   switch (status) {
  //     case 'pending': return 'bg-orange-500';
  //     case 'confirmed': return 'bg-blue-500';
  //     case 'delivered': return 'bg-green-500';
  //     case 'exported': return 'bg-gray-500';
  //     default: return 'bg-gray-500';
  //   }
  // };

  const getStatusOptions = (currentStatus: OrderStatus) => {
    const statusFlow: { [key in OrderStatus]: OrderStatus[] } = {
      pending: ['confirmed', 'delivered'],
      confirmed: ['delivered', 'pending'],
      delivered: ['confirmed'],
      exported: ['pending', 'confirmed', 'delivered']
    };
    return statusFlow[currentStatus] || [];
  };


  if (!allOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl text-white/10 animate-bounce">📊</div>
        <div className="absolute top-32 right-20 text-3xl text-white/10 animate-bounce">📋</div>
        <div className="absolute bottom-40 right-10 text-3xl text-white/10 animate-bounce">💾</div>
      </div>

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors"
            >
              <span className="mr-2">←</span> Back to Home
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">📋 Order Management</h1>
            <p className="text-white/80">View and manage collected orders</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{filteredOrders.length}</div>
                <div className="text-white/70 text-sm">Total Orders</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {filteredOrders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-white/70 text-sm">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {filteredOrders.filter(o => o.status === 'confirmed').length}
                </div>
                <div className="text-white/70 text-sm">Confirmed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  ₹{filteredOrders.reduce((sum, o) => sum + o.totalOrderValue, 0).toLocaleString()}
                </div>
                <div className="text-white/70 text-sm">Total Value</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white mb-6">
            <CardHeader>
              <CardTitle className="text-white">🔍 Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <Portal>
                      <SelectContent
                        sideOffset={6}
                        className="opacity-0 data-[state=open]:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm border-white/20 text-gray-900"
                      >
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="exported">Exported</SelectItem>
                      </SelectContent>
                    </Portal>
                  </Select>
                </div>
                
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Area</label>
                  <Input
                    placeholder="Search by area"
                    value={filters.area}
                    onChange={(e) => setFilters({...filters, area: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div>
                  <label className="text-white/80 text-sm mb-1 block">From Date</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-white/80 text-sm mb-1 block">To Date</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Min Amount</label>
                  <Input
                    type="number"
                    placeholder="₹ 0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div>
                  <label className="text-white/80 text-sm mb-1 block">Max Amount</label>
                  <Input
                    type="number"
                    placeholder="₹ 10,000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setFilters({status: 'all', area: '', dateFrom: '', dateTo: '', minAmount: '', maxAmount: ''})}
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  Clear Filters
                </Button>
                <span className="text-white/70 text-sm">
                  Showing {filteredOrders.length} of {allOrders.length} orders
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          {filteredOrders.length > 0 && (
            <div className="mb-6">
              <Button
                onClick={handleExportOrders}
                disabled={exportingOrders}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {exportingOrders ? 'Exporting...' : `📤 Export ${filteredOrders.length} Orders to CSV`}
              </Button>
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">
                  {allOrders.length === 0 ? 'No Orders Yet' : 'No Orders Match Filters'}
                </h3>
                <p className="text-white/70">
                  {allOrders.length === 0 ? 'Start by creating your first order!' : 'Try adjusting your filters to see more orders.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{order.customerInfo.schoolName}</CardTitle>
                        <p className="text-white/70 text-sm">{order.orderId}</p>
                      </div>
                      {/* NEW Status Toggle Component */}
                      <div className="flex items-center space-x-3">
                        <StatusToggle
                          currentStatus={order.status}
                          availableStatuses={getStatusOptions(order.status)}
                          onStatusChange={(newStatus) => handleStatusChange(order.id!, newStatus)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/70 text-sm">Contact: {order.customerInfo.contactPerson}</p>
                        <p className="text-white/70 text-sm">Phone: {order.customerInfo.phone}</p>
                        <p className="text-white/70 text-sm">Area: {order.customerInfo.area}</p>
                        <p className="text-white/70 text-sm">
                          Date: {format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-2">Kits Ordered:</p>
                        <ul className="text-white text-sm space-y-1">
                          {order.selectedKits.map((kit, index) => (
                            <li key={index}>
                              {kit.kitName} x{kit.quantity} = ₹{kit.totalAmount.toLocaleString()}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 pt-2 border-t border-white/20">
                          <p className="font-bold text-lg">
                            Total: ₹{order.totalOrderValue.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
