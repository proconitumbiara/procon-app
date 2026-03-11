import { PageContainer, PageContent, PageHeader, PageHeaderContent } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AtendimentoLoading() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="flex gap-2 w-full h-full">
          <Skeleton className="h-40 flex-1 rounded-xl" />
          <Skeleton className="h-40 flex-1 rounded-xl" />
        </div>
        <div className="flex gap-2 w-full h-full items-center justify-center mt-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </PageContent>
    </PageContainer>
  );
}
