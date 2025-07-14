
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Role, FormSection } from "@/types";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';


const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do perfil é obrigatório."),
  permissions: z.array(z.string()).min(1, "Selecione ao menos uma permissão."),
});

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do usuário é obrigatório."),
  email: z.string().email("Email inválido."),
  roleId: z.string().min(1, "Selecione um perfil."),
});

const formSections: { id: FormSection; label: string }[] = [
    { id: 'general', label: 'Dados Gerais' },
    { id: 'infrastructure', label: 'Infraestrutura' },
    { id: 'technology', label: 'Tecnologia' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'maintenance', label: 'Manutenção' },
    { id: 'users', label: 'Gerenciar Usuários' },
];

export function UserManagementClient() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!db) return;
    
    const usersUnsub = onSnapshot(collection(db, 'users'), snapshot => {
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
    });

    const rolesUnsub = onSnapshot(collection(db, 'roles'), snapshot => {
        setRoles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Role)));
    });

    return () => {
        usersUnsub();
        rolesUnsub();
    };
  }, []);

  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissions: [] },
  });

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", roleId: "" },
  });

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    userForm.reset(user);
    setUserModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    roleForm.reset(role);
    setRoleModalOpen(true);
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (!db) return;
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
    if(!db) return;
    toast({ title: `Salvando usuário...` });
    // In a real app, creating a user would happen via Firebase Auth,
    // and this would just manage their profile data in Firestore.
    try {
        if (editingUser) {
            const userRef = doc(db, 'users', editingUser.id);
            await setDoc(userRef, values, { merge: true });
        } else {
            await addDoc(collection(db, 'users'), values);
        }
        setUserModalOpen(false);
        setEditingUser(null);
        userForm.reset({ name: "", email: "", roleId: "" });
        toast({ title: `Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!` });
    } catch (e) {
        toast({ title: "Erro ao salvar usuário", variant: "destructive"});
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
            await addDoc(collection(db, 'roles'), values);
        }
        setRoleModalOpen(false);
        setEditingRole(null);
        roleForm.reset({ name: "", permissions: [] });
        toast({ title: `Perfil ${editingRole ? 'atualizado' : 'criado'} com sucesso!` });
    } catch(e) {
         toast({ title: "Erro ao salvar perfil", variant: "destructive"});
    }
  };

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
                         <Button onClick={() => { setEditingUser(null); userForm.reset({ name: "", email: "", roleId: "" }); setUserModalOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <UsersTable users={users} roles={roles} onEdit={handleEditUser} onDelete={handleDeleteUser} />
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
                        A criação de usuário aqui apenas cria um perfil no banco de dados. A autenticação real deve ser gerenciada no painel do Firebase.
                    </DialogDescription>
                </DialogHeader>
                <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                        <FormField control={userForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={userForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <FormField control={userForm.control} name="roleId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Perfil</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {roles.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
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

function UsersTable({ users, roles, onEdit, onDelete }: { users: UserProfile[], roles: Role[], onEdit: (user: UserProfile) => void, onDelete: (id: string) => void }) {
    const roleMap = new Map(roles.map(r => [r.id, r.name]));
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{roleMap.get(user.roleId) || 'N/A'}</TableCell>
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
                        <TableCell className="text-muted-foreground">{role.permissions.join(', ')}</TableCell>
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
