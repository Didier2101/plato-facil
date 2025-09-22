import { loginAction } from "@/src/actions/login/actions";
import Login from "@/src/components/auth/Login";


export default function LoginPage() {
  return <Login loginAction={loginAction} />;
}
