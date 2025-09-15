import Dexie, { Table } from 'dexie';

export interface Customer {
  id?: number;
  schoolName: string;
  contactPerson: string;
  phone: string;
  area: string;
  studentCount?: number;
  createdAt: Date;
}

export interface Kit {
  id: string;
  kitName: string;
  description: string;
  targetClasses: number[];
  subjects: string[];
  contents: string[];
  price: number;
  category: 'stem' | 'commerce' | 'arts' | 'primary';
  ageGroup: 'primary' | 'secondary' | 'senior';
  isActive: boolean;
}

export interface OrderItem {
  kitId: string;
  kitName: string;
  quantity: number;
  pricePerKit: number;
  totalAmount: number;
  notes?: string;
}

export interface Order {
  id?: number;
  orderId: string;
  customerInfo: Customer;
  selectedKits: OrderItem[];
  totalOrderValue: number;
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'delivered' | 'exported';
  signature?: string;
  notes?: string;
}

export class AristoboxDB extends Dexie {
  customers!: Table<Customer>;
  kits!: Table<Kit>;
  orders!: Table<Order>;

  constructor() {
    super('AristoboxDB');
    
    this.version(1).stores({
      customers: '++id, schoolName, phone, area, createdAt',
      kits: 'id, kitName, category, ageGroup, isActive, price',
      orders: '++id, orderId, orderDate, status, totalOrderValue'
    });
  }
}

export const db = new AristoboxDB();
