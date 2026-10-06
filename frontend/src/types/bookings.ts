import type { Resource } from "./resource";

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  _id: string;
  user: string;
  resource: Resource;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
}

export interface OwnerBooking extends Omit<Booking, "user"> {
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface AdminBooking extends Omit<Booking, "user" | "resource"> {
  user: {
    _id: string;
    name: string;
    email: string;
  };

  resource: {
    name: string;
    type: string;
    workspace?: {
      name: string;
      address: string;
    };
  };
}
