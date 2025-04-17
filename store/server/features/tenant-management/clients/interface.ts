export interface Client {
  id?: string;
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  industry: string;
  subscriptionDate: string;
  subscriptionEndDate: string;
  subscriptionType: string;
  subscriptionStatus: string;
  // остальные поля из API
}

export interface ClientResponse {
  items: Client[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ClientRequestParams {
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export enum SubscriptionType {
  FREE = 'Free',
  BASIC = 'Basic',
  STANDARD = 'Standard',
}

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface CreateClientDto {
  companyName: string;
  domainName: string;
  companyEmail: string;
  phoneNumber: string;
  address: string;
  businessSize: string;
  industry: string;
  country: string;
  region: string;
  timezone: string;
  subscriptionDate: string; // ISO string
  subscriptionEndDate: number;
  subscriptionType: SubscriptionType;
  subscriptionStatus: SubscriptionStatus;
  billingEmail: string;
  billingPhoneNumber: string;
  notes: string;
  contactPersonEmail: string;
  contactPersonName: string;
  contactPersonPhoneNumber: string;
  logo: string;
  preferredIndustry: string;
}
