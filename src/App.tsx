import { useState } from 'react';
import { useDatabase } from '@/hooks/useDatabase';
import { db } from '@/lib/database';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { KitSelection } from '@/components/forms/KitSelection';
import { OrderList } from '@/components/OrderList';
import { format } from 'date-fns';


type Page = 'home' | 'new-order' | 'kit-selection' | 'orders';

// Define customer data type
interface CustomerData {
  schoolName: string;
  contactPerson: string;  
  phone: string;
  area: string;
  studentCount?: number;
  createdAt: Date;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const { isReady, error } = useDatabase();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-500 to-red-700">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Database Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="text-center text-white">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-white/40 mx-auto animate-ping"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Initializing Aristobox</h2>
          <p className="text-white/80">Setting up your educational kit catalog...</p>
        </div>
      </div>
    );
  }

  // Handle page navigation
  const handleNewOrder = () => {
    setCustomerData(null); // Reset customer data
    setCurrentPage('new-order');
  };

  // ✅ Correct: Add parameter name 'data'
  const handleCustomerSubmit = (formData: Omit<CustomerData, 'createdAt'>) => {

    const customerDataWithTimestamp: CustomerData = {
      ...formData,
      createdAt: new Date(),  // Auto-generate timestamp
    };
    
    setCustomerData(customerDataWithTimestamp);
    setCurrentPage('kit-selection');
  };


  const handleBackToHome = () => {
    setCustomerData(null);
    setCurrentPage('home');
  };

  const handleBackToCustomer = () => {
    setCurrentPage('new-order');
  };

  // Render different pages based on current state
  if (currentPage === 'new-order') {
    return (
      <CustomerForm 
        onBack={handleBackToHome}
        onNext={handleCustomerSubmit}
      />
    );
  }

  if (currentPage === 'kit-selection') {
    return (
      <KitSelection
        customerData={customerData!}
        onBack={handleBackToCustomer}
        onNext={(orderData) => {
          console.log('Order completed:', orderData);
          alert('Order saved successfully!');
          handleBackToHome();
        }}
      />
    );
  }

  if (currentPage === 'orders') {
    return (
      <OrderList onBack={handleBackToHome} />
    );
  }

  const handleExportFromDashboard = async () => {
    try {
      const orders = await db.orders.toArray();
      
      if (orders.length === 0) {
        alert('No orders to export');
        return;
      }
      
      // Prepare CSV data
      const csvHeaders = [
        'Order ID', 'School Name', 'Contact Person', 'Phone', 'Area',
        'Kit Name', 'Quantity', 'Price Per Kit', 'Total Amount', 
        'Order Date', 'Status'
      ];

      const csvData = orders.flatMap(order => 
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

      alert('Orders exported successfully!');
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Home page (rest of your existing JSX)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      {/* Educational Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl text-white/10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>📚</div>
        <div className="absolute top-32 right-20 text-3xl text-white/10 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🧮</div>
        <div className="absolute top-60 left-1/4 text-2xl text-white/10 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>🔬</div>
        <div className="absolute bottom-40 right-10 text-3xl text-white/10 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.2s' }}>🎨</div>
        <div className="absolute bottom-20 left-16 text-2xl text-white/10 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.8s' }}>📐</div>
        <div className="absolute top-1/3 right-1/4 text-2xl text-white/10 animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.2s' }}>🧪</div>
        
        {/* Mathematical formulas background */}
        <div className="absolute top-1/4 left-8 text-white/5 font-mono text-sm rotate-12">E = mc²</div>
        <div className="absolute bottom-1/3 right-12 text-white/5 font-mono text-sm -rotate-12">π = 3.14159</div>
        <div className="absolute top-1/2 left-1/3 text-white/5 font-mono text-xs rotate-6">a² + b² = c²</div>
      </div>

      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl relative">
              <span className="text-4xl">🎒</span>
              <div className="absolute -top-1 -right-1 bg-orange-400 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                K-12
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
              Aristobox
            </h1>
            {/* <p className="text-xl text-white/90 font-medium mb-2">Field Sales</p> */}
            <p className="text-white/70 text-lg">Educational Kit Order Collection</p>
            
            {/* Educational stats row */}
            <div className="flex justify-center items-center space-x-6 mt-6 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <span>📚</span>
                <span>6 Subject Kits</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Classes 1-12</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🏫</span>
                <span>All Board Compatible</span>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={handleNewOrder}
              className="group bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/20 text-white p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 text-white/10 text-xs">📝✏️</div>
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📝</div>
              <h3 className="text-xl font-semibold mb-2">New Order</h3>
              <p className="text-white/80 text-sm">Create a new school order</p>
            </button>
            
            <button
              onClick={() => setCurrentPage('orders')}
              className="group bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/20 text-white p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 text-white/10 text-xs">📊📋</div>
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📋</div>
              <h3 className="text-xl font-semibold mb-2">View Orders</h3>
              <p className="text-white/80 text-sm">Manage existing orders</p>
            </button>
            
            <button 
              onClick={handleExportFromDashboard}
              className="group bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/20 text-white p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 text-white/10 text-xs">📈💾</div>
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📤</div>
              <h3 className="text-xl font-semibold mb-2">Export Data</h3>
              <p className="text-white/80 text-sm">Download order reports</p>
            </button>
          </div>

          {/* Status Bar */}
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between text-white/70">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">System Online</span>
              </div>
              <div className="text-sm">
                Current: <span className="text-white font-medium capitalize">{currentPage.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Footer with Educational Touch */}
          <div className="text-center mt-8 text-white/50 text-sm">
            <p className="flex items-center justify-center space-x-4">
              <span>🔒 Offline-capable</span>
              <span>•</span>
              <span>🛡️ Secure</span>
              <span>•</span>
              <span>⚡ Fast</span>
            </p>
            <p className="mt-2 text-xs text-white/40">
              Supporting Education • Empowering Students • Building Future
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
