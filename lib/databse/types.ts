
// lib/databse/types.ts
export interface CreateUserParams {
    clerkId: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    photo: string;
    
  }
  
  export interface UpdateUserParams {
    firstName?: string;
    lastName?: string;
    username?: string;
    photo?: string;
  }