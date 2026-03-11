import { PageContainer, PageContent, PageHeader, PageHeaderContent } from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConsumidoresLoading() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <Skeleton className="h-96 w-full rounded-xl" />
      </PageContent>
    </PageContainer>
  );
}
