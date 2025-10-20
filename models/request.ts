export interface Request {
  requestId: number;
  userId: number;
  requestImage: string | null;
  requestDetails: string;
  requestStatus: string;
  longitude?: number;
  latitude?: number;
  dateCreated: string;
  dateUpdated: string;
  dateAssigned?: string;
  userName?: string;
  volunteerId?: number;
  phoneNumber: string;
  volunteerName?: string;
}