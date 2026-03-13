import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConsumerDetailLoading() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-8 w-64" />
          <Skeleton className="mt-1 h-4 w-80" />
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <Skeleton className="h-96 w-full rounded-xl" />
      </PageContent>
    </PageContainer>
  );
}
