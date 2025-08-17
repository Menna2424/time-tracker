export interface Organization {
  id: string;
  name: string;
  industry?: string;
  companySize?: number;   // integer
  teamSize?: number;      // integer
  businessEmail?: string;
  phone?: string;
  country?: string;
  ownerUserId: string;    // admin who signed up
  createdAt: number;
}
