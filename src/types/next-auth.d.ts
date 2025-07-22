import NextAuth from 'next-auth'

type UserRole = 'HOD' | 'STAFF' | 'ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      departmentId: string
      departmentName: string
    }
  }

  interface User {
    role: UserRole
    departmentId: string
    departmentName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    departmentId: string
    departmentName: string
  }
}
