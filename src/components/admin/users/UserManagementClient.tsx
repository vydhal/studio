
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, Role, FormSection } from "@/types";
import { PlusCircle, Edit, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do perfil é obrigatório."),
  permissions: z.array(z.string()).min(1, "Selecione ao menos uma permissão."),
});

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome do usuário é obrigatório."),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").optional(),
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

interface UserManagementClientProps {
    initialUsers: UserProfile[];
    initialRoles: Role[];
}

export function UserManagementClient({ initialUsers, initialRoles }: UserManagementClientProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

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

  const onUserSubmit = (values: z.infer<typeof userSchema>) => {
    console.log("Saving user:", values);
    toast({ title: `Usuário ${editingUser ? 'atualizado' : 'criado'} com sucesso!` });
    // This would be an API call in a real app
    if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...values } : u));
    } else {
        setUsers([...users, { ...values, id: `user${users.length + 1}` }]);
    }
    setUserModalOpen(false);
    setEditingUser(null);
    userForm.reset({ name: "", email: "", roleId: "" });
  };

  const onRoleSubmit = (values: z.infer<typeof roleSchema>) => {
    console.log("Saving role:", values);
    toast({ title: `Perfil ${editingRole ? 'atualizado' : 'criado'} com sucesso!` });
    if (editingRole) {
        setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...values } : r));
    } else {
        setRoles([...roles, { ...values, id: `role${roles.length + 1}` }]);
    }
    setRoleModalOpen(false);
    setEditingRole(null);
    roleForm.reset({ name: "", permissions: [] });
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
                    <UsersTable users={users} roles={roles} onEdit={handleEditUser} />
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
                    <RolesTable roles={roles} onEdit={handleEditRole} />
                </CardContent>
            </Card>
        </TabsContent>

        {/* User Modal */}
        <Dialog open={isUserModalOpen} onOpenChange={setUserModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingUser ? 'Editar' : 'Novo'} Usuário</DialogTitle>
                </DialogHeader>
                <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                        <FormField control={userForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={userForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField
                          control={userForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder={editingUser ? 'Deixe em branco para não alterar' : '••••••••'}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                                                        ? field.onChange([...field.value, item.id])
                                                                        : field.onChange(field.value?.filter((value) => value !== item.id))
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

function UsersTable({ users, roles, onEdit }: { users: UserProfile[], roles: Role[], onEdit: (user: UserProfile) => void }) {
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
                                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function RolesTable({ roles, onEdit }: { roles: Role[], onEdit: (role: Role) => void }) {
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
                                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
