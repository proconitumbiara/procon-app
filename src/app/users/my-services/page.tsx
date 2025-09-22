import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageActions, PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import ServicesPerformed from "./_components/services-performed";


const MyServices = async () => {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/");
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Olá, {session.user.name}!</PageTitle>
                    <PageDescription>Veja os atendimentos que você realizou.</PageDescription>
                </PageHeaderContent>
                <PageActions>
                    <></>
                </PageActions>
            </PageHeader>
            <PageContent>
                <ServicesPerformed userId={session.user.id} />
            </PageContent>
        </PageContainer>
    );
}

export default MyServices;