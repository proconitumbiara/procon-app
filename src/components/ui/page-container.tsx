import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export const PageContainer = ({ children, className }: PageContainerProps) => {
  return (
    <div className={`w-full space-y-6 p-6 ${className ?? ""}`}>{children}</div>
  );
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full items-center justify-between">{children}</div>
  );
};

export const PageHeaderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="w-full space-y-1">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-2xl font-bold">{children}</div>;
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="text-muted-foreground text-sm">{children}</div>;
};

export const PageActions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export const PageContent = ({ children, className }: PageContentProps) => {
  return <div className={`space-y-6 ${className ?? ""}`}>{children}</div>;
};
