

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, writeBatch } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { Role, UserProfile } from "@/types";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

const ADMIN_EMAIL = "admin@escola.com";
const ADMIN_ROLE_ID = "admin_role";

async function provisionAdminRole() {
    if (!db) return;
    const roleRef = doc(db, 'roles', ADMIN_ROLE_ID);
    const roleSnap = await getDoc(roleRef);

    if (!roleSnap.exists()) {
        await setDoc(roleRef, {
            id: ADMIN_ROLE_ID,
            name: 'Administrador',
            permissions: ['users', 'general', 'infrastructure', 'technology', 'cultural', 'maintenance', 'professionals']
        });
    }
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    if (!db) {
        toast({ title: "Erro de Configuração", description: "O banco de dados não está disponível.", variant: "destructive" });
        setLoading(false);
        return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let userProfile: UserProfile | null = null;
      
      // Special check for the admin user to ensure their profile exists
      if (user.email === ADMIN_EMAIL && !userSnap.exists()) {
          await provisionAdminRole();
          const adminProfileData = {
              name: 'Admin',
              email: user.email,
              roleId: ADMIN_ROLE_ID
          };
          await setDoc(userRef, adminProfileData);
          userProfile = { id: user.uid, ...adminProfileData, role: { id: ADMIN_ROLE_ID, name: 'Administrador', permissions: ['users'] } };
      } else if (userSnap.exists()) {
          const userData = userSnap.data() as Omit<UserProfile, 'id' | 'role'>;
          if (userData.roleId) {
              const roleRef = doc(db, 'roles', userData.roleId);
              const roleSnap = await getDoc(roleRef);
              if (roleSnap.exists()) {
                  userProfile = { id: user.uid, ...userData, role: roleSnap.data() as Role };
              }
          }
      }

      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando...",
      });
      
      if (userProfile?.role?.name === 'Unidade Educacional') {
          router.push("/census");
      } else {
          router.push("/admin/dashboard");
      }
      
    } catch (error: any) {
        let errorMessage = "Ocorreu um erro desconhecido.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
             errorMessage = "Email ou senha inválidos.";
        } else if (error.code === 'auth/invalid-email') {
             errorMessage = "O formato do email é inválido.";
        }
        
      toast({
        title: "Erro no Login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@escola.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
            <Button variant="link" size="sm" asChild className="w-full">
              <Link href="/">Voltar para a Home</Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
