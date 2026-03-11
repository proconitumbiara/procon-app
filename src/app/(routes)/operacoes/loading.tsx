import { PageContainer, PageContent, PageHeader, PageHeaderContent } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function OperacoesLoading() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <Skeleton className="h-64 w-full rounded-xl" />
      </PageContent>
    </PageContainer>
  );
}
