import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/ui/access-denied";
import { PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import UserCard from "./_components/user-card";

const AdminsProfessionals = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/")
    }

    const [user, users] = await Promise.all([
        db.query.usersTable.findFirst({
            where: eq(usersTable.id, session.user.id),
        }),
        db.query.usersTable.findMany({
            where: (row) => eq(row.role, "professional"),
        }),
    ]);

    if (user?.role !== "administrator") {
        return <AccessDenied />
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Profissionais</PageTitle>
                    <PageDescription>Gerencie os profissionais da sua empresa.</PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent>
                <div className="grid grid-cols-5 gap-6">
                    {users.map(user => <UserCard key={user.id} user={user} />)}
                </div>
            </PageContent>
        </PageContainer>
    );
}

export default AdminsProfessionals;