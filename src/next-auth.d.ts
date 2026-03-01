import { UserRole } from "@/types";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            points?: number;
        }
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        points?: number;
    }
}
