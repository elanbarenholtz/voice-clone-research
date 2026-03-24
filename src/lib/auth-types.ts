import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      isAdmin: boolean;
    };
  }

  interface User {
    isAdmin?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
  }
}
