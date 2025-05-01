import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignupInputState, userSignupSchema } from "@/schema/userSchema";
import { useUserStore } from "@/store/useUserStore";
import {
  Loader2,
  LockKeyhole,
  Mail,
  PhoneOutgoing,
  User
} from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [input, setInput] = useState<SignupInputState>({
    fullname: "",
    email: "",
    password: "",
    contact: ""
  });
  const [errors, setErrors] = useState<Partial<SignupInputState>>({});
  const { signup } = useUserStore();
  const navigate = useNavigate();

  const changeEventHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const signupSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    const result = userSignupSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<SignupInputState>);
      return;
    }
    setErrors({});
    try{
      await signup(input);
      navigate("/verify-password");
    } catch(error){
      console.log(error);
    }
    
  };
const loading =false;


  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={signupSubmitHandler}
        className="md:p-8 w-full max-w-md rounded-lg md:border border-gray-200 mx-4"
      >
        <div className="mb-4">
          <h1 className="font-bold text-2xl">TejasEats</h1>
        </div>

        {[
          {
            name: "fullname",
            type: "text",
            placeholder: "Full Name",
            icon: <User className="absolute inset-y-2 left-2 text-gray-500 pointer-events-none" />
          },
          {
            name: "email",
            type: "email",
            placeholder: "Email",
            icon: <Mail className="absolute inset-y-2 left-2 text-gray-500 pointer-events-none" />
          },
          {
            name: "password",
            type: "password",
            placeholder: "Password",
            icon: <LockKeyhole className="absolute inset-y-2 left-2 text-gray-500 pointer-events-none" />
          },
          {
            name: "contact",
            type: "text",
            placeholder: "Contact",
            icon: <PhoneOutgoing className="absolute inset-y-2 left-2 text-gray-500 pointer-events-none" />
          }
        ].map(({ name, type, placeholder, icon }) => (
          <div className="mb-4" key={name}>
            <div className="relative">
              <Input
                type={type}
                placeholder={placeholder}
                name={name}
                value={input[name as keyof SignupInputState]}
                onChange={changeEventHandler}
                className="pl-10 focus-visible:ring-1"
              />
              {icon}
              {errors[name as keyof SignupInputState] && (
                <span className="text-xs text-red-500">
                  {errors[name as keyof SignupInputState]}
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="mb-10">
          {loading ? (
            <Button disabled className="w-full bg-orange-500 hover:bg-hoverOrange">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full bg-orange-500 hover:bg-hoverOrange">
              Signup
            </Button>
          )}
        </div>

        <Separator />
        <p className="mt-2 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
