import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

async function logoutAction() {
  "use server";
  clearSession();
  redirect("/login");
}

export function UserMenu({ user }: { user: { name: string | null; email: string; role: string } }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <ThemeToggle />
      <div className="text-right hidden sm:block">
        <div className="font-medium" style={{ color: "var(--text-primary)" }}>{user.name || user.email}</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{user.role.toLowerCase()}</div>
      </div>
      <form action={logoutAction}>
        <button className="transition-colors" style={{ color: "var(--text-secondary)" }}>Logout</button>
      </form>
    </div>
  );
}
