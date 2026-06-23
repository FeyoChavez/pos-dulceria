import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' }, // Usamos JWT para máxima velocidad en la lectura de la sesión
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Buscar al usuario en la bd
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // NOTA: En producción aquí validdaremos la contraseña encriptada con bcrypt.
        if (user && user.isActive && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    // Inyectamos el role y tenantId en el token JWT
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    // Hacemos que el role y tenantId estén disponibles en la sesión del frontend/backend
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login', // Ruta de nuestra pantalla de Login personalizada
  },
});