import { signOut } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        Sair
      </button>
    </form>
  );
}
