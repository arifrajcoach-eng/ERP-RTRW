export interface EmergencyLog {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'responded' | 'resolved';
  createdAt?: string;
  timestamp: string;
  tenantId: string;
  resolvedAt?: string;
  userLocation?: string;
  userAddress?: string;
  locationNotes?: string;
}

export interface VisitorLog {
  id: string;
  plateNumber: string;
  visitorName: string;
  purpose: string;
  timestamp: string;
  tenantId: string;
}
