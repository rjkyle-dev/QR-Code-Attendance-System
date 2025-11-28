import AuthLayoutTemplate from '@/layouts/auth/auth-card-layout';

export default function EmployeeAuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
         <div className="auth-bg flex min-h-svh flex-col items-center justify-center p-6 md:p-10 text-white">
      <div className="w-full max-w-sm md:max-w-3xl text-white">
        {/* <LoginForm /> */}
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
        </AuthLayoutTemplate>
      </div>
    </div>
    );
}
