export interface UserProfile {
  meter: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  region?: string;
  regionName?: string;
  district?: string;
  districtName?: string;
  street?: string;
}

export interface Transaction {
  id: string;
  meterNumber: string;
  amount: number;
  unitsAdded: number;
  paymentMethod: string;
  type: string;
  status: string;
  reference: string;
  fee: number;
  total: number;
  timestamp: string;
}

export interface ConsumptionLog {
  id: string;
  meterNumber: string;
  unitsUsed: number;
  cost: number;
  rate: number;
  powerKw: number;
  timestamp: string;
}

export interface OutageReport {
  id: string;
  lat: number;
  lng: number;
  description: string;
  region?: string;
  meterNumber?: string;
  reporterPhone?: string;
  timestamp: string;
}

export interface HealthStatus {
  ok: boolean;
  sms?: boolean;
  smsProvider?: string;
  smsReady?: boolean;
  chat?: boolean;
  database?: boolean;
  db?: string;
  mode?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "success" | "danger";
  timestamp: string;
  read: boolean;
}
