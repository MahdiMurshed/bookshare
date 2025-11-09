import { Link, useNavigate } from "react-router-dom";
import { SignUpForm } from "../components/auth/SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

export function SignUp() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to sign in after successful sign up
    // (User needs to verify email or can auto-sign in depending on your flow)
    navigate("/signin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Enter your information to create your BookShare account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm onSuccess={handleSuccess} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
