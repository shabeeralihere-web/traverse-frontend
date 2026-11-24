
export interface OperatorAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface OperatorApplication {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  businessName: string;
  description: string;
  contactPhone: string;
  website: string;
  businessAddress: OperatorAddress;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
}
