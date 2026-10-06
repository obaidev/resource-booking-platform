export type ResourceType = "desk" | "meeting_room" | "private_office";

export type ResourceStatus = "active" | "inactive";
export interface Resource {
  _id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  hourlyPrice: number;
  dailyPrice?: number;
  status: ResourceStatus;

  workspace: {
    _id: string;
    name: string;
    address: string;
    operatingHours: {
      open: string;
      close: string;
    };
  };

  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ResourcesResponse {
  message: string;
  resources: Resource[];
}
