export interface Workspace {
  _id: string;
  name: string;
  address: string;
  description?: string;
  operatingHours: {
    open: string;
    close: string;
  };
  owner: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}
