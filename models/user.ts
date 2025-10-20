export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleId?: number;
  dateCreated?: Date;
}
