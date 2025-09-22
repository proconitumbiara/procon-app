export const PageContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full p-6 space-y-6">
            {children}
        </div>
    );
}

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col w-full ">
            {children}
        </div>
    );
}

export const PageHeaderContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full space-y-1">
            {children}
        </div>
    );
}

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="text-2xl font-bold">
            {children}
        </div>
    );
}

export const PageDescription = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="text-sm text-muted-foreground">
            {children}
        </div>
    );
}

export const PageActions = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex items-center gap-2">
            {children}
        </div>
    );
}

export const PageContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="space-y-6">
            {children}
        </div>
    );
}