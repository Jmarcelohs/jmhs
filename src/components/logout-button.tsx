import { signOut } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm text-white/70 hover:text-white"
      >
        Sair
      </button>
    </form>
  );
}
