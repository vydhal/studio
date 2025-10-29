

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Role, FormSectionPermission, School } from "@/types";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';


const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do perfil é obrigatório."),
  permissions: z.array(z.string()).min(1, "Selecione ao menos uma permissão."),
});

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do usuário é obrigatório."),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional(),
  roleId: z.string().min(1, "Selecione um perfil."),
  schoolId: z.string().optional(),
}).refine(data => data.id || data.password, {
    message: "A senha é obrigatória para novos usuários.",
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

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    roleForm.reset(role);
    setRoleModalOpen(true);
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!db) return;
    // Note: This only deletes the Firestore record.
    // For a production app, you'd want a Cloud Function to delete the Auth user too.
    await deleteDoc(doc(db, "users", userId));
    toast({ title: "Usuário excluído com sucesso." });
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!db) return;
    // TODO: Check if role is in use before deleting
    await deleteDoc(doc(db, "roles", roleId));
    toast({ title: "Perfil excluído com sucesso." });
  }

  const onUserSubmit = async (values: z.infer<typeof userSchema>) => {
    console.log("Submit button clicked. Form values:", values);
    if(!db) {
        console.error("Firestore DB instance is not available.");
        toast({ title: "Erro de Conexão", description: "Ocorreu um problema com o banco de dados.", variant: "destructive" });
        return;
    }
    toast({ title: `Salvando usuário...` });
    
    try {
        if (editingUser && editingUser.id) {
            console.log("Attempting to EDIT user with ID:", editingUser.id);
            const userRef = doc(db, 'users', editingUser.id);
            await updateDoc(userRef, { 
              name: values.name, 
              roleId: values.roleId,
              schoolId: values.schoolId || null,
            });
            console.log("User updated successfully.");
            toast({ title: "Usuário atualizado com sucesso!" });

        } else {
            console.log("Attempting to CREATE new user with email:", values.email);
            const { password } = values;
            if (!password) {
                toast({ title: "Erro de Validação", description: "Senha é obrigatória para novos usuários.", variant: "destructive"});
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: values.name });
            console.log("Firebase Auth user created.");

            await setDoc(doc(db, 'users', user.uid), {
              name: values.name, 
              email: values.email, 
              roleId: values.roleId,
              schoolId: values.schoolId || null,
            });
            console.log("Firestore user profile created.");
            toast({ title: "Usuário criado com sucesso!" });
        }
        setUserModalOpen(false);
        setEditingUser(null);
        userForm.reset();

    } catch (e: any) {
        console.error("User submit error:", e);
        let message = "Erro ao salvar usuário";
        if (e.code === 'auth/email-already-in-use') {
            message = "Este email já está sendo utilizado por outro usuário.";
        }
        toast({ title: message, description: e.message, variant: "destructive"});
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
                    <UsersTable users={users} roles={roles} schools={schools} onEdit={handleEditUser} onDelete={handleDeleteUser} />
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
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
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
                                <FormItem>
                                    <FormLabel>Unidade Educacional</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma escola" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {schools.map(school => <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Associe este usuário a uma escola específica.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                            <Button type="submit">Salvar</Button>
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

function UsersTable({ users, roles, schools, onEdit, onDelete }: { users: UserProfile[], roles: Role[], schools: School[], onEdit: (user: UserProfile) => void, onDelete: (id: string) => void }) {
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
