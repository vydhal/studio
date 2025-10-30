

"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Role, FormSectionPermission, School } from "@/types";
import { PlusCircle, MoreHorizontal, ChevronsUpDown, Check } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';


const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do perfil é obrigatório."),
  permissions: z.array(z.string()).min(1, "Selecione ao menos uma permissão."),
});

const userSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Nome do usuário é obrigatório."),
    email: z.string().email("Email inválido."),
    password: z.string().optional(),
    roleId: z.string().min(1, "Selecione um perfil."),
    schoolId: z.string().optional(),
}).refine(data => {
    // If it's a new user (no ID), password is required
    if (!data.id) {
        return !!data.password && data.password.length >= 6;
    }
    // If it's an existing user, password is not required for validation
    return true;
}, {
    message: "A senha deve ter no mínimo 6 caracteres para novos usuários.",
    path: ["password"],
});


const formSections: { id: FormSectionPermission; label: string }[] = [
    { id: 'general', label: 'Dados Gerais' },
    { id: 'infrastructure', label: 'Infraestrutura' },
    { id: 'professionals', label: 'Profissionais' },
    { id: 'technology', label: 'Tecnologia' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'maintenance', label: 'Manutenção' },
    { id: 'users', label: 'Gerenciar Usuários' },
];

export function UserManagementClient() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { userProfile, loading: authLoading } = useAuth();
  const hasUsersPermission = userProfile?.role?.permissions.includes('users');


  useEffect(() => {
    if (authLoading || !hasUsersPermission || !db) {
        return;
    }
    
    const usersUnsub = onSnapshot(collection(db, 'users'), snapshot => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
    }, (error) => console.error("Error listening to users:", error));

    const rolesUnsub = onSnapshot(collection(db, 'roles'), snapshot => {
        setRoles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role)));
    }, (error) => console.error("Error listening to roles:", error));
    
    const schoolsUnsub = onSnapshot(collection(db, 'schools'), snapshot => {
        setSchools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));
    }, (error) => console.error("Error listening to schools:", error));

    return () => {
        usersUnsub();
        rolesUnsub();
        schoolsUnsub();
    };
  }, [authLoading, hasUsersPermission]);

  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissions: [] },
  });

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", roleId: "", schoolId: "" },
  });

  const handleOpenUserModal = (user: UserProfile | null) => {
    setEditingUser(user);
    if (user) {
        userForm.reset({
            id: user.id,
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            schoolId: user.schoolId || "",
            password: "",
        });
    } else {
        userForm.reset({
            id: undefined,
            name: "",
            email: "",
            roleId: "",
            schoolId: "",
            password: "",
        });
    }
    setUserModalOpen(true);
  };
  
  const handleEditUser = (user: UserProfile) => {
    handleOpenUserModal(user);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!db) return;
    // This only deletes the Firestore record, which effectively revokes access.
    // For full deletion, a Cloud Function is required to delete from Firebase Auth.
    await deleteDoc(doc(db, "users", userId));
    toast({ title: "Usuário removido com sucesso." });
  }

  const handleResetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Email de redefinição enviado",
            description: `Um link para redefinir a senha foi enviado para ${email}.`,
        });
    } catch (error) {
        console.error("Password reset error:", error);
        toast({
            title: "Erro",
            description: "Não foi possível enviar o email de redefinição de senha.",
            variant: "destructive"
        });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!db) return;
    // TODO: Check if role is in use before deleting
    await deleteDoc(doc(db, "roles", roleId));
    toast({ title: "Perfil excluído com sucesso." });
  }

  const onUserSubmit = async (values: z.infer<typeof userSchema>) => {
    // This function will now be called by handleSave after validation
    if (!db) {
      toast({ title: "Erro de Conexão", description: "Ocorreu um problema com o banco de dados.", variant: "destructive" });
      return;
    }
    toast({ title: `Salvando usuário...` });

    try {
      if (editingUser && editingUser.id) {
        // EDIT operation
        const userRef = doc(db, 'users', editingUser.id);
        await updateDoc(userRef, {
          name: values.name,
          roleId: values.roleId,
          schoolId: values.schoolId || null,
        });
        toast({ title: "Usuário atualizado com sucesso!" });

      } else {
        // CREATE operation
        const { password } = values;
        if (!password) {
          toast({ title: "Erro de Validação", description: "Senha é obrigatória para novos usuários.", variant: "destructive" });
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: values.name });

        await setDoc(doc(db, 'users', user.uid), {
          name: values.name,
          email: values.email,
          roleId: values.roleId,
          schoolId: values.schoolId || null,
        });
        toast({ title: "Usuário criado com sucesso!" });
      }

      setUserModalOpen(false);
      setEditingUser(null);
      userForm.reset();

    } catch (error: any) {
      console.error("Error saving user:", error);
      let message = "Ocorreu um erro desconhecido ao salvar o usuário.";
      if (error.code === 'auth/email-already-in-use') {
        message = "Este email já está em uso por outra conta.";
      }
      toast({
        title: "Erro ao Salvar",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const handleSave = async () => {
    const isValid = await userForm.trigger();
    if (isValid) {
      const values = userForm.getValues();
      await onUserSubmit(values);
    } else {
      toast({
        title: "Formulário Inválido",
        description: "Por favor, corrija os erros antes de salvar.",
        variant: "destructive",
      });
    }
  };


  const onRoleSubmit = async (values: z.infer<typeof roleSchema>) => {
    if(!db) return;
    toast({ title: `Salvando perfil...` });
    try {
        if (editingRole) {
            const roleRef = doc(db, 'roles', editingRole.id);
            await setDoc(roleRef, values, { merge: true });
        } else {
            const docRef = doc(collection(db, 'roles'));
            await setDoc(docRef, {...values, id: docRef.id });
        }
        setRoleModalOpen(false);
        setEditingRole(null);
        roleForm.reset({ name: "", permissions: [] });
        toast({ title: `Perfil ${editingRole ? 'atualizado' : 'criado'} com sucesso!` });
    } catch(e) {
         toast({ title: "Erro ao salvar perfil", variant: "destructive"});
    }
  };
  
  const roleName = userForm.watch('roleId') ? roles.find(r => r.id === userForm.watch('roleId'))?.name : '';

  return (
    <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
            <TabsTrigger value="roles">Gerenciar Perfis</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Usuários</CardTitle>
                            <CardDescription>Adicione, edite e remova usuários do sistema.</CardDescription>
                        </div>
                         <Button onClick={() => handleOpenUserModal(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <UsersTable users={users} roles={roles} schools={schools} onEdit={handleEditUser} onDelete={handleDeleteUser} onResetPassword={handleResetPassword} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Perfis de Acesso</CardTitle>
                            <CardDescription>Crie perfis e defina as permissões de cada um.</CardDescription>
                        </div>
                        <Button onClick={() => { setEditingRole(null); roleForm.reset({ name: "", permissions: [] }); setRoleModalOpen(true);}}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Perfil
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <RolesTable roles={roles} onEdit={handleEditRole} onDelete={handleDeleteRole} />
                </CardContent>
            </Card>
        </TabsContent>

        {/* User Modal */}
        <Dialog open={isUserModalOpen} onOpenChange={setUserModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Editar' : 'Novo'} Usuário</DialogTitle>
                     <DialogDescription>
                        Preencha os detalhes do usuário abaixo. A senha só é necessária ao criar um novo usuário.
                    </DialogDescription>
                </DialogHeader>
                <Form {...userForm}>
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <FormField control={userForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={userForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled={!!editingUser} /></FormControl><FormMessage /></FormItem>
                        )} />
                        {!editingUser && (
                            <FormField control={userForm.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                        <FormField control={userForm.control} name="roleId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Perfil</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {roles.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {roleName === 'Unidade Educacional' && (
                           <FormField control={userForm.control} name="schoolId" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Unidade Educacional</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value
                                                    ? schools.find(
                                                        (school) => school.id === field.value
                                                    )?.name
                                                    : "Selecione uma escola"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar escola..." />
                                                <CommandList>
                                                    <CommandEmpty>Nenhuma escola encontrada.</CommandEmpty>
                                                    <CommandGroup>
                                                        {schools.map((school) => (
                                                        <CommandItem
                                                            value={school.name}
                                                            key={school.id}
                                                            onSelect={() => {
                                                                field.onChange(school.id);
                                                            }}
                                                        >
                                                            <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                school.id === field.value
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                            )}
                                                            />
                                                            {school.name}
                                                        </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>Associe este usuário a uma escola específica.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                            <Button type="button" onClick={handleSave}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Role Modal */}
        <Dialog open={isRoleModalOpen} onOpenChange={setRoleModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingRole ? 'Editar' : 'Novo'} Perfil</DialogTitle>
                </DialogHeader>
                <Form {...roleForm}>
                    <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
                        <FormField control={roleForm.control} name="name" render={({ field }) => (
                             <FormItem><FormLabel>Nome do Perfil</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                            control={roleForm.control}
                            name="permissions"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Permissões da Seção</FormLabel>
                                    <div className="grid grid-cols-2 gap-4">
                                        {formSections.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={roleForm.control}
                                                name="permissions"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                        : field.onChange((field.value || []).filter((value) => value !== item.id))
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </Tabs>
  );
}

function UsersTable({ users, roles, schools, onEdit, onDelete, onResetPassword }: { users: UserProfile[], roles: Role[], schools: School[], onEdit: (user: UserProfile) => void, onDelete: (id: string) => void, onResetPassword: (email: string) => void }) {
    const roleMap = new Map(roles.map(r => [r.id, r.name]));
    const schoolMap = new Map(schools.map(s => [s.id, s.name]));

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{roleMap.get(user.roleId) || 'N/A'}</TableCell>
                        <TableCell>{(user.schoolId && schoolMap.get(user.schoolId)) || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(user)}>Editar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onResetPassword(user.email)}>Redefinir Senha</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(user.id)}>Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function RolesTable({ roles, onEdit, onDelete }: { roles: Role[], onEdit: (role: Role) => void, onDelete: (id: string) => void }) {
    const permissionLabels = new Map(formSections.map(s => [s.id, s.label]));

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome do Perfil</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {roles.map(role => (
                    <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-muted-foreground">{role.permissions.map(p => permissionLabels.get(p) || p).join(', ')}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(role)}>Editar</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(role.id)}>Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
